# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""Desk roles for SaaS self-serve (Free tier) and ops helpers."""

from __future__ import annotations

import frappe

from zivvy_brand.gating.tiers import TIER_FREE, normalize_tier
from zivvy_brand.tenancy.context import TENANT_ADMIN_ROLE

# Default landing after login / signup (Zivvy SaaS workspace shell).
DEFAULT_DESK_REDIRECT = "/app/zivvy-home"

# Free plan modules: CRM + light Selling/Buying (+ Items) + Wiki. No Accounts/Stock (Pro).
# Never grant System Manager to random website signups.
FREE_TIER_ROLES = (
	"Sales User",
	"Purchase User",
	"Item Manager",
	"Wiki Approver",
)

# Demo Free keeps light manager roles for smoke UX without User/System Manager.
DEMO_FREE_EXTRA_ROLES = (
	"Sales Manager",
	"Purchase Manager",
)

# Roles granted to the first user of a new tenant (workspace owner / admin).
# These are the Frappe *role* rights — access to gated ERPNext features is
# STILL bounded by the tier gate in ``zivvy_brand.gating.permissions``, so
# giving them to a Free tenant admin is safe: opening a Sales Invoice on Free
# will still 403 via the tier check, but Customer/Lead delete (which are Free)
# will work because the admin now has Sales Manager / Sales Master Manager.
# Must stay a superset of ``zivvy_brand.tenants.api.ASSIGNABLE_ROLES`` — an
# admin cannot grant a role they don't have themselves.
TENANT_ADMIN_ROLES = (
	TENANT_ADMIN_ROLE,
	"Sales Manager",
	"Sales Master Manager",  # required for Customer delete
	"Sales User",
	"Purchase Manager",
	"Purchase Master Manager",  # symmetric with Sales Master Manager
	"Purchase User",
	"Accounts Manager",
	"Accounts User",
	"Stock Manager",
	"Stock User",
	"Manufacturing Manager",
	"Manufacturing User",
	"HR Manager",
	"HR User",
	"Employee",
	"Expense Approver",
	"Leave Approver",
	"Projects Manager",
	"Projects User",
	"Support Team",
	"Quality Manager",
	"Asset Manager",
	"Asset User",
	"Agent",
	"Agent Manager",
	"Item Manager",
	"Wiki Approver",
	"Insights User",
)

FOUNDER_ADMIN_EMAILS = (
	"sarwagyasingh69@gmail.com",
)


def existing_role_names() -> set[str]:
	return {r.name for r in frappe.get_all("Role", fields=["name"])}


def roles_for_tier(tier: str | None = TIER_FREE, *, demo: bool = False) -> list[str]:
	tier = normalize_tier(tier)
	wanted = list(FREE_TIER_ROLES)
	if demo and tier == TIER_FREE:
		wanted.extend(DEMO_FREE_EXTRA_ROLES)
	available = existing_role_names()
	return [r for r in wanted if r in available]


def tenant_admin_roles() -> list[str]:
	"""Return the subset of TENANT_ADMIN_ROLES that actually exist on this site."""
	available = existing_role_names()
	return [r for r in TENANT_ADMIN_ROLES if r in available]


def apply_tenant_admin_roles(user_email: str) -> dict:
	"""Grant the tenant-admin role set to ``user_email``. Idempotent.

	Called during signup for the first user of a new tenant, and by the
	roles-backfill helper for pre-existing tenant owners.
	"""
	user_email = (user_email or "").strip().lower()
	if not user_email or not frappe.db.exists("User", user_email):
		return {"ok": False, "email": user_email, "error": "missing_user"}
	roles = tenant_admin_roles()
	if not roles:
		return {"ok": False, "email": user_email, "error": "no_roles_available"}
	user = frappe.get_doc("User", user_email)
	user.flags.ignore_permissions = True
	apply_desk_roles(user, roles, replace=False)
	user.save(ignore_permissions=True)
	return {
		"ok": True,
		"email": user_email,
		"granted": sorted({r.role for r in user.roles} & set(roles)),
	}


def apply_desk_roles(user_doc, roles: list[str], *, replace: bool = False):
	"""Append (or replace) roles on a User doc. Does not save."""
	user_doc.flags.ignore_permissions = True
	if replace:
		user_doc.set("roles", [])
	have = {r.role for r in (user_doc.roles or [])}
	for role in roles:
		if role not in have:
			user_doc.append("roles", {"role": role})
			have.add(role)


def promote_to_system_user(user_doc, *, roles: list[str] | None = None, replace_roles: bool = False):
	"""Ensure Desk access: System User + Free-tier (or provided) roles."""
	user_doc.user_type = "System User"
	user_doc.enabled = 1
	apply_desk_roles(user_doc, roles if roles is not None else roles_for_tier(TIER_FREE), replace=replace_roles)


def ensure_saas_user_desk_access(
	email: str,
	*,
	tier: str = TIER_FREE,
	system_manager: bool = False,
	demo: bool = False,
) -> dict:
	"""Idempotent: enable Desk for an existing user. Never prints passwords."""
	email = (email or "").strip().lower()
	if not email or not frappe.db.exists("User", email):
		return {"ok": False, "email": email, "error": "missing"}

	user = frappe.get_doc("User", email)
	user.flags.ignore_permissions = True
	user.enabled = 1
	user.user_type = "System User"

	roles = roles_for_tier(tier, demo=demo)
	if system_manager or email in FOUNDER_ADMIN_EMAILS:
		if TENANT_ADMIN_ROLE in existing_role_names():
			roles = list(dict.fromkeys([*roles, TENANT_ADMIN_ROLE]))
		if email in FOUNDER_ADMIN_EMAILS and "System Manager" in existing_role_names():
			roles = list(dict.fromkeys([*roles, "System Manager"]))

	apply_desk_roles(user, roles, replace=False)
	user.save(ignore_permissions=True)
	frappe.db.commit()
	return {
		"ok": True,
		"email": email,
		"user_type": user.user_type,
		"roles": sorted({r.role for r in user.roles}),
	}


def fix_known_saas_users() -> dict:
	"""Ops: founder + demo.* Desk access after Website User signup bug."""
	results = []
	# Founder → System Manager (admin of this Vestcodes site)
	results.append(
		ensure_saas_user_desk_access(
			"sarwagyasingh69@gmail.com",
			tier=TIER_FREE,
			system_manager=True,
		)
	)
	# Demos: Free-tier roles (seed_demo_accounts is preferred when passwords available)
	for email, tier in (
		("demo.free@zivvy.xyz", TIER_FREE),
		("demo.pro@zivvy.xyz", "pro"),
		("demo.business@zivvy.xyz", "business"),
	):
		if frappe.db.exists("User", email):
			# Prefer full seed for demos; this is a lightweight Desk unlock
			from zivvy_brand.setup.seed_demo_accounts import _apply_roles

			user = frappe.get_doc("User", email)
			user.enabled = 1
			user.user_type = "System User"
			user.flags.ignore_permissions = True
			user.set("roles", [])
			_apply_roles(user, tier)
			user.save(ignore_permissions=True)
			results.append(
				{
					"ok": True,
					"email": email,
					"user_type": "System User",
					"roles": sorted({r.role for r in user.roles}),
					"via": "seed_role_map",
				}
			)
	frappe.db.commit()
	return {"ok": True, "users": results}
