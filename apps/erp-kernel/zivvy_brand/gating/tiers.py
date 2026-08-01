# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""Canonical Zivvy plan tiers and feature → minimum-tier map."""

from __future__ import annotations

TIER_FREE = "free"
TIER_PRO = "pro"
TIER_BUSINESS = "business"

TIER_RANK = {
	TIER_FREE: 0,
	TIER_PRO: 1,
	TIER_BUSINESS: 2,
}

TIER_LABELS = {
	TIER_FREE: "Free",
	TIER_PRO: "Pro",
	TIER_BUSINESS: "Business",
}

TIER_PRICES_USD = {
	TIER_FREE: 0,
	TIER_PRO: 18,
	TIER_BUSINESS: 30,
}

# Per-seat / month when billed annually (20% off monthly; round to whole dollars).
TIER_PRICES_ANNUAL_USD = {
	TIER_FREE: 0,
	TIER_PRO: 14,
	TIER_BUSINESS: 24,
}

# Barcode is treated as an inventory-paid capability.
BARCODE_MIN_TIER = TIER_PRO

# Soft seat caps (Polar sync overrides Pro/Business seat allowance)
DEFAULT_SEAT_CAPS = {
	TIER_FREE: 2,
	TIER_PRO: 1000,
	TIER_BUSINESS: 1000,
}

# Desk / ERPNext module → minimum tier (API / permission gating for Next.js)
MODULE_MIN_TIER: dict[str, str] = {
	# Free: CRM + light Selling/Buying + Wiki (bundled knowledge)
	"CRM": TIER_FREE,
	"Selling": TIER_FREE,
	"Buying": TIER_FREE,
	"Portal": TIER_FREE,
	"Setup": TIER_FREE,
	"Contacts": TIER_FREE,
	"Wiki": TIER_FREE,
	# Pro
	"Accounts": TIER_PRO,
	"Stock": TIER_PRO,
	"HR": TIER_PRO,
	"Projects": TIER_PRO,
	"Manufacturing": TIER_PRO,
	"Support": TIER_PRO,
	"Payments": TIER_PRO,
	"Regional": TIER_PRO,
	"Utilities": TIER_PRO,
	"Helpdesk": TIER_PRO,     # Frappe Helpdesk — customer tickets, KB, teams
	# Business
	"Assets": TIER_BUSINESS,
	"Quality Management": TIER_BUSINESS,
	"Subcontracting": TIER_BUSINESS,
	"Telephony": TIER_BUSINESS,
	"ERPNext Integrations": TIER_BUSINESS,
	"Bulk Transaction": TIER_BUSINESS,
	"Ecommerce Integrations": TIER_BUSINESS,
	"Insights": TIER_BUSINESS,   # Analytics / BI
	"Webshop": TIER_BUSINESS,    # Storefront + ecommerce sync
}

# DocType → minimum tier (server permission + form guards)
# Anything omitted defaults to free (allowed on all plans).
DOCTYPE_MIN_TIER: dict[str, str] = {
	# --- Pro: Accounting ---
	"Account": TIER_PRO,
	"Cost Center": TIER_PRO,
	"Accounting Dimension": TIER_PRO,
	"Fiscal Year": TIER_PRO,
	"Journal Entry": TIER_PRO,
	"Payment Entry": TIER_PRO,
	"Payment Request": TIER_PRO,
	"Payment Reconciliation": TIER_PRO,
	"Process Payment Reconciliation": TIER_PRO,
	"Sales Invoice": TIER_PRO,
	"Purchase Invoice": TIER_PRO,
	"POS Invoice": TIER_PRO,
	"POS Profile": TIER_PRO,
	"GL Entry": TIER_PRO,
	"Budget": TIER_PRO,
	"Period Closing Voucher": TIER_PRO,
	"Bank Account": TIER_PRO,
	"Bank": TIER_PRO,
	"Bank Transaction": TIER_PRO,
	"Bank Clearance": TIER_PRO,
	"Bank Reconciliation Tool": TIER_PRO,
	"Bank Statement Import": TIER_PRO,
	"Bank Statement Import Log": TIER_PRO,
	"Bank Transaction Rule": TIER_PRO,
	"Bank Guarantee": TIER_PRO,
	"Plaid Settings": TIER_PRO,
	"Chart of Accounts Importer": TIER_PRO,
	"Payment Gateway Account": TIER_PRO,
	"Payment Order": TIER_PRO,
	"Payment Schedule": TIER_PRO,
	"Accounting Period": TIER_PRO,
	"Mode of Payment": TIER_PRO,
	"Tax Category": TIER_PRO,
	"Sales Taxes and Charges Template": TIER_PRO,
	"Purchase Taxes and Charges Template": TIER_PRO,
	"Payment Terms Template": TIER_PRO,
	"Loyalty Program": TIER_PRO,
	"Dunning": TIER_PRO,
	# --- Pro: Inventory / Stock ---
	"Warehouse": TIER_PRO,
	"Stock Entry": TIER_PRO,
	"Stock Reconciliation": TIER_PRO,
	"Delivery Note": TIER_PRO,
	"Purchase Receipt": TIER_PRO,
	"Pick List": TIER_PRO,
	"Material Request": TIER_PRO,
	"Batch": TIER_PRO,
	"Bin": TIER_PRO,
	"Item Barcode": TIER_PRO,
	"Serial No": TIER_PRO,
	"Serial and Batch Bundle": TIER_PRO,
	"Stock Ledger Entry": TIER_PRO,
	"Landed Cost Voucher": TIER_PRO,
	"Putaway Rule": TIER_PRO,
	"Shipment": TIER_PRO,
	"Delivery Trip": TIER_PRO,
	"Packing Slip": TIER_PRO,
	"Quality Inspection": TIER_BUSINESS,  # Quality is Business
	# --- Pro: HR ---
	"Employee": TIER_PRO,
	"Employee Grade": TIER_PRO,
	"Leave Application": TIER_PRO,
	"Leave Type": TIER_PRO,
	"Leave Allocation": TIER_PRO,
	"Leave Policy": TIER_PRO,
	"Attendance": TIER_PRO,
	"Attendance Request": TIER_PRO,
	"Employee Checkin": TIER_PRO,
	"Payroll Entry": TIER_PRO,
	"Salary Slip": TIER_PRO,
	"Salary Structure": TIER_PRO,
	"Salary Structure Assignment": TIER_PRO,
	"Appraisal": TIER_PRO,
	"Expense Claim": TIER_PRO,
	"Employee Advance": TIER_PRO,
	"Employee Onboarding": TIER_PRO,
	"Shift Assignment": TIER_PRO,
	"Holiday List": TIER_PRO,
	"Shift Type": TIER_PRO,
	"Department": TIER_PRO,
	"Designation": TIER_PRO,
	# --- Pro: Talent (HRMS) ---
	"Job Opening": TIER_PRO,
	"Job Applicant": TIER_PRO,
	"Interview": TIER_PRO,
	"Interview Round": TIER_PRO,
	"Job Offer": TIER_PRO,
	"Appointment Letter": TIER_PRO,
	"Goal": TIER_PRO,
	"Employee Performance Feedback": TIER_PRO,
	"Training Event": TIER_PRO,
	"Training Program": TIER_PRO,
	"Training Result": TIER_PRO,
	"Training Feedback": TIER_PRO,
	# --- Pro: Projects ---
	"Project": TIER_PRO,
	"Project Template": TIER_PRO,
	"Task": TIER_PRO,
	"Timesheet": TIER_PRO,
	"Activity Type": TIER_PRO,
	# --- Pro: Basic Manufacturing ---
	"BOM": TIER_PRO,
	"BOM Creator": TIER_PRO,
	"Work Order": TIER_PRO,
	"Workstation": TIER_PRO,
	"Operation": TIER_PRO,
	# --- Business: Advanced Manufacturing ---
	"Production Plan": TIER_BUSINESS,
	"Job Card": TIER_BUSINESS,
	"Routing": TIER_BUSINESS,
	"BOM Update Tool": TIER_BUSINESS,
	"Downtime Entry": TIER_BUSINESS,
	"Plant Floor": TIER_BUSINESS,
	# --- Business: Quality ---
	"Quality Inspection Template": TIER_BUSINESS,
	"Quality Inspection Parameter": TIER_BUSINESS,
	"Quality Goal": TIER_BUSINESS,
	"Quality Procedure": TIER_BUSINESS,
	"Quality Feedback": TIER_BUSINESS,
	"Non Conformance": TIER_BUSINESS,
	# --- Business: Assets ---
	"Asset": TIER_BUSINESS,
	"Asset Category": TIER_BUSINESS,
	"Asset Capitalization": TIER_BUSINESS,
	"Asset Movement": TIER_BUSINESS,
	"Asset Repair": TIER_BUSINESS,
	"Asset Value Adjustment": TIER_BUSINESS,
	"Asset Depreciation Schedule": TIER_BUSINESS,
	# --- Business: Subscription / Rental ---
	"Subscription": TIER_BUSINESS,
	"Subscription Plan": TIER_BUSINESS,
	"Subscription Settings": TIER_BUSINESS,
	# --- Business: Subcontracting / EDI-ish ---
	"Subcontracting Order": TIER_BUSINESS,
	"Subcontracting Receipt": TIER_BUSINESS,
	"Subcontracting Inward Order": TIER_BUSINESS,
	# --- Business: Ecommerce channel sync (backend integrations app) ---
	"Shopify Settings": TIER_BUSINESS,
	"Amazon SP Settings": TIER_BUSINESS,
	# --- Pro: Helpdesk (Frappe Helpdesk app) ---
	"Issue": TIER_PRO,
	"HD Ticket": TIER_PRO,
	"HD Article": TIER_PRO,
	"HD Team": TIER_PRO,
	"HD Service Level Agreement": TIER_PRO,
	"HD Ticket Type": TIER_PRO,
	"HD Ticket Priority": TIER_PRO,
	"HD Agent": TIER_PRO,
	# --- Business: Insights (analytics / BI) ---
	"Insights Dashboard": TIER_BUSINESS,
	"Insights Query": TIER_BUSINESS,
	"Insights Chart": TIER_BUSINESS,
	"Insights Table": TIER_BUSINESS,
	"Insights Data Source": TIER_BUSINESS,
	# --- Business: Webshop (storefront) ---
	"Website Item": TIER_BUSINESS,
	"Web Item Group": TIER_BUSINESS,
	"Webshop Settings": TIER_BUSINESS,
	"Webshop Slideshow": TIER_BUSINESS,
	"Product Bundle": TIER_BUSINESS,
	# --- Free: Wiki bundled docs (no gating — same as base Frappe) ---
}

# Barcode-related page and whitelisted-method surface area.
BARCODE_PAGES: set[str] = {
	"point-of-sale",
	"quick-stock-balance",
	"barcode-scanner",
}

BARCODE_METHODS: set[str] = {
	"erpnext.stock.utils.scan_barcode",
	"erpnext.stock.get_item_details.get_barcode_data",
	"erpnext.selling.page.point_of_sale.point_of_sale.search_for_serial_or_batch_or_barcode_number",
}


def normalize_tier(tier: str | None) -> str:
	value = (tier or TIER_FREE).strip().lower()
	return value if value in TIER_RANK else TIER_FREE


def tier_at_least(current: str | None, required: str | None) -> bool:
	return TIER_RANK[normalize_tier(current)] >= TIER_RANK[normalize_tier(required)]


def min_tier_for_doctype(doctype: str | None) -> str:
	if not doctype:
		return TIER_FREE
	return DOCTYPE_MIN_TIER.get(doctype, TIER_FREE)


def min_tier_for_module(module: str | None) -> str:
	if not module:
		return TIER_FREE
	return MODULE_MIN_TIER.get(module, TIER_FREE)


def feature_matrix() -> dict:
	"""Public pricing / marketing matrix (capability language for Next.js)."""
	return {
		TIER_FREE: {
			"label": TIER_LABELS[TIER_FREE],
			"price_usd": TIER_PRICES_USD[TIER_FREE],
			"price_annual_usd": TIER_PRICES_ANNUAL_USD[TIER_FREE],
			"code": TIER_FREE,
			"seat_cap": DEFAULT_SEAT_CAPS[TIER_FREE],
			"features": [
				"CRM: Lead, Opportunity, Customer & Contact basics",
				"Items (basic)",
				"Simple Sales Order / Purchase Order",
				"Barcode scanning blocked on Free (paid inventory feature)",
				"Soft seat cap: 2 users",
				"Portal read-oriented usage",
			],
		},
		TIER_PRO: {
			"label": TIER_LABELS[TIER_PRO],
			"price_usd": TIER_PRICES_USD[TIER_PRO],
			"price_annual_usd": TIER_PRICES_ANNUAL_USD[TIER_PRO],
			"code": TIER_PRO,
			"seat_cap": None,
			"features": [
				"Everything in Free",
				"Full Accounting + Inventory / Stock",
				"Barcode scanning on paid inventory plan",
				"HRMS (Employee / Leave / Payroll / Talent)",
				"Projects + basic Manufacturing",
				"Banking reconciliation + payment gateways",
				"Support workflows",
				"Priority support",
				"Higher seat allowance (no hard 2-user Free cap)",
			],
		},
		TIER_BUSINESS: {
			"label": TIER_LABELS[TIER_BUSINESS],
			"price_usd": TIER_PRICES_USD[TIER_BUSINESS],
			"price_annual_usd": TIER_PRICES_ANNUAL_USD[TIER_BUSINESS],
			"code": TIER_BUSINESS,
			"seat_cap": None,
			"features": [
				"Everything in Pro",
				"Ecommerce channel sync (Shopify / Amazon / Unicommerce)",
				"Advanced Manufacturing, Quality, Assets",
				"Subscription / Rental modules",
				"EDI / advanced integrations + multi-company",
			],
		},
	}


def permission_hooks() -> dict[str, str]:
	"""DocType → has_permission hook path for gated doctypes."""
	target = "zivvy_brand.gating.permissions.has_permission"
	return {dt: target for dt in DOCTYPE_MIN_TIER}
