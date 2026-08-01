# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""Public + authenticated addon endpoints.

- ``list_addons``: public catalog (enabled Zivvy Addon rows).
- ``list_my_addons``: current tenant's active subscriptions.
- ``subscribe``: create a trialing ``Zivvy Tenant Addon`` row and, when Polar
  is configured for the addon, return a checkout URL. Falls back to a
  placeholder URL when billing is not wired up yet.
- ``cancel``: mark the tenant's active row for the addon as cancelled.
"""

from __future__ import annotations

import json
from typing import Any

import frappe
from frappe import _
from frappe.utils import now_datetime

ADDON_DOCTYPE = "Zivvy Addon"
TENANT_ADDON_DOCTYPE = "Zivvy Tenant Addon"
ACTIVE_STATUSES = ("active", "trialing")


# ---------------------------------------------------------------------------
# Public catalog
# ---------------------------------------------------------------------------

@frappe.whitelist(allow_guest=True)
def list_addons() -> list[dict]:
	"""Public list of enabled addons, safe for marketing site consumption."""
	rows = frappe.get_all(
		ADDON_DOCTYPE,
		filters={"enabled": 1},
		fields=[
			"name",
			"slug",
			"title",
			"description",
			"category",
			"monthly_price_usd",
			"annual_price_usd",
			"upstream_frappe_app",
			"upstream_url",
			"doctypes_unlocked",
			"modules_unlocked",
			"marketing_summary",
		],
		order_by="category asc, title asc",
		ignore_permissions=True,
	)
	return [_serialize_addon(row) for row in rows]


@frappe.whitelist()
def list_my_addons() -> list[dict]:
	"""Return active + trialing rows for the current tenant."""
	_require_auth()
	tenant = _current_tenant_name()
	if not tenant:
		return []

	rows = frappe.get_all(
		TENANT_ADDON_DOCTYPE,
		filters={
			"tenant": tenant,
			"status": ("in", list(ACTIVE_STATUSES)),
		},
		fields=[
			"name",
			"addon",
			"status",
			"quantity",
			"price_locked_usd",
			"current_period_start",
			"current_period_end",
			"polar_subscription_id",
		],
		order_by="modified desc",
		ignore_permissions=True,
	)

	slugs = {row["addon"] for row in rows if row.get("addon")}
	addon_map: dict[str, dict] = {}
	if slugs:
		for addon in frappe.get_all(
			ADDON_DOCTYPE,
			filters={"name": ("in", list(slugs))},
			fields=["name", "slug", "title", "category", "monthly_price_usd"],
			ignore_permissions=True,
		):
			addon_map[addon["name"]] = addon

	result: list[dict] = []
	for row in rows:
		addon = addon_map.get(row.get("addon")) or {}
		result.append(
			{
				"name": row["name"],
				"addon_slug": addon.get("slug") or row.get("addon"),
				"addon_title": addon.get("title"),
				"category": addon.get("category"),
				"status": row.get("status"),
				"quantity": row.get("quantity") or 1,
				"price_locked_usd": row.get("price_locked_usd") or addon.get("monthly_price_usd"),
				"current_period_start": row.get("current_period_start"),
				"current_period_end": row.get("current_period_end"),
				"polar_subscription_id": row.get("polar_subscription_id"),
			}
		)
	return result


# ---------------------------------------------------------------------------
# Subscribe / cancel
# ---------------------------------------------------------------------------

@frappe.whitelist()
def subscribe(addon_slug: str) -> dict:
	"""Create a trialing ``Zivvy Tenant Addon`` row for the current tenant.

	If Polar is configured and the addon has a ``polar_product_id``, this
	kicks off a checkout session and returns its URL. Otherwise it returns a
	placeholder billing URL so the frontend can still route the user to the
	billing page.
	"""
	_require_auth()
	slug = (addon_slug or "").strip().lower()
	if not slug:
		frappe.throw(_("Addon slug is required"))

	tenant = _current_tenant_name()
	if not tenant:
		frappe.throw(_("Your account is not linked to a tenant."), frappe.PermissionError)

	addon = _load_addon_by_slug(slug)
	if not addon:
		frappe.throw(_("Addon {0} not found").format(slug), frappe.DoesNotExistError)
	if not addon.enabled:
		frappe.throw(_("Addon {0} is not currently available.").format(slug))

	existing_name = _find_active_tenant_addon(tenant, addon.name)
	if existing_name:
		row = frappe.get_doc(TENANT_ADDON_DOCTYPE, existing_name)
	else:
		row = frappe.get_doc(
			{
				"doctype": TENANT_ADDON_DOCTYPE,
				"tenant": tenant,
				"addon": addon.name,
				"status": "trialing",
				"quantity": 1,
				"price_locked_usd": addon.monthly_price_usd,
				"current_period_start": now_datetime(),
			}
		)
		row.flags.ignore_permissions = True
		row.insert(ignore_permissions=True)

	checkout_url = _maybe_create_checkout(addon, tenant, row)

	frappe.db.commit()

	return {
		"ok": True,
		"tenant_addon": row.name,
		"addon_slug": slug,
		"status": row.status,
		"checkout_url": checkout_url,
	}


@frappe.whitelist()
def cancel(addon_slug: str) -> dict:
	"""Cancel the current tenant's active row for ``addon_slug``."""
	_require_auth()
	slug = (addon_slug or "").strip().lower()
	if not slug:
		frappe.throw(_("Addon slug is required"))

	tenant = _current_tenant_name()
	if not tenant:
		frappe.throw(_("Your account is not linked to a tenant."), frappe.PermissionError)

	addon = _load_addon_by_slug(slug)
	if not addon:
		frappe.throw(_("Addon {0} not found").format(slug), frappe.DoesNotExistError)

	row_name = _find_active_tenant_addon(tenant, addon.name)
	if not row_name:
		return {"ok": True, "already": True, "addon_slug": slug, "status": "cancelled"}

	row = frappe.get_doc(TENANT_ADDON_DOCTYPE, row_name)
	row.status = "cancelled"
	row.cancelled_at = now_datetime()
	row.flags.ignore_permissions = True
	row.save(ignore_permissions=True)
	frappe.db.commit()

	return {
		"ok": True,
		"tenant_addon": row.name,
		"addon_slug": slug,
		"status": row.status,
	}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _require_auth() -> None:
	user = frappe.session.user
	if not user or user == "Guest":
		frappe.throw(_("Authentication required"), frappe.AuthenticationError)


def _current_tenant_name() -> str | None:
	try:
		from zivvy_brand.tenancy.context import get_user_tenant_name

		return get_user_tenant_name()
	except Exception:
		return None


def _load_addon_by_slug(slug: str) -> Any | None:
	name = frappe.db.get_value(ADDON_DOCTYPE, {"slug": slug}, "name")
	if not name:
		return None
	return frappe.get_cached_doc(ADDON_DOCTYPE, name)


def _find_active_tenant_addon(tenant: str, addon_name: str) -> str | None:
	return frappe.db.get_value(
		TENANT_ADDON_DOCTYPE,
		{
			"tenant": tenant,
			"addon": addon_name,
			"status": ("in", list(ACTIVE_STATUSES)),
		},
		"name",
	)


def _serialize_addon(row: dict) -> dict:
	return {
		"name": row.get("name"),
		"slug": row.get("slug"),
		"title": row.get("title"),
		"description": row.get("description"),
		"category": row.get("category"),
		"monthly_price_usd": row.get("monthly_price_usd"),
		"annual_price_usd": row.get("annual_price_usd"),
		"upstream_frappe_app": row.get("upstream_frappe_app"),
		"upstream_url": row.get("upstream_url"),
		"doctypes_unlocked": _parse_json_list(row.get("doctypes_unlocked")),
		"modules_unlocked": _parse_json_list(row.get("modules_unlocked")),
		"marketing_summary": row.get("marketing_summary"),
	}


def _parse_json_list(raw: str | None) -> list[str]:
	if not raw:
		return []
	raw = raw.strip()
	if not raw:
		return []
	try:
		data = json.loads(raw)
	except Exception:
		return []
	if not isinstance(data, list):
		return []
	return [str(x) for x in data if isinstance(x, str)]


def _placeholder_checkout_url(addon_slug: str) -> str:
	return f"/app/billing?addon={addon_slug}"


def _maybe_create_checkout(addon: Any, tenant: str, row: Any) -> str:
	"""Try to create a Polar checkout session; fall back to a placeholder URL."""
	product_id = (getattr(addon, "polar_product_id", "") or "").strip()
	if not product_id:
		return _placeholder_checkout_url(addon.slug)

	try:
		from zivvy_brand.billing.polar_client import (
			PolarNotConfigured,
			create_checkout_session,
		)
	except Exception:
		return _placeholder_checkout_url(addon.slug)

	try:
		user_email = frappe.session.user if frappe.session.user != "Guest" else None
		session = create_checkout_session(
			product_id=product_id,
			seats=None,  # fixed-price add-on, not seat-based
			customer_email=user_email,
			external_customer_id=tenant,
			success_url="https://zivvy.xyz/settings/addons?polar_success=1",
			return_url="https://zivvy.xyz/settings/addons?polar_cancelled=1",
			metadata={
				"zivvy_tenant": tenant,
				"zivvy_addon_slug": addon.slug,
				"zivvy_tenant_addon": row.name,
			},
		)
		url = (session or {}).get("url") or ""
		return url or _placeholder_checkout_url(addon.slug)
	except PolarNotConfigured:
		return _placeholder_checkout_url(addon.slug)
	except Exception:
		try:
			frappe.log_error(frappe.get_traceback(), "Zivvy addon checkout")
		except Exception:
			pass
		return _placeholder_checkout_url(addon.slug)
