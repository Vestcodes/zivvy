# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""Scrub ERPNext / Frappe product branding from outbound mail on Zivvy."""

from __future__ import annotations

import re
from typing import Any

import frappe

from zivvy_brand.constants import (
	CONTACT_EMAIL,
	LEGAL_ENTITY,
	PRODUCTION_ORIGIN,
	PRODUCT_NAME,
)

# Substrings that must not appear in customer-facing email HTML/subjects
_LEAK_PATTERNS = (
	"ERPNext",
	"erpnext.com",
	"docs.erpnext.com",
	"frappe.io",
	"frappeframework.com",
	"frappe.cloud",
	"discuss.frappe.io",
	"Frappe School",
	"Frappe Framework",
	"Frappe Technologies",
	"Powered by Frappe",
	"Built on Frappe",
	"Sent via ERPNext",
	"via_email_footer",
)

_REPLACEMENTS = (
	(re.compile(r"https?://(?:www\.)?frappe\.io/[^\s\"'<>]*", re.I), PRODUCTION_ORIGIN),
	(re.compile(r"https?://(?:www\.)?frappeframework\.com[^\s\"'<>]*", re.I), PRODUCTION_ORIGIN),
	(re.compile(r"https?://(?:www\.)?frappe\.cloud[^\s\"'<>]*", re.I), PRODUCTION_ORIGIN),
	(re.compile(r"https?://(?:www\.)?discuss\.frappe\.io[^\s\"'<>]*", re.I), PRODUCTION_ORIGIN),
	(re.compile(r"https?://(?:www\.)?docs\.erpnext\.com[^\s\"'<>]*", re.I), PRODUCTION_ORIGIN),
	(re.compile(r"https?://(?:www\.)?erpnext\.com[^\s\"'<>]*", re.I), PRODUCTION_ORIGIN),
	(re.compile(r"\bPowered by\s+Frappe\b", re.I), f"Powered by {PRODUCT_NAME}"),
	(re.compile(r"\bBuilt on\s+Frappe\b", re.I), f"Powered by {PRODUCT_NAME}"),
	(re.compile(r"\bFrappe School\b", re.I), PRODUCT_NAME),
	(re.compile(r"\bFrappe Framework\b", re.I), PRODUCT_NAME),
	(re.compile(r"\bFrappe Technologies(?:\s+Pvt\.?\s*Ltd\.?)?\b", re.I), LEGAL_ENTITY),
	(re.compile(r"\bSent via\s+ERPNext\b", re.I), f"Sent via {PRODUCT_NAME}"),
	(re.compile(r"\bERPNext\b"), PRODUCT_NAME),
	(re.compile(r"\bFrappe\b"), PRODUCT_NAME),
	(re.compile(r"\bZivvy by Vestcodes\b"), PRODUCT_NAME),
)

ZIVVY_MAIL_FOOTER_HTML = f"""<div style="padding: 12px 0; text-align: center; color: #888;">
	<img src="{PRODUCTION_ORIGIN}/assets/zivvy_brand/images/zivvy-logo.png" alt="{PRODUCT_NAME}" width="96" style="max-width: 96px; height: auto; margin-bottom: 8px;" />
	<div style="font-size: 12px;">
		Sent via
		<a style="color: #888;" href="{PRODUCTION_ORIGIN}" target="_blank" rel="noopener">{PRODUCT_NAME}</a>
		·
		<a style="color: #888;" href="{PRODUCTION_ORIGIN}/terms" target="_blank" rel="noopener">Terms</a>
		·
		<a style="color: #888;" href="{PRODUCTION_ORIGIN}/privacy" target="_blank" rel="noopener">Privacy</a>
		·
		<a style="color: #888;" href="mailto:{CONTACT_EMAIL}">{CONTACT_EMAIL}</a>
	</div>
	<div style="font-size: 11px; margin-top: 6px; color: #aaa;">
		{LEGAL_ENTITY} · Powered by {PRODUCT_NAME}
	</div>
</div>"""


def scrub_email_branding() -> dict[str, Any]:
	"""Apply Zivvy product name across System/Website settings, Email Accounts, and templates.

	Safe to re-run on migrate. Returns a summary of what changed.
	"""
	summary: dict[str, Any] = {
		"system_settings": {},
		"website_settings": {},
		"email_accounts": [],
		"email_templates": [],
		"notifications": [],
	}

	summary["system_settings"] = _seed_system_settings()
	summary["website_settings"] = _seed_website_app_name()
	summary["email_accounts"] = _seed_email_accounts()
	summary["email_templates"] = _scrub_email_templates()
	summary["notifications"] = _scrub_notifications()

	frappe.clear_cache()
	return summary


def render_test_email_html() -> str:
	"""Render a sample outbound body (message + standard footer) for brand checks."""
	from frappe.email.email_body import get_formatted_html

	html = get_formatted_html(
		subject=f"{PRODUCT_NAME} branding check",
		message=(
			f"<p>This is a branding check from <strong>{PRODUCT_NAME}</strong>.</p>"
			"<p>Footer and product name should be Zivvy only.</p>"
		),
		header=f"{PRODUCT_NAME} email test",
	)
	return html or ""


def send_branding_test_email(to: str | None = None) -> dict[str, Any]:
	"""Send a real test mail and assert the rendered HTML has no ERPNext leaks."""
	to = (to or CONTACT_EMAIL).strip()
	html = render_test_email_html()
	leak_needles = (
		"erpnext",
		"frappe school",
		"frappe framework",
		"frappe.io",
		"frappeframework.com",
		"docs.erpnext.com",
		"powered by frappe",
		"built on frappe",
	)
	found = sorted({n for n in leak_needles if n in html.lower()})
	ok_render = not found

	try:
		frappe.sendmail(
			recipients=[to],
			subject=f"{PRODUCT_NAME} branding check",
			message=(
				f"<p>This is a branding check from <strong>{PRODUCT_NAME}</strong>.</p>"
				"<p>Footer and templates should say Zivvy only.</p>"
			),
			header=f"{PRODUCT_NAME} email test",
			now=True,
		)
		sent = True
		error = None
	except Exception as e:
		sent = False
		error = str(e)
		frappe.log_error(frappe.get_traceback(), "Zivvy email branding test")

	return {
		"ok": bool(sent and ok_render),
		"sent": sent,
		"to": to,
		"render_clean": ok_render,
		"leaks_in_render": found,
		"error": error,
		"footer_hooks": frappe.get_hooks("default_mail_footer"),
		"app_name": frappe.db.get_single_value("System Settings", "app_name"),
	}


def _seed_system_settings() -> dict[str, Any]:
	changed: dict[str, Any] = {}
	app_name = frappe.db.get_single_value("System Settings", "app_name")
	if app_name != PRODUCT_NAME:
		frappe.db.set_single_value("System Settings", "app_name", PRODUCT_NAME)
		changed["app_name"] = PRODUCT_NAME

	# Prefer product name in footer address line (legal entity only as secondary contact)
	desired_footer = f"{PRODUCT_NAME}\n{CONTACT_EMAIL}"
	current = (frappe.db.get_single_value("System Settings", "email_footer_address") or "").strip()
	if current != desired_footer and (
		not current
		or "ERPNext" in current
		or "erpnext" in current.lower()
		or current == CONTACT_EMAIL
	):
		frappe.db.set_single_value("System Settings", "email_footer_address", desired_footer)
		changed["email_footer_address"] = desired_footer

	# Suppress Frappe's stock "Sent via ERPNext" footer — we own the
	# footer through hooks.default_mail_footer + our branded email shell,
	# and stacking both leads to two footers in every message.
	if not cint_safe(frappe.db.get_single_value("System Settings", "disable_standard_email_footer")):
		frappe.db.set_single_value("System Settings", "disable_standard_email_footer", 1)
		changed["disable_standard_email_footer"] = 1
	return changed


def _seed_website_app_name() -> dict[str, Any]:
	if not frappe.db.exists("DocType", "Website Settings"):
		return {}
	changed: dict[str, Any] = {}
	app_name = frappe.db.get_single_value("Website Settings", "app_name")
	if app_name != PRODUCT_NAME:
		frappe.db.set_single_value("Website Settings", "app_name", PRODUCT_NAME)
		changed["app_name"] = PRODUCT_NAME
	return changed


def _seed_email_accounts() -> list[dict[str, Any]]:
	if not frappe.db.exists("DocType", "Email Account"):
		return []
	updated: list[dict[str, Any]] = []
	for name in frappe.get_all("Email Account", pluck="name"):
		doc = frappe.get_doc("Email Account", name)
		row_changed = False
		changes: dict[str, Any] = {"name": name}

		# Prefer display name Zivvy on default outgoing
		if cint_safe(doc.default_outgoing) and doc.email_account_name and "ERPNext" in doc.email_account_name:
			doc.email_account_name = PRODUCT_NAME
			changes["email_account_name"] = PRODUCT_NAME
			row_changed = True

		footer = (doc.footer or "").strip() if hasattr(doc, "footer") else ""
		if not footer or _contains_leak(footer) or "Zivvy by Vestcodes" in footer:
			doc.footer = ZIVVY_MAIL_FOOTER_HTML
			changes["footer"] = "zivvy"
			row_changed = True

		sig = (doc.signature or "").strip() if hasattr(doc, "signature") else ""
		if sig and _contains_leak(sig):
			doc.signature = _scrub_text(sig)
			changes["signature"] = "scrubbed"
			row_changed = True
		elif not sig and cint_safe(doc.default_outgoing):
			doc.add_signature = 0

		if row_changed:
			doc.flags.ignore_permissions = True
			doc.flags.ignore_validate = True
			doc.save(ignore_permissions=True)
			updated.append(changes)
	return updated


def _scrub_email_templates() -> list[dict[str, Any]]:
	if not frappe.db.exists("DocType", "Email Template"):
		return []
	updated: list[dict[str, Any]] = []
	meta = frappe.get_meta("Email Template")
	fields = [f for f in ("subject", "response", "response_html") if meta.has_field(f)]
	for name in frappe.get_all("Email Template", pluck="name"):
		doc = frappe.get_doc("Email Template", name)
		changed_fields: list[str] = []
		for field in fields:
			val = doc.get(field)
			if not val or not _contains_leak(str(val)):
				continue
			doc.set(field, _scrub_text(str(val)))
			changed_fields.append(field)
		if changed_fields:
			doc.flags.ignore_permissions = True
			doc.save(ignore_permissions=True)
			updated.append({"name": name, "fields": changed_fields})
	return updated


def _scrub_notifications() -> list[dict[str, Any]]:
	if not frappe.db.exists("DocType", "Notification"):
		return []
	updated: list[dict[str, Any]] = []
	meta = frappe.get_meta("Notification")
	fields = [f for f in ("subject", "message") if meta.has_field(f)]
	for name in frappe.get_all("Notification", pluck="name"):
		doc = frappe.get_doc("Notification", name)
		changed_fields: list[str] = []
		for field in fields:
			val = doc.get(field)
			if not val or not _contains_leak(str(val)):
				continue
			doc.set(field, _scrub_text(str(val)))
			changed_fields.append(field)
		if changed_fields:
			doc.flags.ignore_permissions = True
			doc.save(ignore_permissions=True)
			updated.append({"name": name, "fields": changed_fields})
	return updated


def _contains_leak(text: str) -> bool:
	lower = text.lower()
	return any(p.lower() in lower for p in _LEAK_PATTERNS)


def _scrub_text(text: str) -> str:
	out = text
	for pattern, repl in _REPLACEMENTS:
		out = pattern.sub(repl, out)
	return out


def cint_safe(val) -> int:
	try:
		from frappe.utils import cint

		return cint(val)
	except Exception:
		return int(val or 0)
