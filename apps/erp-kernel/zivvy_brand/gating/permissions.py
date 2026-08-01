# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

from __future__ import annotations

import json
from urllib.parse import unquote

import frappe
from frappe import _

from zivvy_brand.gating.tiers import (
	BARCODE_METHODS,
	BARCODE_MIN_TIER,
	BARCODE_PAGES,
	min_tier_for_doctype,
	normalize_tier,
	tier_at_least,
)

INTERNAL_DOCTYPES = {
	"DocType",
	"Module Def",
	"Installed Application",
	"Server Script",
	"Custom Field",
	"Property Setter",
	"Access Log",
	"Error Log",
	"Scheduled Job Type",
	"Patch Log",
	"RQ Job",
	"Webhook",
}


def _current_tier(user: str | None = None) -> str:
	try:
		from zivvy_brand.gating.effective import get_effective_tier

		return normalize_tier(get_effective_tier(user))
	except Exception:
		return "free"


def _tenant_has_addon_unlock(doctype: str, user: str | None) -> bool:
	"""True when the acting user's tenant carries an addon that unlocks ``doctype``."""
	try:
		from zivvy_brand.gating.addons import get_addon_unlocked_doctypes
		from zivvy_brand.tenancy.context import get_user_tenant_name

		tenant = get_user_tenant_name(user)
		if not tenant:
			return False
		return doctype in get_addon_unlocked_doctypes(tenant)
	except Exception:
		return False


def has_permission(doc=None, ptype: str | None = None, user: str | None = None, verbose=False, **kwargs):
	"""Block read/write on doctypes above the site's plan tier.

	Administrators still see an upgrade path in the UI; server blocks non-managers
	and returns False for gated access. System Manager may read settings but
	transactional gated doctypes remain blocked on Free/Pro as appropriate.

	Addon override: if the tenant holds an active/trialing ``Zivvy Tenant Addon``
	whose ``doctypes_unlocked`` contains ``doctype``, the tier check is bypassed.
	"""
	doctype = None
	if isinstance(doc, str):
		doctype = doc
	elif doc is not None:
		doctype = getattr(doc, "doctype", None) or (doc.get("doctype") if hasattr(doc, "get") else None)

	if not doctype:
		return None  # defer to standard checks

	required = min_tier_for_doctype(doctype)
	# None → fall through to standard role checks (Frappe v14/v15)
	if required == "free":
		return None

	user = user or frappe.session.user
	if user == "Administrator":
		return None

	current = _current_tier(user)
	if tier_at_least(current, required):
		return None

	# Addon-unlocked doctypes bypass tier gating.
	if _tenant_has_addon_unlock(doctype, user):
		return None

	if verbose:
		frappe.msgprint(
			_("This feature requires the {0} plan. Upgrade in Billing.").format(required.title()),
			indicator="orange",
			alert=True,
		)
	return False


def assert_doctype_allowed(doctype: str):
	"""Raise if current plan cannot use doctype (unless an active addon unlocks it)."""
	required = min_tier_for_doctype(doctype)
	current = _current_tier()
	if tier_at_least(current, required):
		return
	if _tenant_has_addon_unlock(doctype, frappe.session.user):
		return
	frappe.throw(
		_("“{0}” requires the {1} plan. Open Billing to upgrade.").format(
			doctype, required.title()
		),
		title=_("Upgrade required"),
		exc=frappe.PermissionError,
	)


def assert_module_allowed(module: str):
	from zivvy_brand.gating.tiers import min_tier_for_module

	required = min_tier_for_module(module)
	current = _current_tier()
	if not tier_at_least(current, required):
		frappe.throw(
			_("The {0} module requires the {1} plan.").format(module, required.title()),
			title=_("Upgrade required"),
			exc=frappe.PermissionError,
		)


def assert_barcode_allowed():
	"""Paid-only barcode guard: Pro and Business tiers."""
	current = _current_tier()
	if tier_at_least(current, BARCODE_MIN_TIER):
		return
	frappe.throw(
		_(
			"Barcode scanning is available on Pro and Business inventory plans. "
			"Upgrade in Billing to use barcode features."
		),
		title=_("Upgrade required"),
		exc=frappe.PermissionError,
	)


REPORT_METHODS = {
	"frappe.desk.query_report.run",
	"frappe.desk.query_report.export_query_report",
	"frappe.desk.query_report.run_reports_for_dashboard",
	"frappe.desk.reportview.export_query",
	"frappe.core.doctype.report.report.get_script",
}

REPORT_ALLOWLIST: set[str] = set()

WRITE_METHODS = {
	"frappe.client.insert",
	"frappe.client.save",
	"frappe.client.set_value",
	"frappe.client.delete",
	"frappe.client.cancel",
	"frappe.client.submit",
	"frappe.client.copy_doc",
	"frappe.client.rename_doc",
	"frappe.desk.form.save.savedocs",
	"frappe.desk.form.save.cancel",
	"frappe.desk.form.save.submit",
}

MODULE_METHODS = {
	"frappe.desk.desktop.get_desktop_page",
	"frappe.desk.desktop.get_workspace_sidebar_items",
}

READ_DOCTYPE_METHODS = {
	"frappe.client.get",
	"frappe.client.get_list",
	"frappe.client.get_value",
	"frappe.client.get_count",
	"frappe.desk.form.load.getdoc",
	"frappe.desk.reportview.get",
	"frappe.desk.reportview.get_list",
	"frappe.desk.reportview.get_count",
}


def _request_cmd() -> str:
	cmd = (frappe.form_dict.get("cmd") or "").strip()
	if cmd:
		return cmd
	path = (frappe.request.path or "").strip()
	if path.startswith("/api/method/"):
		return path.split("/api/method/", 1)[1]
	return ""


def _json_value(raw: str | None):
	if not raw:
		return None
	try:
		return json.loads(raw)
	except Exception:
		return None


def _doctype_from_request() -> str | None:
	doctype = (
		frappe.form_dict.get("doctype")
		or frappe.form_dict.get("dt")
		or frappe.form_dict.get("reference_doctype")
	)
	if doctype:
		return str(doctype)
	doc = _json_value(frappe.form_dict.get("doc"))
	if isinstance(doc, dict) and doc.get("doctype"):
		return str(doc.get("doctype"))
	docs = _json_value(frappe.form_dict.get("docs"))
	if isinstance(docs, dict) and docs.get("doctype"):
		return str(docs.get("doctype"))
	if isinstance(docs, list):
		for row in docs:
			if isinstance(row, dict) and row.get("doctype"):
				return str(row.get("doctype"))
	return None


def _module_from_request() -> str | None:
	module = (
		frappe.form_dict.get("page")
		or frappe.form_dict.get("module")
		or frappe.form_dict.get("workspace")
	)
	if module:
		return str(module)
	return None


def _value_has_barcode_signal(value) -> bool:
	if isinstance(value, dict):
		for key, child in value.items():
			key_l = str(key or "").strip().lower()
			if "barcode" in key_l and str(child or "").strip():
				return True
			if _value_has_barcode_signal(child):
				return True
		return False
	if isinstance(value, list):
		return any(_value_has_barcode_signal(v) for v in value)
	return False


def _payload_has_barcode_signal() -> bool:
	for key in ("barcode", "barcodes", "scan_barcode", "item_barcode"):
		val = frappe.form_dict.get(key)
		if val and str(val).strip():
			return True
	for key in ("ctx", "doc", "docs", "args"):
		payload = _json_value(frappe.form_dict.get(key))
		if payload and _value_has_barcode_signal(payload):
			return True
	return False


def _is_barcode_page_request() -> bool:
	page = (_module_from_request() or "").strip().lower().replace("_", "-")
	if not page:
		return False
	if page in BARCODE_PAGES:
		return True
	return "barcode" in page


def _is_barcode_flow(cmd: str, resource_doctype: str | None = None) -> bool:
	cmd_l = (cmd or "").strip().lower()
	if cmd in BARCODE_METHODS:
		return True
	if cmd_l.startswith(("erpnext.", "frappe.", "zivvy_brand.")) and "barcode" in cmd_l:
		return True
	doctype = resource_doctype or _doctype_from_request()
	if doctype and "barcode" in doctype.lower():
		return True
	if _is_barcode_page_request():
		return True
	if _payload_has_barcode_signal():
		return True
	return False


def _doctype_from_resource_path() -> str | None:
	path = (frappe.request.path or "").strip()
	if not path.startswith("/api/resource/"):
		return None
	rest = path.split("/api/resource/", 1)[1]
	if not rest:
		return None
	raw = rest.split("/", 1)[0]
	return unquote(raw) if raw else None


def _assert_doctype_not_internal(doctype: str | None, user: str | None = None):
	if not doctype:
		return
	from zivvy_brand.tenancy.context import is_ops_user

	if is_ops_user(user):
		return
	if doctype in INTERNAL_DOCTYPES:
		frappe.throw(
			_("This area is restricted to Zivvy operations."),
			title=_("Not permitted"),
			exc=frappe.PermissionError,
		)


def guard_api_access():
	"""before_request: enforce server-side plan gates on write/module APIs."""
	if not getattr(frappe, "request", None):
		return
	user = frappe.session.user
	if user in (None, "Guest", "Administrator"):
		return

	method = (frappe.request.method or "GET").upper()
	cmd = _request_cmd()

	# REST resource calls bypass whitelisted cmd names.
	resource_doctype = _doctype_from_resource_path()
	if _is_barcode_flow(cmd, resource_doctype=resource_doctype):
		assert_barcode_allowed()
	if resource_doctype:
		_assert_doctype_not_internal(resource_doctype, user)
		# Enforce plan on list/get as well as writes — Free must not soft-open
		# Pro DocTypes via empty 200 lists.
		assert_doctype_allowed(resource_doctype)
		if method in {"POST", "PUT", "PATCH", "DELETE"}:
			return

	if cmd in REPORT_METHODS:
		from zivvy_brand.tenancy.context import is_ops_user

		if not is_ops_user(user):
			report_name = frappe.form_dict.get("report_name") or frappe.form_dict.get("name") or ""
			if report_name not in REPORT_ALLOWLIST:
				frappe.log_error(
					f"Blocked report access: user={user}, cmd={cmd}, report={report_name}",
					"Zivvy report guard",
				)
				frappe.throw(
					_("Reports are not available in self-serve mode. Contact support if you need this data."),
					title=_("Not permitted"),
					exc=frappe.PermissionError,
				)

	if cmd in WRITE_METHODS:
		doctype = _doctype_from_request()
		if doctype:
			_assert_doctype_not_internal(doctype, user)
			assert_doctype_allowed(doctype)
		return

	if cmd in READ_DOCTYPE_METHODS:
		doctype = _doctype_from_request() or resource_doctype
		if doctype:
			_assert_doctype_not_internal(doctype, user)
			assert_doctype_allowed(doctype)
		return

	if cmd in MODULE_METHODS:
		module = _module_from_request()
		if module:
			assert_module_allowed(module)
