# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""Resend Email Account seed for Zivvy transactional mail.

Railway blocks outbound SMTP (:465/:587). Actual delivery uses Resend HTTPS via
``zivvy_brand.email.resend_http.override_email_send``. This module still seeds a
default outgoing Email Account so Frappe can resolve sender metadata.
"""

from __future__ import annotations

import os
import re
from typing import Any

import frappe
from frappe import _
from frappe.utils import cint

from zivvy_brand.constants import (
	CONTACT_EMAIL,
	DEFAULT_RESEND_FROM_EMAIL,
	FALLBACK_RESEND_FROM_EMAIL,
	PRODUCT_NAME,
	RESEND_ACCOUNT_NAME,
	RESEND_SMTP_PORT,
	RESEND_SMTP_SERVER,
	RESEND_SMTP_USER,
)

_FROM_RE = re.compile(
	r"^\s*(?:(?P<name>.+?)\s*)?<(?P<email>[^>]+)>\s*$|^\s*(?P<bare>[^\s<>]+@[^\s<>]+)\s*$"
)


def get_resend_config() -> dict[str, Any]:
	"""Merge env with Zivvy Settings (env wins for the API key)."""
	cfg = {
		"api_key": (os.environ.get("RESEND_API_KEY") or "").strip(),
		"from_email": (os.environ.get("RESEND_FROM_EMAIL") or "").strip(),
		"configured": False,
	}

	if frappe.db.exists("DocType", "Zivvy Settings"):
		try:
			doc = frappe.get_single("Zivvy Settings")
			if not cfg["api_key"] and getattr(doc, "resend_api_key", None):
				try:
					cfg["api_key"] = doc.get_password("resend_api_key") or ""
				except Exception:
					cfg["api_key"] = ""
			if not cfg["from_email"]:
				cfg["from_email"] = (getattr(doc, "resend_from_email", None) or "").strip()
		except Exception:
			pass

	cfg["api_key"] = (cfg["api_key"] or "").strip()
	cfg["from_email"] = (cfg["from_email"] or "").strip() or DEFAULT_RESEND_FROM_EMAIL
	cfg["configured"] = bool(cfg["api_key"])
	return cfg


def parse_from_email(raw: str) -> tuple[str, str]:
	"""Return (display_name, email_address) from `Name <addr>` or bare addr."""
	raw = (raw or "").strip() or DEFAULT_RESEND_FROM_EMAIL
	m = _FROM_RE.match(raw)
	if not m:
		return PRODUCT_NAME, raw
	if m.group("email"):
		name = (m.group("name") or "").strip().strip('"') or PRODUCT_NAME
		return name, m.group("email").strip()
	return PRODUCT_NAME, (m.group("bare") or raw).strip()


def ensure_resend_email_account(*, force: bool = False) -> str | None:
	"""Create/update default outgoing Email Account when RESEND_API_KEY is set.

	Returns the Email Account name, or None if no API key is available.
	"""
	cfg = get_resend_config()
	if not cfg["configured"]:
		frappe.logger("zivvy_brand").info(
			"Resend: RESEND_API_KEY not set — skipping Email Account seed"
		)
		return None

	if not frappe.db.exists("DocType", "Email Account"):
		return None

	display_name, email_id = parse_from_email(cfg["from_email"])
	api_key = cfg["api_key"]

	existing_name = frappe.db.get_value("Email Account", {"email_account_name": RESEND_ACCOUNT_NAME})
	if not existing_name:
		existing_name = frappe.db.get_value("Email Account", {"email_id": email_id})

	# Clear other default outgoing flags so Resend owns transactional mail
	frappe.db.sql(
		"""
		UPDATE `tabEmail Account`
		SET default_outgoing = 0
		WHERE IFNULL(default_outgoing, 0) = 1
		  AND name != %s
		""",
		(existing_name or ""),
	)

	if existing_name:
		doc = frappe.get_doc("Email Account", existing_name)
	else:
		doc = frappe.new_doc("Email Account")
		doc.email_account_name = RESEND_ACCOUNT_NAME

	doc.email_id = email_id
	doc.email_account_name = RESEND_ACCOUNT_NAME
	doc.auth_method = "Basic"
	doc.login_id_is_different = 1
	doc.login_id = RESEND_SMTP_USER
	doc.password = api_key
	doc.awaiting_password = 0
	doc.enable_incoming = 0
	doc.enable_outgoing = 1
	doc.default_outgoing = 1
	doc.smtp_server = RESEND_SMTP_SERVER
	doc.smtp_port = str(RESEND_SMTP_PORT)
	doc.use_ssl_for_outgoing = 1
	doc.use_tls = 0
	doc.no_smtp_authentication = 0
	doc.always_use_account_email_id_as_sender = 1
	doc.always_use_account_name_as_sender_name = 1
	doc.send_unsubscribe_message = 0
	doc.flags.ignore_permissions = True
	# Seed/migrate: skip SMTP handshake (domain DNS may still be pending). Use force=True to validate.
	if not force:
		doc.flags.ignore_validate = True

	try:
		if doc.is_new():
			doc.insert(ignore_permissions=True)
		else:
			doc.save(ignore_permissions=True)
	except Exception:
		# Domain not verified / SMTP reject — try fallback from-address once
		_fallback_name, fallback_email = parse_from_email(FALLBACK_RESEND_FROM_EMAIL)
		if email_id != fallback_email:
			frappe.logger("zivvy_brand").warning(
				"Resend: primary from-address failed; retrying with fallback contact address"
			)
			doc.email_id = fallback_email
			if not force:
				doc.flags.ignore_validate = True
			try:
				if doc.is_new() or not frappe.db.exists("Email Account", doc.name):
					doc.insert(ignore_permissions=True)
				else:
					doc.save(ignore_permissions=True)
			except Exception:
				frappe.log_error(frappe.get_traceback(), "Zivvy Resend Email Account setup")
				return None
		else:
			frappe.log_error(frappe.get_traceback(), "Zivvy Resend Email Account setup")
			return None

	# Persist resolved from into site config (never the API key)
	try:
		frappe.db.set_single_value(
			"System Settings",
			"email_footer_address",
			f"{PRODUCT_NAME}\n{CONTACT_EMAIL}",
		)
	except Exception:
		pass

	frappe.clear_cache()
	return doc.name


def enable_saas_website_users() -> None:
	"""Ensure known pending website signups are enabled (no admin approval gate)."""
	pending = [
		"sarwagyasingh69@gmail.com",
	]
	for email in pending:
		name = frappe.db.get_value("User", {"email": email}, "name")
		if not name:
			continue
		enabled = cint(frappe.db.get_value("User", name, "enabled"))
		if not enabled:
			frappe.db.set_value("User", name, "enabled", 1, update_modified=False)
			frappe.logger("zivvy_brand").info(f"Enabled pending SaaS user {email}")


@frappe.whitelist(allow_guest=True)
def send_resend_test_email(to: str | None = None) -> dict[str, Any]:
	"""Send a one-off test via Frappe mail (uses configured Email Account)."""
	to = (to or CONTACT_EMAIL).strip()
	cfg = get_resend_config()
	if not cfg["configured"]:
		return {"ok": False, "error": "RESEND_API_KEY not configured"}

	ensure_resend_email_account()
	try:
		frappe.sendmail(
			recipients=[to],
			subject=f"{PRODUCT_NAME} email test",
			message=(
				f"<p>This is a transactional email test from <strong>{PRODUCT_NAME}</strong> "
				f"via Resend.</p><p>If you received this, outgoing mail is working.</p>"
			),
			now=True,
		)
		return {"ok": True, "to": to, "from": cfg["from_email"]}
	except Exception as e:
		frappe.log_error(frappe.get_traceback(), "Zivvy Resend test email")
		return {"ok": False, "error": str(e), "to": to}
