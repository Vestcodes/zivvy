"""Public API key validation for the Zivvy API gateway (NestJS layer).

The NestJS gateway calls this endpoint to validate an API key and resolve
the tenant + user it belongs to. Keys are stored in the `Zivvy API Key`
doctype with a hashed secret.
"""

from __future__ import annotations

import hashlib
import secrets
from datetime import datetime

import frappe
from frappe import _


# ---------------------------------------------------------------------------
# Key validation (called by the NestJS gateway)
# ---------------------------------------------------------------------------

@frappe.whitelist(allow_guest=True)
def validate_api_key(api_key: str) -> dict:
	"""Validate an API key and return tenant info.

	Called by the NestJS API gateway on every authenticated request.
	The gateway caches results for 5 minutes, so this isn't called per-request.
	"""
	if not api_key or not isinstance(api_key, str):
		return {"valid": False}

	prefix, _, secret = api_key.partition("_")
	if not secret:
		return {"valid": False}

	secret_hash = hashlib.sha256(api_key.encode()).hexdigest()

	key_doc = frappe.db.get_value(
		"Zivvy API Key",
		{"key_hash": secret_hash, "enabled": 1},
		["name", "user", "tenant", "tier", "scopes", "rate_limit"],
		as_dict=True,
	)

	if not key_doc:
		return {"valid": False}

	frappe.db.set_value("Zivvy API Key", key_doc.name, "last_used", datetime.now(), update_modified=False)

	site = frappe.local.site
	addons: list[str] = []
	if key_doc.tenant:
		try:
			from zivvy_brand.gating.addons import get_tenant_addons

			addons = get_tenant_addons(key_doc.tenant)
		except Exception:
			addons = []
	return {
		"valid": True,
		"name": key_doc.tenant or key_doc.name,
		"site": site,
		"tier": key_doc.tier or "free",
		"user": key_doc.user,
		"scopes": (key_doc.scopes or "read").split(","),
		"rate_limit": key_doc.rate_limit or 100,
		"addons": addons,
	}


# ---------------------------------------------------------------------------
# Key generation (called from Zivvy dashboard / settings)
# ---------------------------------------------------------------------------

@frappe.whitelist()
def generate_api_key(label: str = "Default") -> dict:
	"""Generate a new API key for the current user's tenant."""
	user = frappe.session.user
	if user == "Guest":
		frappe.throw(_("Authentication required"), frappe.AuthenticationError)

	tenant = frappe.db.get_value("User", user, "zivvy_tenant") or ""
	tier = "free"

	boot = frappe.get_doc("Zivvy Settings") if frappe.db.exists("DocType", "Zivvy Settings") else None
	if boot and hasattr(boot, "tier"):
		tier = boot.tier or "free"

	prefix = "zk_live"
	raw_secret = secrets.token_urlsafe(32)
	api_key = f"{prefix}_{raw_secret}"
	key_hash = hashlib.sha256(api_key.encode()).hexdigest()

	doc = frappe.get_doc({
		"doctype": "Zivvy API Key",
		"label": label,
		"key_hash": key_hash,
		"key_preview": api_key[:12] + "..." + api_key[-4:],
		"user": user,
		"tenant": tenant,
		"tier": tier,
		"scopes": "read,write",
		"enabled": 1,
	})
	doc.insert(ignore_permissions=True)
	frappe.db.commit()

	return {
		"api_key": api_key,
		"key_id": doc.name,
		"preview": doc.key_preview,
		"label": label,
		"message": "Store this key securely — it won't be shown again.",
	}


@frappe.whitelist()
def revoke_api_key(key_id: str) -> dict:
	"""Revoke (disable) an API key."""
	user = frappe.session.user
	if user == "Guest":
		frappe.throw(_("Authentication required"), frappe.AuthenticationError)

	if not frappe.db.exists("Zivvy API Key", key_id):
		frappe.throw(_("API key not found"), frappe.DoesNotExistError)

	doc = frappe.get_doc("Zivvy API Key", key_id)
	if doc.user != user and "System Manager" not in frappe.get_roles(user):
		frappe.throw(_("Not authorized to revoke this key"), frappe.PermissionError)

	doc.enabled = 0
	doc.save(ignore_permissions=True)
	frappe.db.commit()

	return {"ok": True, "key_id": key_id, "status": "revoked"}


@frappe.whitelist()
def list_api_keys() -> list[dict]:
	"""List API keys for the current user."""
	user = frappe.session.user
	if user == "Guest":
		frappe.throw(_("Authentication required"), frappe.AuthenticationError)

	keys = frappe.get_all(
		"Zivvy API Key",
		filters={"user": user},
		fields=["name", "label", "key_preview", "scopes", "enabled", "last_used", "creation"],
		order_by="creation desc",
	)
	return keys
