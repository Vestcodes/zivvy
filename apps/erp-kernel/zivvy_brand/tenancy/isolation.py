# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""Data isolation: permission_query_conditions + has_permission for tenants.

User Permissions on Company cover company-linked docs (SO, Invoice, …).
Customer / Lead / Item etc. have no Company field — we stamp `zivvy_tenant`
and enforce via these hooks.
"""

from __future__ import annotations

import frappe

from zivvy_brand.tenancy import TENANT_DOCTYPE, TENANT_FIELD
from zivvy_brand.tenancy.binding import TENANT_SCOPED_DOCTYPES
from zivvy_brand.tenancy.context import get_user_tenant_name, is_ops_user


COMPANY_SCOPED_DOCTYPES = (
	"Sales Order",
	"Sales Invoice",
	"Purchase Order",
	"Purchase Invoice",
	"Delivery Note",
	"Purchase Receipt",
	"Stock Entry",
	"GL Entry",
	"Stock Ledger Entry",
	"Journal Entry",
	"Payment Entry",
	"Employee",
	"Payroll Entry",
	"Salary Slip",
	"Attendance",
	"Leave Application",
	"Timesheet",
	"Project",
	"Task",
	"Warehouse",
	"Account",
	"Cost Center",
	"Department",
	"Sales Taxes and Charges Template",
	"Purchase Taxes and Charges Template",
	"Item Tax Template",
	"Bank Account",
	"Budget",
	"Asset",
	"Asset Movement",
	"Asset Repair",
	"Holiday List",
	"Leave Period",
	"Leave Policy Assignment",
	"Expense Claim",
	"Loan",
	"Loan Repayment",
	"Loan Disbursement",
)


def _sql_quote(value: str) -> str:
	return frappe.db.escape(value)


def _tenant_companies(user: str) -> list[str]:
	"""Return the list of companies the user's tenant owns."""
	tenant = get_user_tenant_name(user)
	if not tenant:
		companies = frappe.get_all(
			"User Permission",
			filters={"user": user, "allow": "Company"},
			pluck="for_value",
		)
		return companies or []
	company = frappe.db.get_value(TENANT_DOCTYPE, tenant, "company")
	return [company] if company else []


def pqc_company(user: str | None = None) -> str | None:
	user = user or frappe.session.user
	if not user or user == "Guest":
		return "1=0"
	if is_ops_user(user):
		return None
	companies = _tenant_companies(user)
	if not companies:
		return "1=0"
	if len(companies) == 1:
		return f"`tabCompany`.name = {_sql_quote(companies[0])}"
	vals = ", ".join(_sql_quote(c) for c in companies)
	return f"`tabCompany`.name in ({vals})"


def pqc_company_scoped(doctype: str, user: str | None = None) -> str | None:
	"""Filter any Company-linked doctype by the caller's tenant companies.

	This runs independently of User Permission on Company, so a missing or
	stale UP no longer implies a data leak.
	"""
	user = user or frappe.session.user
	if not user or user == "Guest":
		return "1=0"
	if is_ops_user(user):
		return None
	if not frappe.get_meta(doctype).has_field("company"):
		return None
	companies = _tenant_companies(user)
	if not companies:
		return "1=0"
	if len(companies) == 1:
		return f"`tab{doctype}`.company = {_sql_quote(companies[0])}"
	vals = ", ".join(_sql_quote(c) for c in companies)
	return f"`tab{doctype}`.company in ({vals})"


def pqc_user(user: str | None = None) -> str | None:
	user = user or frappe.session.user
	if not user or user == "Guest":
		return "1=0"
	if is_ops_user(user):
		return None
	tenant = get_user_tenant_name(user)
	if not tenant or not frappe.db.has_column("User", TENANT_FIELD):
		return f"`tabUser`.name = {_sql_quote(user)}"
	return (
		f"(`tabUser`.`{TENANT_FIELD}` = {_sql_quote(tenant)} "
		f"or `tabUser`.name = {_sql_quote(user)})"
	)


def pqc_zivvy_tenant(user: str | None = None) -> str | None:
	user = user or frappe.session.user
	if not user or user == "Guest":
		return "1=0"
	if is_ops_user(user):
		return None
	tenant = get_user_tenant_name(user)
	if not tenant:
		return "1=0"
	return f"`tabZivvy Tenant`.name = {_sql_quote(tenant)}"


def pqc_tenant_scoped(doctype: str, user: str | None = None) -> str | None:
	user = user or frappe.session.user
	if not user or user == "Guest":
		return "1=0"
	if is_ops_user(user):
		return None
	# Meta says the field is declared…
	if not frappe.get_meta(doctype).has_field(TENANT_FIELD):
		return "1=0"
	# …but on Postgres the Custom Field ALTER TABLE may not have run yet.
	# Without this guard, Frappe emits `WHERE "tabDoctype"."zivvy_tenant" = …`
	# and the query raises UndefinedColumn / hard 500. Deny by default when the
	# schema hasn't caught up — an ops task can then run
	# `ensure_tenant_link_fields` + `bench migrate` to materialize the column.
	try:
		# Pass DocType name (not `tab…` table name) — Frappe resolves the
		# physical table. Passing `tabCustomer` raises DoesNotExistError on
		# Postgres, which previously fell into the except → deny-all path and
		# emptied Customer/Supplier lists for every tenant user.
		if not frappe.db.has_column(doctype, TENANT_FIELD):
			try:
				frappe.log_error(
					f"pqc_tenant_scoped: {doctype} missing column `{TENANT_FIELD}`; denying by default.",
					"Zivvy tenancy schema drift",
				)
			except Exception:
				pass
			return "1=0"
	except Exception:
		# has_column itself failed — be safe and deny.
		return "1=0"
	tenant = get_user_tenant_name(user)
	if not tenant:
		return "1=0"
	return f"`tab{doctype}`.`{TENANT_FIELD}` = {_sql_quote(tenant)}"


# Explicit per-DocType hooks (Frappe imports by dotted path — must exist as attributes)
def pqc_customer(user=None):
	return pqc_tenant_scoped("Customer", user)


def pqc_lead(user=None):
	return pqc_tenant_scoped("Lead", user)


def pqc_opportunity(user=None):
	return pqc_tenant_scoped("Opportunity", user)


def pqc_contact(user=None):
	return pqc_tenant_scoped("Contact", user)


def pqc_address(user=None):
	return pqc_tenant_scoped("Address", user)


def pqc_supplier(user=None):
	return pqc_tenant_scoped("Supplier", user)


def pqc_item(user=None):
	return pqc_tenant_scoped("Item", user)


def pqc_item_price(user=None):
	return pqc_tenant_scoped("Item Price", user)


def pqc_item_group(user=None):
	return pqc_tenant_scoped("Item Group", user)


def pqc_blog_post(user=None):
	return pqc_tenant_scoped("Blog Post", user)


def pqc_comment(user=None):
	return pqc_tenant_scoped("Comment", user)


def pqc_note(user=None):
	return pqc_tenant_scoped("Note", user)


def pqc_todo(user=None):
	return pqc_tenant_scoped("ToDo", user)


def pqc_communication(user=None):
	return pqc_tenant_scoped("Communication", user)


def pqc_zivvy_role_template(user=None):
	return pqc_tenant_scoped("Zivvy Role Template", user)


# Helpdesk tenant-scoped wrappers
def pqc_hd_ticket(user=None):
	return pqc_tenant_scoped("HD Ticket", user)


def pqc_hd_article(user=None):
	return pqc_tenant_scoped("HD Article", user)


def pqc_hd_team(user=None):
	return pqc_tenant_scoped("HD Team", user)


def pqc_hd_ticket_type(user=None):
	return pqc_tenant_scoped("HD Ticket Type", user)


def pqc_hd_ticket_priority(user=None):
	return pqc_tenant_scoped("HD Ticket Priority", user)


def pqc_hd_service_level_agreement(user=None):
	return pqc_tenant_scoped("HD Service Level Agreement", user)


# Company-scoped pqc wrappers (needed as named attributes for Frappe hook import)
def pqc_sales_order(user=None):
	return pqc_company_scoped("Sales Order", user)


def pqc_sales_invoice(user=None):
	return pqc_company_scoped("Sales Invoice", user)


def pqc_purchase_order(user=None):
	return pqc_company_scoped("Purchase Order", user)


def pqc_purchase_invoice(user=None):
	return pqc_company_scoped("Purchase Invoice", user)


def pqc_delivery_note(user=None):
	return pqc_company_scoped("Delivery Note", user)


def pqc_purchase_receipt(user=None):
	return pqc_company_scoped("Purchase Receipt", user)


def pqc_stock_entry(user=None):
	return pqc_company_scoped("Stock Entry", user)


def pqc_gl_entry(user=None):
	return pqc_company_scoped("GL Entry", user)


def pqc_stock_ledger_entry(user=None):
	return pqc_company_scoped("Stock Ledger Entry", user)


def pqc_journal_entry(user=None):
	return pqc_company_scoped("Journal Entry", user)


def pqc_payment_entry(user=None):
	return pqc_company_scoped("Payment Entry", user)


def pqc_employee(user=None):
	return pqc_company_scoped("Employee", user)


def pqc_project(user=None):
	return pqc_company_scoped("Project", user)


def pqc_task(user=None):
	return pqc_company_scoped("Task", user)


def pqc_payroll_entry(user=None):
	return pqc_company_scoped("Payroll Entry", user)


def pqc_salary_slip(user=None):
	return pqc_company_scoped("Salary Slip", user)


def pqc_attendance(user=None):
	return pqc_company_scoped("Attendance", user)


def pqc_leave_application(user=None):
	return pqc_company_scoped("Leave Application", user)


def pqc_timesheet(user=None):
	return pqc_company_scoped("Timesheet", user)


def pqc_warehouse(user=None):
	return pqc_company_scoped("Warehouse", user)


def pqc_account(user=None):
	return pqc_company_scoped("Account", user)


def pqc_cost_center(user=None):
	return pqc_company_scoped("Cost Center", user)


def pqc_department(user=None):
	return pqc_company_scoped("Department", user)


def pqc_sales_taxes_and_charges_template(user=None):
	return pqc_company_scoped("Sales Taxes and Charges Template", user)


def pqc_purchase_taxes_and_charges_template(user=None):
	return pqc_company_scoped("Purchase Taxes and Charges Template", user)


def pqc_item_tax_template(user=None):
	return pqc_company_scoped("Item Tax Template", user)


def pqc_bank_account(user=None):
	return pqc_company_scoped("Bank Account", user)


def pqc_budget(user=None):
	return pqc_company_scoped("Budget", user)


def pqc_asset(user=None):
	return pqc_company_scoped("Asset", user)


def pqc_asset_movement(user=None):
	return pqc_company_scoped("Asset Movement", user)


def pqc_asset_repair(user=None):
	return pqc_company_scoped("Asset Repair", user)


def pqc_holiday_list(user=None):
	return pqc_company_scoped("Holiday List", user)


def pqc_leave_period(user=None):
	return pqc_company_scoped("Leave Period", user)


def pqc_leave_policy_assignment(user=None):
	return pqc_company_scoped("Leave Policy Assignment", user)


def pqc_expense_claim(user=None):
	return pqc_company_scoped("Expense Claim", user)


def pqc_loan(user=None):
	return pqc_company_scoped("Loan", user)


def pqc_loan_repayment(user=None):
	return pqc_company_scoped("Loan Repayment", user)


def pqc_loan_disbursement(user=None):
	return pqc_company_scoped("Loan Disbursement", user)


def has_permission_company(doc=None, ptype=None, user=None, verbose=False, **kwargs):
	user = user or frappe.session.user
	if is_ops_user(user):
		return None
	name = None
	if isinstance(doc, str):
		name = doc
	elif doc is not None:
		name = getattr(doc, "name", None) or (doc.get("name") if hasattr(doc, "get") else None)
	if not name:
		return None
	tenant = get_user_tenant_name(user)
	if tenant:
		allowed = frappe.db.get_value(TENANT_DOCTYPE, tenant, "company")
		if allowed and name != allowed:
			return False
		return None
	ok = frappe.db.exists(
		"User Permission",
		{"user": user, "allow": "Company", "for_value": name},
	)
	return True if ok else False


def has_permission_user(doc=None, ptype=None, user=None, verbose=False, **kwargs):
	user = user or frappe.session.user
	if is_ops_user(user):
		return None
	name = None
	if isinstance(doc, str):
		name = doc
	elif doc is not None:
		name = getattr(doc, "name", None) or (doc.get("name") if hasattr(doc, "get") else None)
	if not name:
		return None
	if name == user:
		return None
	tenant = get_user_tenant_name(user)
	if not tenant or not frappe.db.has_column("User", TENANT_FIELD):
		return False
	other = frappe.db.get_value("User", name, TENANT_FIELD)
	if other != tenant:
		return False
	return None


def has_permission_tenant(doc=None, ptype=None, user=None, verbose=False, **kwargs):
	user = user or frappe.session.user
	if is_ops_user(user):
		return None
	name = None
	if isinstance(doc, str):
		name = doc
	elif doc is not None:
		name = getattr(doc, "name", None) or (doc.get("name") if hasattr(doc, "get") else None)
	if not name:
		return None
	tenant = get_user_tenant_name(user)
	if tenant != name:
		return False
	return None


def has_permission_tenant_scoped(doc=None, ptype=None, user=None, verbose=False, **kwargs):
	user = user or frappe.session.user
	if is_ops_user(user):
		return None
	doctype = None
	name = None
	tenant_on_doc = None
	if isinstance(doc, str):
		return None
	elif doc is not None:
		doctype = getattr(doc, "doctype", None) or (doc.get("doctype") if hasattr(doc, "get") else None)
		name = getattr(doc, "name", None) or (doc.get("name") if hasattr(doc, "get") else None)
		tenant_on_doc = getattr(doc, TENANT_FIELD, None) or (
			doc.get(TENANT_FIELD) if hasattr(doc, "get") else None
		)
	if not doctype:
		return None
	if not frappe.get_meta(doctype).has_field(TENANT_FIELD):
		return None
	# Guard against metadata/DDL drift on Postgres (Custom Field row exists
	# but the ALTER TABLE never ran). Without this we'd try to
	# `select zivvy_tenant from tabDoctype` and 500 — deny access instead.
	try:
		# DocType name, not `tab{doctype}` — see pqc_tenant_scoped.
		if not frappe.db.has_column(doctype, TENANT_FIELD):
			return False
	except Exception:
		return False
	tenant = get_user_tenant_name(user)
	if not tenant:
		return False
	if tenant_on_doc is None and name:
		tenant_on_doc = frappe.db.get_value(doctype, name, TENANT_FIELD)
	if tenant_on_doc and tenant_on_doc != tenant:
		return False
	if not tenant_on_doc and name:
		return False
	return None


def isolation_permission_hooks() -> dict[str, str]:
	hooks = {
		"Company": "zivvy_brand.tenancy.isolation.has_permission_company",
		"User": "zivvy_brand.tenancy.isolation.has_permission_user",
		"Zivvy Tenant": "zivvy_brand.tenancy.isolation.has_permission_tenant",
	}
	target = "zivvy_brand.tenancy.isolation.has_permission_tenant_scoped"
	for dt in TENANT_SCOPED_DOCTYPES:
		hooks[dt] = target
	return hooks


def isolation_query_hooks() -> dict[str, str]:
	base = "zivvy_brand.tenancy.isolation"
	hooks = {
		"Company": f"{base}.pqc_company",
		"User": f"{base}.pqc_user",
		"Zivvy Tenant": f"{base}.pqc_zivvy_tenant",
		# Tenant-scoped (no Company field)
		"Customer": f"{base}.pqc_customer",
		"Lead": f"{base}.pqc_lead",
		"Opportunity": f"{base}.pqc_opportunity",
		"Contact": f"{base}.pqc_contact",
		"Address": f"{base}.pqc_address",
		"Supplier": f"{base}.pqc_supplier",
		"Item": f"{base}.pqc_item",
		"Item Price": f"{base}.pqc_item_price",
		"Item Group": f"{base}.pqc_item_group",
		"Blog Post": f"{base}.pqc_blog_post",
		"Comment": f"{base}.pqc_comment",
		"Note": f"{base}.pqc_note",
		"ToDo": f"{base}.pqc_todo",
		"Communication": f"{base}.pqc_communication",
		"Zivvy Role Template": f"{base}.pqc_zivvy_role_template",
		# Helpdesk (Frappe Helpdesk app)
		"HD Ticket": f"{base}.pqc_hd_ticket",
		"HD Article": f"{base}.pqc_hd_article",
		"HD Team": f"{base}.pqc_hd_team",
		"HD Ticket Type": f"{base}.pqc_hd_ticket_type",
		"HD Ticket Priority": f"{base}.pqc_hd_ticket_priority",
		"HD Service Level Agreement": f"{base}.pqc_hd_service_level_agreement",
	}
	hooks.update({
		# Company-scoped (defense-in-depth — runs independently of User Permission)
		"Sales Order": f"{base}.pqc_sales_order",
		"Sales Invoice": f"{base}.pqc_sales_invoice",
		"Purchase Order": f"{base}.pqc_purchase_order",
		"Purchase Invoice": f"{base}.pqc_purchase_invoice",
		"Delivery Note": f"{base}.pqc_delivery_note",
		"Purchase Receipt": f"{base}.pqc_purchase_receipt",
		"Stock Entry": f"{base}.pqc_stock_entry",
		"GL Entry": f"{base}.pqc_gl_entry",
		"Stock Ledger Entry": f"{base}.pqc_stock_ledger_entry",
		"Journal Entry": f"{base}.pqc_journal_entry",
		"Payment Entry": f"{base}.pqc_payment_entry",
		"Employee": f"{base}.pqc_employee",
		"Project": f"{base}.pqc_project",
		"Task": f"{base}.pqc_task",
		"Payroll Entry": f"{base}.pqc_payroll_entry",
		"Salary Slip": f"{base}.pqc_salary_slip",
		"Attendance": f"{base}.pqc_attendance",
		"Leave Application": f"{base}.pqc_leave_application",
		"Timesheet": f"{base}.pqc_timesheet",
		"Warehouse": f"{base}.pqc_warehouse",
		"Account": f"{base}.pqc_account",
		"Cost Center": f"{base}.pqc_cost_center",
		"Department": f"{base}.pqc_department",
		"Sales Taxes and Charges Template": f"{base}.pqc_sales_taxes_and_charges_template",
		"Purchase Taxes and Charges Template": f"{base}.pqc_purchase_taxes_and_charges_template",
		"Item Tax Template": f"{base}.pqc_item_tax_template",
		"Bank Account": f"{base}.pqc_bank_account",
		"Budget": f"{base}.pqc_budget",
		"Asset": f"{base}.pqc_asset",
		"Asset Movement": f"{base}.pqc_asset_movement",
		"Asset Repair": f"{base}.pqc_asset_repair",
		"Holiday List": f"{base}.pqc_holiday_list",
		"Leave Period": f"{base}.pqc_leave_period",
		"Leave Policy Assignment": f"{base}.pqc_leave_policy_assignment",
		"Expense Claim": f"{base}.pqc_expense_claim",
		"Loan": f"{base}.pqc_loan",
		"Loan Repayment": f"{base}.pqc_loan_repayment",
		"Loan Disbursement": f"{base}.pqc_loan_disbursement",
	})
	return hooks
