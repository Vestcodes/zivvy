# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""Resolve the effective plan tier for a user (tenant → demo → free-safe fallback)."""

from __future__ import annotations

import frappe

from zivvy_brand.gating.tiers import TIER_FREE, normalize_tier

DEMO_PLAN_FIELD = "zivvy_demo_plan"


def get_user_demo_plan(user: str | None = None) -> str | None:
	"""Return demo plan override for a user, or None if unset."""
	user = user or frappe.session.user
	if not user or user in ("Guest",):
		return None
	if not frappe.db.has_column("User", DEMO_PLAN_FIELD):
		return None
	value = frappe.db.get_value("User", user, DEMO_PLAN_FIELD)
	if not value:
		return None
	return normalize_tier(value)


def get_user_tenant_plan(user: str | None = None) -> str | None:
	"""Plan from the user's linked Zivvy Tenant (primary SaaS source of truth)."""
	user = user or frappe.session.user
	if not user or user in ("Guest",):
		return None
	try:
		from zivvy_brand.tenancy.context import get_current_tenant, get_user_tenant_name

		# Prefer request-scoped tenant when it matches the user
		tenant = get_current_tenant(user=user)
		if tenant and getattr(tenant, "plan", None):
			# Ops viewing another subdomain still need *their* plan for gating?
			# Gating uses the user's own tenant, not Host slug alone.
			linked = get_user_tenant_name(user)
			if linked and tenant.name != linked and user != "Administrator":
				tenant = frappe.get_cached_doc("Zivvy Tenant", linked) if linked else None
			if tenant and tenant.plan:
				return normalize_tier(tenant.plan)
		linked = get_user_tenant_name(user)
		if linked:
			plan = frappe.db.get_value("Zivvy Tenant", linked, "plan")
			if plan:
				return normalize_tier(plan)
	except Exception:
		return None
	return None


def get_effective_tier(user: str | None = None) -> str:
	"""Tenant plan wins; then demo override; else fail-safe to Free.

	Plan decisions must remain tenant-scoped for multi-tenant SaaS behavior.
	"""
	user = user or frappe.session.user
	tenant_plan = get_user_tenant_plan(user)
	if tenant_plan:
		return tenant_plan
	# If the user is tenant-bound but plan is missing/invalid, fail safe to Free.
	try:
		from zivvy_brand.tenancy import TENANT_FIELD

		if user and user not in ("Guest",) and frappe.db.has_column("User", TENANT_FIELD):
			if frappe.db.get_value("User", user, TENANT_FIELD):
				return TIER_FREE
	except Exception:
		pass
	demo = get_user_demo_plan(user)
	if demo:
		return demo
	return TIER_FREE


def is_demo_account(user: str | None = None) -> bool:
	return get_user_demo_plan(user) is not None
