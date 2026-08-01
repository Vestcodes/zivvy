# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

from __future__ import annotations

import frappe
from frappe.utils import cint, now_datetime

from zivvy_brand.gating.tiers import DEFAULT_SEAT_CAPS, TIER_FREE, normalize_tier


def ensure_subscription_defaults():
	if not frappe.db.exists("DocType", "Zivvy Subscription"):
		return
	doc = frappe.get_single("Zivvy Subscription")
	changed = False
	if not doc.tier:
		doc.tier = TIER_FREE
		changed = True
	if not cint(doc.seats_allowed):
		doc.seats_allowed = DEFAULT_SEAT_CAPS[TIER_FREE]
		changed = True
	if not doc.status:
		doc.status = "none"
		changed = True
	if changed:
		doc.flags.ignore_permissions = True
		doc.save(ignore_permissions=True)


def get_subscription_state() -> dict:
	"""Return current plan state; safe when DocType not yet migrated."""
	defaults = {
		"tier": TIER_FREE,
		"status": "none",
		"seats_allowed": DEFAULT_SEAT_CAPS[TIER_FREE],
		"seats_used": 0,
		"polar_subscription_id": None,
		"polar_customer_id": None,
		"product_id": None,
		"current_period_end": None,
	}
	if not frappe.db.exists("DocType", "Zivvy Subscription"):
		return defaults

	try:
		doc = frappe.get_single("Zivvy Subscription")
	except Exception:
		return defaults

	from zivvy_brand.gating.seats import count_billable_users

	tier = normalize_tier(doc.tier)
	seats_allowed = cint(doc.seats_allowed) or DEFAULT_SEAT_CAPS.get(tier, DEFAULT_SEAT_CAPS[TIER_FREE])
	return {
		"tier": tier,
		"status": doc.status or "none",
		"seats_allowed": seats_allowed,
		"seats_used": count_billable_users(),
		"polar_subscription_id": doc.polar_subscription_id,
		"polar_customer_id": doc.polar_customer_id,
		"product_id": doc.product_id,
		"current_period_end": doc.current_period_end,
		"cancel_at_period_end": cint(doc.cancel_at_period_end),
		"last_synced_at": doc.last_synced_at,
	}


def apply_subscription_update(
	*,
	tier: str | None = None,
	status: str | None = None,
	seats_allowed: int | None = None,
	polar_subscription_id: str | None = None,
	polar_customer_id: str | None = None,
	product_id: str | None = None,
	current_period_end=None,
	cancel_at_period_end: bool | None = None,
	raw_event: str | None = None,
):
	"""Persist Polar webhook / sync results onto Zivvy Subscription."""
	if not frappe.db.exists("DocType", "Zivvy Subscription"):
		frappe.log_error("Zivvy Subscription DocType missing", "Zivvy Polar Sync")
		return

	doc = frappe.get_single("Zivvy Subscription")
	if tier is not None:
		doc.tier = normalize_tier(tier)
	if status is not None:
		doc.status = status
	if seats_allowed is not None:
		doc.seats_allowed = max(1, cint(seats_allowed))
	elif tier is not None:
		# Reset default cap when moving to Free
		nt = normalize_tier(tier)
		if nt == TIER_FREE:
			doc.seats_allowed = DEFAULT_SEAT_CAPS[TIER_FREE]
	if polar_subscription_id is not None:
		doc.polar_subscription_id = polar_subscription_id
	if polar_customer_id is not None:
		doc.polar_customer_id = polar_customer_id
	if product_id is not None:
		doc.product_id = product_id
	if current_period_end is not None:
		doc.current_period_end = current_period_end
	if cancel_at_period_end is not None:
		doc.cancel_at_period_end = 1 if cancel_at_period_end else 0
	if raw_event is not None:
		doc.last_webhook_type = raw_event[:140]
	doc.last_synced_at = now_datetime()
	doc.flags.ignore_permissions = True
	doc.save(ignore_permissions=True)
	frappe.db.commit()


def tier_for_product_id(product_id: str | None) -> str | None:
	if not product_id:
		return None
	settings = _polar_settings()
	pro_ids = {
		(settings.get("pro_product_id") or "").strip(),
		(settings.get("pro_annual_product_id") or "").strip(),
	}
	business_ids = {
		(settings.get("business_product_id") or "").strip(),
		(settings.get("business_annual_product_id") or "").strip(),
	}
	pro_ids.discard("")
	business_ids.discard("")
	if product_id in pro_ids:
		return "pro"
	if product_id in business_ids:
		return "business"

	# Fallback: consult Zivvy Tier catalog (self-serve checkout stores its Polar
	# product ids here). Monthly and annual are SEPARATE products in Polar, so
	# a given webhook event's product id may match either cadence — check both.
	try:
		if frappe.db.exists("DocType", "Zivvy Tier"):
			slug = frappe.db.get_value(
				"Zivvy Tier",
				{"polar_product_id_monthly": product_id},
				"slug",
			)
			if not slug:
				slug = frappe.db.get_value(
					"Zivvy Tier",
					{"polar_product_id_annual": product_id},
					"slug",
				)
			if slug:
				return normalize_tier(slug)
	except Exception:
		pass
	return None


def _polar_settings() -> dict:
	from zivvy_brand.billing.polar_client import get_polar_config

	return get_polar_config()
