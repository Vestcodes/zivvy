# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

from __future__ import annotations

import frappe

from zivvy_brand.gating.tiers import (
	MODULE_MIN_TIER,
	DOCTYPE_MIN_TIER,
	TIER_PRO,
	TIER_LABELS,
	feature_matrix,
	normalize_tier,
	tier_at_least,
)


def extend_bootinfo(bootinfo):
	"""Expose plan + tenant + gating map to Desk for upgrade CTAs and route guards.

	Also scrub Frappe/ERPNext brand strings that Desk surfaces in chrome.
	"""
	from zivvy_brand.billing.subscription import get_subscription_state
	from zivvy_brand.gating.effective import get_effective_tier, get_user_demo_plan
	from zivvy_brand.gating.seats import count_billable_users, get_seat_allowance
	from zivvy_brand.tenancy.context import get_current_tenant, tenant_public_view

	state = get_subscription_state()
	tier = get_effective_tier()
	demo_plan = get_user_demo_plan()
	tenant = get_current_tenant()
	tenant_info = tenant_public_view(tenant)

	blocked_modules = [
		module for module, required in MODULE_MIN_TIER.items() if not tier_at_least(tier, required)
	]
	blocked_doctypes = [
		dt for dt, required in DOCTYPE_MIN_TIER.items() if not tier_at_least(tier, required)
	]

	bootinfo.zivvy = {
		"tier": tier,
		"tier_label": TIER_LABELS.get(tier, tier.title()),
		"demo_plan": demo_plan,
		"site_tier": normalize_tier(state.get("tier")),
		"priority_support": tier_at_least(tier, TIER_PRO),
		"seats_used": count_billable_users(),
		"seats_allowed": get_seat_allowance(),
		"subscription_status": (
			(tenant_info or {}).get("subscription_status")
			or state.get("status")
			or "none"
		),
		"blocked_modules": blocked_modules,
		"blocked_doctypes": blocked_doctypes,
		"module_min_tier": MODULE_MIN_TIER,
		"doctype_min_tier": DOCTYPE_MIN_TIER,
		"pricing": feature_matrix(),
		"billing_route": "/app/billing",
		"pricing_route": "/pricing",
		"tenant": tenant_info,
		"tenancy_mode": "company_per_tenant",
		"home_route": "/app/zivvy-home",
		"workspace_routes": {
			"home": "/app/zivvy-home",
			"sales": "/app/zivvy-sales",
			"finance": "/app/zivvy-finance",
			"billing": "/app/billing",
			"team": "/app/zivvy-team",
			"settings": "/app/my-settings",
			"help": "/app/help",
		},
		"frontend_origin_hint": "zivvy-web",
	}

	# SaaS tenants should never be trapped in setup wizard after login.
	try:
		bootinfo.setup_complete = True
	except Exception:
		pass
	if not getattr(bootinfo, "sysdefaults", None):
		bootinfo.sysdefaults = frappe._dict()
	bootinfo.sysdefaults["setup_complete"] = True

	_scrub_bootinfo_brand(bootinfo)


def _scrub_bootinfo_brand(bootinfo) -> None:
	"""Replace Frappe/ERPNext product chrome with Zivvy where Desk reads bootinfo."""
	from zivvy_brand.constants import CONTACT_EMAIL, LEGAL_ENTITY, PRODUCT_NAME

	logo = "/assets/zivvy_brand/images/zivvy-logo.svg"
	try:
		bootinfo.app_name = PRODUCT_NAME
	except Exception:
		pass
	for attr, value in (
		("app_logo_url", logo),
		("splash_image", logo),
		("website_title", PRODUCT_NAME),
	):
		if hasattr(bootinfo, attr):
			setattr(bootinfo, attr, value)

	# Mute Frappe Cloud marketplace suggestions
	if hasattr(bootinfo, "app_data"):
		bootinfo.app_data = []

	versions = getattr(bootinfo, "versions", None) or {}
	if isinstance(versions, dict):
		for key, meta in list(versions.items()):
			if not isinstance(meta, dict):
				continue
			title = (meta.get("title") or key or "").lower()
			if key in ("frappe", "erpnext") or "frappe" in title or "erpnext" in title:
				meta["title"] = PRODUCT_NAME if key == "frappe" else f"{PRODUCT_NAME} Ops"
				meta["description"] = f"{PRODUCT_NAME} by {LEGAL_ENTITY}"
				if meta.get("publisher"):
					meta["publisher"] = LEGAL_ENTITY
				if meta.get("email"):
					meta["email"] = CONTACT_EMAIL

