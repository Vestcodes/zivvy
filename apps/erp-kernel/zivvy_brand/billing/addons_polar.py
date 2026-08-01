# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""Polar webhook receiver for Zivvy paid add-ons.

Webhook URL (register in Polar dashboard):

  https://api.zivvy.xyz/api/method/zivvy_brand.billing.addons_polar.handle_webhook

Subscribe to:
  subscription.created, subscription.updated, subscription.canceled,
  subscription.uncanceled, checkout.updated

Reconciliation keys (first match wins):
  1. event metadata ``zivvy_addon_slug`` / ``addon_slug``
  2. product.metadata ``addon_slug``
  3. product id → Zivvy Addon.polar_product_id
"""

from __future__ import annotations

import json
import os
from typing import Any

import frappe
from frappe.utils import get_datetime, now_datetime

from zivvy_brand.billing.polar_client import get_polar_config
from zivvy_brand.billing.webhooks import (
	WebhookVerificationError,
	verify_standard_webhook,
)

ADDON_DOCTYPE = "Zivvy Addon"
TENANT_ADDON_DOCTYPE = "Zivvy Tenant Addon"

# Polar subscription statuses → Zivvy Tenant Addon.status
_STATUS_MAP = {
	"active": "active",
	"trialing": "trialing",
	"past_due": "past_due",
	"canceled": "cancelled",
	"cancelled": "cancelled",
	"revoked": "cancelled",
	"incomplete_expired": "cancelled",
	"unpaid": "past_due",
}


@frappe.whitelist(allow_guest=True, methods=["POST"])
def handle_webhook():
	"""Polar → Zivvy Tenant Addon sync endpoint."""
	cfg = get_polar_config()
	secret = (
		(os.environ.get("POLAR_ADDONS_WEBHOOK_SECRET") or "").strip()
		or (cfg.get("webhook_secret") or "").strip()
	)
	raw = frappe.request.get_data(as_text=False) or b""
	headers = {k.lower(): v for k, v in frappe.request.headers.items()}

	if not secret:
		frappe.log_error(
			"Addons Polar webhook received but POLAR_ADDONS_WEBHOOK_SECRET / "
			"POLAR_WEBHOOK_SECRET is unset",
			"Zivvy Addons Polar Webhook",
		)
		frappe.local.response["http_status_code"] = 503
		return {"ok": False, "error": "webhook_secret_not_configured"}

	try:
		verify_standard_webhook(raw, headers, secret)
	except WebhookVerificationError as e:
		frappe.local.response["http_status_code"] = 403
		return {"ok": False, "error": str(e)}

	try:
		event = json.loads(raw.decode("utf-8"))
	except Exception:
		frappe.local.response["http_status_code"] = 400
		return {"ok": False, "error": "invalid_json"}

	event_type = event.get("type") or event.get("event") or ""
	data = event.get("data") or {}

	try:
		_handle_event(event_type, data)
	except Exception:
		frappe.log_error(frappe.get_traceback(), "Zivvy Addons Polar Webhook Handler")
		frappe.local.response["http_status_code"] = 202
		return {"ok": False, "error": "handler_error"}

	frappe.local.response["http_status_code"] = 202
	return {"ok": True, "type": event_type}


def _handle_event(event_type: str, data: dict[str, Any]) -> None:
	if event_type.startswith("subscription."):
		_sync_subscription(event_type, data)
		return

	if event_type == "checkout.updated":
		# Only promote on terminal success; open/pending checkouts stay trialing.
		status = (data.get("status") or "").strip().lower()
		if status not in {"succeeded", "completed", "confirmed"}:
			return
		_sync_from_checkout(data)


def _sync_subscription(event_type: str, data: dict[str, Any]) -> None:
	addon_slug = _resolve_addon_slug(data)
	if not addon_slug:
		# Not an add-on product — ignore (seat webhooks handle Pro/Business).
		return

	tenant = _resolve_tenant(data)
	if not tenant:
		frappe.log_error(
			f"Add-on webhook {event_type}: could not resolve tenant for slug={addon_slug}",
			"Zivvy Addons Polar Webhook",
		)
		return

	addon_name = frappe.db.get_value(ADDON_DOCTYPE, {"slug": addon_slug}, "name")
	if not addon_name:
		frappe.log_error(
			f"Add-on webhook {event_type}: unknown addon_slug={addon_slug}",
			"Zivvy Addons Polar Webhook",
		)
		return

	polar_status = (data.get("status") or "").strip().lower()
	mapped = _STATUS_MAP.get(polar_status)

	if event_type in ("subscription.canceled", "subscription.revoked") or polar_status in (
		"canceled",
		"cancelled",
		"revoked",
		"incomplete_expired",
	):
		mapped = "cancelled"
	elif event_type == "subscription.uncanceled":
		mapped = mapped or "active"
	elif not mapped:
		mapped = "active"

	subscription_id = data.get("id") or ""
	period_start = data.get("current_period_start") or data.get("starts_at")
	period_end = data.get("current_period_end") or data.get("ends_at")

	row = _find_or_create_tenant_addon(
		tenant=tenant,
		addon_name=addon_name,
		polar_subscription_id=subscription_id,
	)
	row.status = mapped
	if subscription_id:
		row.polar_subscription_id = subscription_id
	if period_start:
		try:
			row.current_period_start = get_datetime(period_start)
		except Exception:
			pass
	if period_end:
		try:
			row.current_period_end = get_datetime(period_end)
		except Exception:
			pass
	if mapped == "cancelled":
		row.cancelled_at = row.cancelled_at or now_datetime()
	else:
		row.cancelled_at = None

	row.flags.ignore_permissions = True
	row.save(ignore_permissions=True)
	frappe.db.commit()


def _sync_from_checkout(data: dict[str, Any]) -> None:
	"""Promote a trialing tenant-addon after a successful checkout."""
	addon_slug = _resolve_addon_slug(data)
	if not addon_slug:
		return

	tenant = _resolve_tenant(data)
	if not tenant:
		return

	addon_name = frappe.db.get_value(ADDON_DOCTYPE, {"slug": addon_slug}, "name")
	if not addon_name:
		return

	meta = data.get("metadata") or {}
	tenant_addon_name = ""
	if isinstance(meta, dict):
		tenant_addon_name = (meta.get("zivvy_tenant_addon") or "").strip()

	subscription_id = ""
	sub = data.get("subscription") or {}
	if isinstance(sub, dict):
		subscription_id = (sub.get("id") or "").strip()
	subscription_id = subscription_id or (data.get("subscription_id") or "")

	if tenant_addon_name and frappe.db.exists(TENANT_ADDON_DOCTYPE, tenant_addon_name):
		row = frappe.get_doc(TENANT_ADDON_DOCTYPE, tenant_addon_name)
	else:
		row = _find_or_create_tenant_addon(
			tenant=tenant,
			addon_name=addon_name,
			polar_subscription_id=subscription_id,
		)

	if row.status in ("cancelled", "trialing"):
		row.status = "active"
	if subscription_id:
		row.polar_subscription_id = subscription_id
	row.cancelled_at = None
	row.flags.ignore_permissions = True
	row.save(ignore_permissions=True)
	frappe.db.commit()


def _resolve_addon_slug(data: dict[str, Any]) -> str | None:
	meta = data.get("metadata") or {}
	if isinstance(meta, dict):
		slug = (
			meta.get("zivvy_addon_slug")
			or meta.get("addon_slug")
			or meta.get("zivvy_addon")
		)
		if slug:
			return str(slug).strip().lower()

	product = data.get("product") or {}
	if isinstance(product, dict):
		pm = product.get("metadata") or {}
		if isinstance(pm, dict) and pm.get("addon_slug"):
			return str(pm["addon_slug"]).strip().lower()
		product_id = product.get("id") or data.get("product_id")
	else:
		product_id = data.get("product_id")

	if product_id:
		slug = frappe.db.get_value(ADDON_DOCTYPE, {"polar_product_id": product_id}, "slug")
		if slug:
			return str(slug).strip().lower()

	return None


def _resolve_tenant(data: dict[str, Any]) -> str | None:
	meta = data.get("metadata") or {}
	if isinstance(meta, dict):
		tid = meta.get("zivvy_tenant") or meta.get("tenant") or meta.get("tenant_id")
		if tid and frappe.db.exists("Zivvy Tenant", tid):
			return tid

	customer = data.get("customer") or {}
	if isinstance(customer, dict):
		ext = customer.get("external_id") or customer.get("externalId")
		if ext and frappe.db.exists("Zivvy Tenant", ext):
			return ext
		customer_id = customer.get("id") or data.get("customer_id")
		if customer_id:
			name = frappe.db.get_value("Zivvy Tenant", {"polar_customer_id": customer_id}, "name")
			if name:
				return name

	# Checkout / subscription may carry external_customer_id at top level
	ext = data.get("external_customer_id") or data.get("external_id")
	if ext and frappe.db.exists("Zivvy Tenant", ext):
		return ext

	subscription_id = data.get("id")
	if subscription_id:
		name = frappe.db.get_value(
			TENANT_ADDON_DOCTYPE, {"polar_subscription_id": subscription_id}, "tenant"
		)
		if name:
			return name

	return None


def _find_or_create_tenant_addon(
	*,
	tenant: str,
	addon_name: str,
	polar_subscription_id: str = "",
) -> Any:
	filters: dict[str, Any] = {"tenant": tenant, "addon": addon_name}
	if polar_subscription_id:
		by_sub = frappe.db.get_value(
			TENANT_ADDON_DOCTYPE,
			{"polar_subscription_id": polar_subscription_id},
			"name",
		)
		if by_sub:
			return frappe.get_doc(TENANT_ADDON_DOCTYPE, by_sub)

	active = frappe.get_all(
		TENANT_ADDON_DOCTYPE,
		filters={**filters, "status": ("in", ["active", "trialing", "past_due"])},
		fields=["name"],
		order_by="modified desc",
		limit=1,
		ignore_permissions=True,
	)
	if active:
		return frappe.get_doc(TENANT_ADDON_DOCTYPE, active[0].name)

	# Fall back to any prior row for this tenant+addon (e.g. cancelled → re-subscribe)
	prior = frappe.get_all(
		TENANT_ADDON_DOCTYPE,
		filters=filters,
		fields=["name"],
		order_by="modified desc",
		limit=1,
		ignore_permissions=True,
	)
	if prior:
		return frappe.get_doc(TENANT_ADDON_DOCTYPE, prior[0].name)

	price = frappe.db.get_value(ADDON_DOCTYPE, addon_name, "monthly_price_usd")
	row = frappe.get_doc(
		{
			"doctype": TENANT_ADDON_DOCTYPE,
			"tenant": tenant,
			"addon": addon_name,
			"status": "trialing",
			"quantity": 1,
			"price_locked_usd": price,
			"current_period_start": now_datetime(),
			"polar_subscription_id": polar_subscription_id or None,
		}
	)
	row.flags.ignore_permissions = True
	row.insert(ignore_permissions=True)
	return row
