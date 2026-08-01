# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""Datacenter / data-residency preference for Zivvy users.

Today Zivvy runs on a single Railway region. The preference is recorded for
compliance and future multi-region routing — it does not move traffic yet.
"""

from __future__ import annotations

import frappe
from frappe import _

DATACENTER_FIELD = "zivvy_datacenter"

DATACENTER_INDIA = "india"
DATACENTER_EU = "eu"
DATACENTER_US = "us"

DATACENTER_CODES = (DATACENTER_INDIA, DATACENTER_EU, DATACENTER_US)

DATACENTER_LABELS = {
	DATACENTER_INDIA: "India",
	DATACENTER_EU: "EU",
	DATACENTER_US: "US",
}

# Signup copy — preference only until multi-region ships
DATACENTER_HELP = _(
	"Data residency preference. Traffic may still use a single region today; "
	"your choice is saved for future region routing and compliance."
)


def normalize_datacenter(value: str | None) -> str | None:
	"""Return canonical code or None if empty/invalid."""
	code = (value or "").strip().lower()
	if not code:
		return None
	# Lowercased aliases — accepts eu / EU / Europe / india / US / etc.
	aliases = {
		"in": DATACENTER_INDIA,
		"ind": DATACENTER_INDIA,
		"india": DATACENTER_INDIA,
		"eu": DATACENTER_EU,
		"europe": DATACENTER_EU,
		"european union": DATACENTER_EU,
		"us": DATACENTER_US,
		"usa": DATACENTER_US,
		"united states": DATACENTER_US,
		"united states of america": DATACENTER_US,
	}
	normalized = aliases.get(code, code)
	return normalized if normalized in DATACENTER_CODES else None


def require_datacenter(value: str | None) -> str:
	"""Validate required datacenter for signup."""
	code = normalize_datacenter(value)
	if not code:
		frappe.throw(
			_("Please choose a datacenter (India, EU, or US)."),
			title=_("Datacenter required"),
		)
	return code


def ensure_datacenter_custom_field():
	"""Add User.zivvy_datacenter Select field if missing."""
	if frappe.db.exists("Custom Field", {"dt": "User", "fieldname": DATACENTER_FIELD}):
		return
	doc = frappe.get_doc(
		{
			"doctype": "Custom Field",
			"dt": "User",
			"fieldname": DATACENTER_FIELD,
			"label": "Zivvy Datacenter",
			"fieldtype": "Select",
			"options": "\n".join(("", *DATACENTER_CODES)),
			"insert_after": "user_type",
			"description": (
				"Data residency preference (india / eu / us). "
				"Recorded for compliance; routing may still be single-region today."
			),
		}
	)
	doc.insert(ignore_permissions=True)
	frappe.clear_cache(doctype="User")


def get_user_datacenter(user: str | None = None) -> str | None:
	"""Read stored preference for a user (current session if omitted)."""
	user = user or frappe.session.user
	if not user or user in ("Guest", "Administrator"):
		return None
	if not frappe.db.has_column("User", DATACENTER_FIELD):
		return None
	return normalize_datacenter(frappe.db.get_value("User", user, DATACENTER_FIELD))


def set_user_datacenter(user: str, value: str | None, *, required: bool = False) -> str | None:
	"""Persist preference on User. Returns normalized code or None."""
	code = require_datacenter(value) if required else normalize_datacenter(value)
	if code is None:
		return None
	ensure_datacenter_custom_field()
	if frappe.db.has_column("User", DATACENTER_FIELD):
		frappe.db.set_value("User", user, DATACENTER_FIELD, code, update_modified=False)
	return code
