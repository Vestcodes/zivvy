"""
Webhook delivery system.

Emits events to registered webhook endpoints with HMAC-SHA256 signatures.
Called from doc_events hooks when documents are created/updated/submitted.
"""

from __future__ import annotations

import hashlib
import hmac
import json
import time

import frappe
import requests
from frappe import _

DOCTYPE_TO_SLUG = {
	# --- CRM ---
	"Lead": "leads",
	"Opportunity": "opportunities",
	"Customer": "customers",
	"Contact": "contacts",
	"Supplier": "suppliers",
	"Address": "addresses",
	# --- Selling / Buying ---
	"Quotation": "quotations",
	"Sales Order": "sales-orders",
	"Purchase Order": "purchase-orders",
	"Item": "items",
	# --- Accounts ---
	"Sales Invoice": "sales-invoices",
	"Purchase Invoice": "purchase-invoices",
	"Payment Entry": "payment-entries",
	"Journal Entry": "journal-entries",
	"Account": "accounts",
	"Cost Center": "cost-centers",
	"Fiscal Year": "fiscal-years",
	"Budget": "budgets",
	"Period Closing Voucher": "period-closing-vouchers",
	"Accounting Period": "accounting-periods",
	"Accounting Dimension": "accounting-dimensions",
	"Tax Category": "tax-categories",
	"Sales Taxes and Charges Template": "sales-taxes-charges-templates",
	"Purchase Taxes and Charges Template": "purchase-taxes-charges-templates",
	"GL Entry": "gl-entries",
	# --- Banking ---
	"Bank": "banks",
	"Bank Account": "bank-accounts",
	"Bank Transaction": "bank-transactions",
	"Bank Clearance": "bank-clearances",
	"Bank Statement Import": "bank-statement-imports",
	"Bank Transaction Rule": "bank-transaction-rules",
	"Bank Guarantee": "bank-guarantees",
	# --- Payments ---
	"Mode of Payment": "mode-of-payments",
	"Payment Terms Template": "payment-terms-templates",
	"Payment Request": "payment-requests",
	"Payment Reconciliation": "payment-reconciliations",
	"Process Payment Reconciliation": "process-payment-reconciliations",
	"Payment Order": "payment-orders",
	"Payment Gateway Account": "payment-gateway-accounts",
	"Dunning": "dunnings",
	# --- POS ---
	"POS Invoice": "pos-invoices",
	"POS Profile": "pos-profiles",
	"Loyalty Program": "loyalty-programs",
	# --- Stock ---
	"Warehouse": "warehouses",
	"Stock Entry": "stock-entries",
	"Stock Reconciliation": "stock-reconciliations",
	"Delivery Note": "delivery-notes",
	"Purchase Receipt": "purchase-receipts",
	"Material Request": "material-requests",
	"Pick List": "pick-lists",
	"Shipment": "shipments",
	"Delivery Trip": "delivery-trips",
	"Packing Slip": "packing-slips",
	"Landed Cost Voucher": "landed-cost-vouchers",
	"Putaway Rule": "putaway-rules",
	"Batch": "batches",
	"Serial No": "serial-nos",
	"Item Barcode": "item-barcodes",
	"Serial and Batch Bundle": "serial-batch-bundles",
	"Stock Ledger Entry": "stock-ledger-entries",
	# --- HR ---
	"Employee": "employees",
	"Employee Grade": "employee-grades",
	"Department": "departments",
	"Designation": "designations",
	"Leave Application": "leave-applications",
	"Leave Type": "leave-types",
	"Leave Allocation": "leave-allocations",
	"Leave Policy": "leave-policies",
	"Attendance": "attendance",
	"Attendance Request": "attendance-requests",
	"Employee Checkin": "employee-checkins",
	"Expense Claim": "expense-claims",
	"Payroll Entry": "payroll-entries",
	"Salary Slip": "salary-slips",
	"Salary Structure": "salary-structures",
	"Salary Structure Assignment": "salary-structure-assignments",
	"Appraisal": "appraisals",
	"Employee Advance": "employee-advances",
	"Employee Onboarding": "employee-onboardings",
	"Shift Assignment": "shift-assignments",
	"Holiday List": "holiday-lists",
	"Shift Type": "shift-types",
	# --- Talent / Recruitment ---
	"Job Opening": "job-openings",
	"Job Applicant": "job-applicants",
	"Interview": "interviews",
	"Interview Round": "interview-rounds",
	"Job Offer": "job-offers",
	"Appointment Letter": "appointment-letters",
	"Goal": "goals",
	"Employee Performance Feedback": "performance-feedbacks",
	"Training Event": "training-events",
	"Training Program": "training-programs",
	"Training Result": "training-results",
	"Training Feedback": "training-feedbacks",
	# --- Projects ---
	"Project": "projects",
	"Project Template": "project-templates",
	"Task": "tasks",
	"Timesheet": "timesheets",
	"Activity Type": "activity-types",
	# --- Manufacturing ---
	"BOM": "boms",
	"BOM Creator": "bom-creators",
	"Work Order": "work-orders",
	"Production Plan": "production-plans",
	"Job Card": "job-cards",
	"Routing": "routings",
	"BOM Update Tool": "bom-update-tools",
	"Downtime Entry": "downtime-entries",
	# --- Quality ---
	"Quality Inspection": "quality-inspections",
	"Quality Inspection Template": "quality-inspection-templates",
	"Quality Goal": "quality-goals",
	"Quality Procedure": "quality-procedures",
	"Quality Feedback": "quality-feedbacks",
	"Non Conformance": "non-conformances",
	# --- Assets ---
	"Asset": "assets",
	"Asset Category": "asset-categories",
	"Asset Capitalization": "asset-capitalizations",
	"Asset Movement": "asset-movements",
	"Asset Repair": "asset-repairs",
	"Asset Value Adjustment": "asset-value-adjustments",
	"Asset Depreciation Schedule": "asset-depreciation-schedules",
	# --- Subscription / Subcontracting ---
	"Subscription": "subscriptions",
	"Subscription Plan": "subscription-plans",
	"Subcontracting Order": "subcontracting-orders",
	"Subcontracting Receipt": "subcontracting-receipts",
	"Subcontracting Inward Order": "subcontracting-inward-orders",
	# --- Support / Helpdesk ---
	"Issue": "issues",
	"HD Ticket": "support-tickets",
	"HD Article": "support-articles",
	"HD Team": "support-teams",
	"HD Service Contract": "service-contracts",
	"HD Ticket Type": "ticket-types",
	"HD Ticket Priority": "ticket-priorities",
	# --- Insights (BI) ---
	"Insights Dashboard": "insights-dashboards",
	"Insights Query": "insights-queries",
	"Insights Chart": "insights-charts",
	"Insights Table": "insights-tables",
	"Insights Data Source": "insights-data-sources",
	# --- Webshop ---
	"Website Item": "website-items",
	"Product Bundle": "product-bundles",
	"Webshop Slideshow": "webshop-slideshows",
	# --- Ecommerce integrations ---
	"Shopify Settings": "shopify-settings",
	"Amazon SP Settings": "amazon-sp-settings",
}

EVENT_MAP = {
	"after_insert": "created",
	"on_update": "updated",
	"on_trash": "deleted",
	"on_submit": "submitted",
	"on_cancel": "cancelled",
}


def emit_event(doc, event_hook: str):
	"""Called from doc_events hooks. Logs the event and enqueues webhook delivery."""
	slug = DOCTYPE_TO_SLUG.get(doc.doctype)
	if not slug:
		return

	action = EVENT_MAP.get(event_hook)
	if not action:
		return

	event_type = f"{slug}.{action}"
	tenant = getattr(doc, "zivvy_tenant", None)
	if not tenant:
		return

	payload = {
		"event": event_type,
		"resource": slug,
		"data": {
			"name": doc.name,
			"doctype": doc.doctype,
			"modified": str(doc.modified),
		},
		"timestamp": frappe.utils.now_datetime().isoformat(),
	}

	try:
		for field in ("customer", "supplier", "status", "grand_total", "employee"):
			if hasattr(doc, field):
				payload["data"][field] = str(getattr(doc, field, ""))
	except Exception:
		pass

	frappe.get_doc({
		"doctype": "Zivvy Event Log",
		"event_type": event_type,
		"resource": slug,
		"resource_name": doc.name,
		"zivvy_tenant": tenant,
		"triggered_by": frappe.session.user,
		"payload": json.dumps(payload),
	}).insert(ignore_permissions=True)

	frappe.enqueue(
		"zivvy_brand.api.webhooks.deliver_webhooks",
		event_type=event_type,
		tenant=tenant,
		payload=payload,
		queue="short",
		is_async=True,
	)


def deliver_webhooks(event_type: str, tenant: str, payload: dict):
	"""Deliver payload to all matching webhook subscriptions."""
	webhooks = frappe.get_all(
		"Zivvy Webhook",
		filters={"zivvy_tenant": tenant, "enabled": 1},
		fields=["name", "url", "events", "secret"],
	)

	for wh in webhooks:
		events = _parse_events(wh.events)
		if "*" not in events and event_type not in events:
			resource_wildcard = event_type.split(".")[0] + ".*"
			if resource_wildcard not in events:
				continue

		_deliver_single(wh, event_type, payload, tenant)


def _deliver_single(wh, event_type: str, payload: dict, tenant: str):
	"""POST payload to a single webhook URL with HMAC signing."""
	body = json.dumps(payload, separators=(",", ":"))
	headers = {
		"Content-Type": "application/json",
		"X-Zivvy-Event": event_type,
		"X-Zivvy-Delivery": frappe.generate_hash(length=32),
	}

	secret = frappe.utils.password.get_decrypted_password(
		"Zivvy Webhook", wh.name, "secret"
	) if wh.secret else None

	if secret:
		signature = hmac.new(
			secret.encode(), body.encode(), hashlib.sha256
		).hexdigest()
		headers["X-Zivvy-Signature"] = f"sha256={signature}"

	start = time.monotonic()
	status_code = 0
	success = False
	error = ""
	response_body = ""

	try:
		resp = requests.post(
			wh.url, data=body, headers=headers, timeout=10
		)
		status_code = resp.status_code
		success = 200 <= status_code < 300
		response_body = resp.text[:2000]
	except requests.Timeout:
		error = "Request timed out after 10s"
	except requests.ConnectionError as e:
		error = f"Connection error: {str(e)[:500]}"
	except Exception as e:
		error = str(e)[:500]

	elapsed_ms = int((time.monotonic() - start) * 1000)

	frappe.get_doc({
		"doctype": "Zivvy Webhook Delivery",
		"webhook": wh.name,
		"event": event_type,
		"resource": payload.get("resource", ""),
		"resource_name": payload.get("data", {}).get("name", ""),
		"zivvy_tenant": tenant,
		"success": success,
		"status_code": status_code,
		"response_time_ms": elapsed_ms,
		"error": error,
		"request_payload": body[:5000],
		"response_body": response_body,
	}).insert(ignore_permissions=True)

	frappe.db.set_value("Zivvy Webhook", wh.name, {
		"total_deliveries": (frappe.db.get_value("Zivvy Webhook", wh.name, "total_deliveries") or 0) + 1,
		"last_delivery": frappe.utils.now_datetime(),
		"last_status": "Success" if success else "Failed",
	})
	frappe.db.commit()


def _parse_events(events_str: str) -> list[str]:
	if not events_str:
		return []
	try:
		parsed = json.loads(events_str)
		return parsed if isinstance(parsed, list) else []
	except (json.JSONDecodeError, TypeError):
		return [e.strip() for e in events_str.split(",") if e.strip()]
