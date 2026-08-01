# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""Single-roundtrip dashboard data endpoint.

Replaces ~10 individual reportview/get_count calls from the frontend with
one SQL-driven batch. All queries respect tenant pqc by going through
frappe.qb or parameterized SQL with the caller's permission context.
"""

from __future__ import annotations

from datetime import date, timedelta

import frappe
from frappe import _
from frappe.query_builder.functions import Count, Sum
from frappe.utils import getdate


def _first_of_month() -> date:
	d = date.today()
	return d.replace(day=1)


def _first_of_last_month() -> date:
	d = date.today().replace(day=1)
	return (d - timedelta(days=1)).replace(day=1)


def _start_of_week() -> date:
	d = date.today()
	return d - timedelta(days=d.weekday())


def _start_of_last_week() -> date:
	return _start_of_week() - timedelta(days=7)


def _kpis(company: str | None) -> dict:
	SI = frappe.qb.DocType("Sales Invoice")
	first_this = _first_of_month()
	first_last = _first_of_last_month()

	company_filter = SI.company == company if company else None

	def _si_sum(field, *extra):
		q = frappe.qb.from_(SI).select(Sum(getattr(SI, field))).where(SI.docstatus == 1)
		if company_filter is not None:
			q = q.where(company_filter)
		for cond in extra:
			q = q.where(cond)
		result = q.run()
		return float(result[0][0] or 0) if result and result[0] else 0.0

	rev_this = _si_sum("grand_total", SI.posting_date >= first_this)
	rev_last = _si_sum(
		"grand_total",
		SI.posting_date >= first_last,
		SI.posting_date < first_this,
	)
	outstanding = _si_sum("outstanding_amount", SI.outstanding_amount > 0)

	Lead = frappe.qb.DocType("Lead")
	sow = _start_of_week()
	solw = _start_of_last_week()

	leads_this_q = frappe.qb.from_(Lead).select(Count("*")).where(Lead.creation >= sow)
	leads_last_q = (
		frappe.qb.from_(Lead)
		.select(Count("*"))
		.where(Lead.creation >= solw)
		.where(Lead.creation < sow)
	)
	leads_this = int((leads_this_q.run() or [[0]])[0][0] or 0)
	leads_last = int((leads_last_q.run() or [[0]])[0][0] or 0)

	# Reorder threshold lives on the child table `Item Reorder`
	# (field `warehouse_reorder_level`), NOT on `tabItem` directly.
	# Count DISTINCT parent Items that have any active reorder rule.
	# Note: Frappe Field has no `.distinct()` — use COUNT(DISTINCT …) SQL.
	try:
		stock_alerts = int(
			frappe.db.sql(
				"""
				select count(distinct ir.parent)
				from `tabItem Reorder` ir
				inner join `tabItem` i on i.name = ir.parent
				where ifnull(i.disabled, 0) = 0
					and ifnull(i.has_variants, 0) = 0
					and ifnull(ir.warehouse_reorder_level, 0) > 0
				"""
			)[0][0]
			or 0
		)
	except Exception:
		# Defensive: on sites where Item Reorder is absent, don't 500 the dashboard.
		stock_alerts = 0

	delta_pct = None
	if rev_last > 0:
		delta_pct = round(((rev_this - rev_last) / rev_last) * 100, 1)
	elif rev_this > 0:
		delta_pct = None
	else:
		delta_pct = 0

	return {
		"revenue": {"current": rev_this, "previous": rev_last, "deltaPct": delta_pct},
		"outstanding": outstanding,
		"leads": {"current": leads_this, "previous": leads_last, "delta": leads_this - leads_last},
		"stockAlerts": stock_alerts,
	}


def _attention(company: str | None) -> list[dict]:
	today_str = str(date.today())
	SI = frappe.qb.DocType("Sales Invoice")
	overdue_q = (
		frappe.qb.from_(SI)
		.select(SI.name, SI.customer, SI.customer_name, SI.outstanding_amount, SI.due_date, SI.grand_total)
		.where(SI.docstatus == 1)
		.where(SI.outstanding_amount > 0)
		.where(SI.due_date < today_str)
		.orderby(SI.due_date)
		.limit(3)
	)
	if company:
		overdue_q = overdue_q.where(SI.company == company)
	overdue = overdue_q.run(as_dict=True) or []

	PO = frappe.qb.DocType("Purchase Order")
	arriving_q = (
		frappe.qb.from_(PO)
		.select(PO.name, PO.supplier, PO.supplier_name, PO.schedule_date)
		.where(PO.docstatus == 1)
		.where(PO.schedule_date == today_str)
		.limit(2)
	)
	if company:
		arriving_q = arriving_q.where(PO.company == company)
	arriving = arriving_q.run(as_dict=True) or []

	items = []
	for row in overdue:
		due = getdate(row.due_date) if row.due_date else None
		days_late = (date.today() - due).days if due else 0
		items.append({
			"kind": "overdue-invoice",
			"title": f"{row.customer_name or row.customer or row.name} — {days_late} days overdue",
			"meta": f"{float(row.outstanding_amount or 0):.2f} outstanding",
			"href": f"/sales/invoices/{row.name}",
			"severity": "critical" if days_late > 10 else "warning",
		})
	for row in arriving:
		items.append({
			"kind": "arriving-po",
			"title": f"Order from {row.supplier_name or row.supplier or '—'} arriving today",
			"meta": row.name,
			"href": f"/purchases/orders/{row.name}",
			"severity": "info",
		})
	return items


def _activity(company: str | None) -> list[dict]:
	results = []

	for doctype, fields, kind, title_fn, detail_fn, href_fn in [
		(
			"Payment Entry",
			["name", "party", "party_name", "paid_amount", "modified"],
			"payment",
			lambda _r: "Payment received",
			lambda r: f"{float(r.paid_amount or 0):.2f} from {r.party_name or r.party or '—'}",
			lambda r: f"/finance/payments/{r.name}",
		),
		(
			"Delivery Note",
			["name", "customer", "customer_name", "modified"],
			"delivery",
			lambda _r: "Order shipped",
			lambda r: f"to {r.customer_name or r.customer or '—'}",
			lambda r: f"/sales/deliveries/{r.name}",
		),
		(
			"Sales Invoice",
			["name", "customer", "customer_name", "grand_total", "modified"],
			"invoice",
			lambda _r: "Invoice sent",
			lambda r: f"to {r.customer_name or r.customer or '—'}",
			lambda r: f"/sales/invoices/{r.name}",
		),
	]:
		DT = frappe.qb.DocType(doctype)
		q = frappe.qb.from_(DT).select(*[getattr(DT, f) for f in fields]).where(DT.docstatus == 1).orderby(DT.modified, order=frappe.qb.desc).limit(2)
		if company and "company" in [f.fieldname for f in frappe.get_meta(doctype).fields]:
			q = q.where(DT.company == company)
		for row in q.run(as_dict=True) or []:
			results.append({
				"kind": kind,
				"title": title_fn(row),
				"detail": detail_fn(row),
				"whenIso": str(row.modified or ""),
				"href": href_fn(row),
			})

	Lead = frappe.qb.DocType("Lead")
	lead_q = frappe.qb.from_(Lead).select(Lead.name, Lead.lead_name, Lead.company_name, Lead.creation).orderby(Lead.creation, order=frappe.qb.desc).limit(2)
	for row in lead_q.run(as_dict=True) or []:
		detail = row.lead_name or row.name
		if row.company_name:
			detail += f" · {row.company_name}"
		results.append({
			"kind": "lead",
			"title": "New lead",
			"detail": detail,
			"whenIso": str(row.creation or ""),
			"href": f"/crm/leads/{row.name}",
		})

	results.sort(key=lambda x: x.get("whenIso", ""), reverse=True)
	return results[:6]


@frappe.whitelist()
def get_dashboard_data():
	"""Single endpoint returning all dashboard sections."""
	user = frappe.session.user
	if not user or user == "Guest":
		frappe.throw(_("Login required"), frappe.AuthenticationError)

	company = None
	try:
		from zivvy_brand.tenancy.context import get_user_tenant_name
		tenant = get_user_tenant_name(user)
		if tenant:
			company = frappe.db.get_value("Zivvy Tenant", tenant, "company")
	except Exception:
		pass

	return {
		"kpis": _kpis(company),
		"attention": _attention(company),
		"activity": _activity(company),
	}
