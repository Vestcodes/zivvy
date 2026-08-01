"""
Customer-facing read of the plan gating map + consolidated boot endpoint.

The frontend needs to know which modules + doctypes require Pro or Business
BEFORE the user clicks a tile — otherwise gated tiles look open and the click
resolves to an "isn't available on your plan" empty state. This endpoint
returns the authoritative map from `zivvy_brand.gating.tiers` so the frontend
stops maintaining a drift-prone mirror.

Guest-callable because Free-plan gating is public information (it's shown on
/pricing anyway). Rate-limited via Frappe's standard whitelist limits.
"""

from __future__ import annotations

import frappe
from frappe import _

from zivvy_brand.gating.tiers import (
	MODULE_MIN_TIER,
	DOCTYPE_MIN_TIER,
	TIER_FREE,
	TIER_PRO,
	TIER_BUSINESS,
	TIER_RANK,
	TIER_LABELS,
	feature_matrix,
	normalize_tier,
	tier_at_least,
)


@frappe.whitelist(allow_guest=True)
def get_tier_map() -> dict[str, dict]:
	"""Return the complete plan → feature map so the frontend can render
	gated-vs-open tiles + sidebar items without drift.

	Response shape:
	  {
	    "module_min_tier":  {"Manufacturing": "business", "Accounts": "pro", ...},
	    "doctype_min_tier": {"Journal Entry": "pro", ...},
	    "tier_rank":        {"free": 0, "pro": 1, "business": 2}
	  }

	The frontend uses this in three places:
	  1. Boot payload (via zivvy_brand.gating.boot.extend_bootinfo) — same
	     source of truth, so this endpoint is really a convenience for RSC
	     boot-server.ts which can't invoke extend_bootinfo directly.
	  2. Launcher tile locked state — before the user clicks.
	  3. Sidebar item locked state — before the user hovers.
	"""
	return {
		"module_min_tier": dict(MODULE_MIN_TIER),
		"doctype_min_tier": dict(DOCTYPE_MIN_TIER),
		"tier_rank": dict(TIER_RANK),
		"tiers": {
			"free": TIER_FREE,
			"pro": TIER_PRO,
			"business": TIER_BUSINESS,
		},
	}


@frappe.whitelist()
def backfill_wiki_role() -> dict:
	"""Ops: grant Wiki Approver to all System Users who lack it."""
	user = frappe.session.user
	if user == "Guest":
		frappe.throw(_("Login required"), frappe.AuthenticationError)
	if "System Manager" not in frappe.get_roles(user):
		frappe.throw(_("System Manager required"), frappe.PermissionError)

	if not frappe.db.exists("Role", "Wiki Approver"):
		return {"ok": False, "reason": "Wiki Approver role does not exist"}

	users_without = frappe.db.sql("""
		SELECT u.name FROM "tabUser" u
		WHERE u.user_type = 'System User' AND u.enabled = 1
		  AND u.name NOT IN ('Administrator', 'Guest')
		  AND u.name NOT IN (
		    SELECT parent FROM "tabHas Role" WHERE role = 'Wiki Approver'
		  )
	""", pluck="name")

	granted = []
	errors = []
	for email in users_without:
		try:
			user_doc = frappe.get_doc("User", email)
			user_doc.flags.ignore_permissions = True
			user_doc.append("roles", {"role": "Wiki Approver"})
			user_doc.save(ignore_permissions=True)
			granted.append(email)
		except Exception as e:
			errors.append({"user": email, "error": str(e)})

	if granted:
		frappe.db.commit()

	return {"ok": True, "granted": granted, "errors": errors, "checked": len(users_without)}


@frappe.whitelist()
def get_boot_data() -> dict:
	"""Consolidated boot endpoint for Next.js RSC — one call replaces 4+ RPCs.

	Returns: user info, plan/billing status, tenant summary, and tier map.
	"""
	from zivvy_brand.billing.subscription import get_subscription_state
	from zivvy_brand.gating.effective import get_effective_tier, get_user_demo_plan
	from zivvy_brand.gating.seats import count_billable_users, get_seat_allowance
	from zivvy_brand.tenancy.context import get_user_tenant_name, tenant_public_view

	user = frappe.session.user
	if not user or user == "Guest":
		frappe.throw(_("Login required"), frappe.AuthenticationError)

	full_name = frappe.db.get_value("User", user, "full_name") or user
	tenant_name = get_user_tenant_name(user)

	state = get_subscription_state()
	tier = get_effective_tier()
	demo_plan = get_user_demo_plan()

	tenant_info = None
	if tenant_name:
		try:
			tenant_doc = frappe.get_cached_doc("Zivvy Tenant", tenant_name)
			tenant_info = tenant_public_view(tenant_doc)
		except Exception:
			pass

	blocked_modules = [
		m for m, req in MODULE_MIN_TIER.items() if not tier_at_least(tier, req)
	]
	blocked_doctypes = [
		d for d, req in DOCTYPE_MIN_TIER.items() if not tier_at_least(tier, req)
	]

	return {
		"user": {
			"email": user,
			"full_name": full_name,
			"tenant": tenant_name,
		},
		"plan": {
			"tier": tier,
			"tier_label": TIER_LABELS.get(tier, tier.title()),
			"demo_plan": demo_plan,
			"site_tier": normalize_tier(state.get("tier")),
			"status": (tenant_info or {}).get("subscription_status") or state.get("status") or "none",
			"seats_used": count_billable_users(),
			"seats_allowed": get_seat_allowance(),
			"current_period_end": (tenant_info or {}).get("current_period_end") or state.get("current_period_end"),
			"cancel_at_period_end": (tenant_info or {}).get("cancel_at_period_end") or state.get("cancel_at_period_end"),
			"pricing": feature_matrix(),
		},
		"tenant": tenant_info,
		"tier_map": {
			"module_min_tier": dict(MODULE_MIN_TIER),
			"doctype_min_tier": dict(DOCTYPE_MIN_TIER),
		},
		"blocked_modules": blocked_modules,
		"blocked_doctypes": blocked_doctypes,
	}
