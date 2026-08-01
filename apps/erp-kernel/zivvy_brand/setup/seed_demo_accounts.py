# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""Idempotent demo account seeding for Free / Pro / Business smoke tests."""

from __future__ import annotations

import os

import frappe
from frappe.utils import cint, random_string

from zivvy_brand.auth.datacenter import (
	DATACENTER_EU,
	DATACENTER_FIELD,
	DATACENTER_INDIA,
	DATACENTER_US,
	ensure_datacenter_custom_field,
)
from zivvy_brand.auth.roles import DEMO_FREE_EXTRA_ROLES, FREE_TIER_ROLES
from zivvy_brand.gating.effective import DEMO_PLAN_FIELD
from zivvy_brand.gating.tiers import TIER_BUSINESS, TIER_FREE, TIER_PRO, normalize_tier
from zivvy_brand.setup.setup_state import ensure_saas_setup_complete

DEMO_ACCOUNTS = (
	{
		"email": "demo.free@zivvy.xyz",
		"first_name": "Demo",
		"last_name": "Free",
		"tier": TIER_FREE,
		"datacenter": DATACENTER_INDIA,
		"password_env": "DEMO_FREE_PASSWORD",
	},
	{
		"email": "demo.pro@zivvy.xyz",
		"first_name": "Demo",
		"last_name": "Pro",
		"tier": TIER_PRO,
		"datacenter": DATACENTER_EU,
		"password_env": "DEMO_PRO_PASSWORD",
	},
	{
		"email": "demo.business@zivvy.xyz",
		"first_name": "Demo",
		"last_name": "Business",
		"tier": TIER_BUSINESS,
		"datacenter": DATACENTER_US,
		"password_env": "DEMO_BUSINESS_PASSWORD",
	},
	# Arcade / product-tour recording workspace (Business, isolated tenant).
	{
		"email": "demo@zivvy.xyz",
		"first_name": "Demo",
		"last_name": "Arcade",
		"tier": TIER_BUSINESS,
		"datacenter": DATACENTER_US,
		"password_env": "DEMO_ARCADE_PASSWORD",
		"password_site_key": "demo_password_arcade",
	},
)

# Roles available on a typical ERPNext install — missing roles are skipped.
# Free: CRM + Selling/Buying Desk roles (no System Manager, no User doctype).
_ROLES_BY_TIER = {
	TIER_FREE: (*FREE_TIER_ROLES, *DEMO_FREE_EXTRA_ROLES),
	TIER_PRO: (
		"Sales User",
		"Purchase User",
		"Sales Manager",
		"Purchase Manager",
		"Item Manager",
		"Accounts User",
		"Accounts Manager",
		"Stock User",
		"Stock Manager",
		"HR User",
		"HR Manager",
		"Employee",
		"Interviewer",
		"Expense Approver",
		"Leave Approver",
		"Projects User",
		"Projects Manager",
		"Manufacturing User",
		"Manufacturing Manager",
	),
	TIER_BUSINESS: (
		"Sales User",
		"Purchase User",
		"Sales Manager",
		"Purchase Manager",
		"Sales Master Manager",
		"Purchase Master Manager",
		"Item Manager",
		"Accounts User",
		"Accounts Manager",
		"Stock User",
		"Stock Manager",
		"HR User",
		"HR Manager",
		"Employee",
		"Interviewer",
		"Expense Approver",
		"Leave Approver",
		"Projects User",
		"Projects Manager",
		"Manufacturing User",
		"Manufacturing Manager",
		"Quality Manager",
		"Asset Manager",
		"Asset User",
		"Support Team",
		"Agent",
		"Wiki Approver",
		"Insights User",
	),
}


def ensure_demo_plan_custom_field():
	"""Add User.zivvy_demo_plan for per-user gating overrides (smoke / demos)."""
	if frappe.db.exists("Custom Field", {"dt": "User", "fieldname": DEMO_PLAN_FIELD}):
		return
	doc = frappe.get_doc(
		{
			"doctype": "Custom Field",
			"dt": "User",
			"fieldname": DEMO_PLAN_FIELD,
			"label": "Zivvy Demo Plan",
			"fieldtype": "Select",
			"options": "\nfree\npro\nbusiness",
			"insert_after": "user_type",
			"description": (
				"Override site subscription tier for this user (demo / smoke tests). "
				"Leave blank for normal customers — they follow Zivvy Subscription."
			),
		}
	)
	doc.insert(ignore_permissions=True)
	frappe.clear_cache(doctype="User")


def _password_for(spec: dict) -> str:
	env_name = spec["password_env"]
	password = (os.environ.get(env_name) or "").strip()
	if password:
		return password
	# Generate once and stash on site_config so re-runs stay idempotent without git secrets
	site_key = spec.get("password_site_key") or f"demo_password_{spec['tier']}"
	existing = frappe.conf.get(site_key)
	if existing:
		return str(existing)
	generated = random_string(16)
	frappe.conf[site_key] = generated
	try:
		from frappe.installer import update_site_config

		update_site_config(site_key, generated)
	except Exception:
		frappe.log_error(frappe.get_traceback(), "Zivvy demo password site_config")
	return generated


def _existing_roles() -> set[str]:
	return {r.name for r in frappe.get_all("Role", fields=["name"])}


def _apply_roles(user_doc, tier: str):
	wanted = list(_ROLES_BY_TIER.get(normalize_tier(tier), _ROLES_BY_TIER[TIER_FREE]))
	available = _existing_roles()
	roles = [r for r in wanted if r in available]
	user_doc.flags.ignore_permissions = True
	for role in roles:
		user_doc.append("roles", {"role": role})


def seed_demo_accounts():
	"""Create/update Free, Pro, Business demo users + isolated tenants. Idempotent.

	Passwords: DEMO_FREE_PASSWORD / DEMO_PRO_PASSWORD / DEMO_BUSINESS_PASSWORD /
	DEMO_ARCADE_PASSWORD env vars (preferred), else persisted under site_config
	demo_password_* (arcade uses demo_password_arcade). Never prints passwords.
	"""
	ensure_demo_plan_custom_field()
	ensure_datacenter_custom_field()
	ensure_saas_setup_complete()
	frappe.flags.zivvy_seeding_demos = True
	frappe.flags.zivvy_provisioning_tenant = True

	created = []
	updated = []
	try:
		for spec in DEMO_ACCOUNTS:
			email = spec["email"]
			tier = normalize_tier(spec["tier"])
			datacenter = spec.get("datacenter") or DATACENTER_US
			password = _password_for(spec)
			exists = frappe.db.exists("User", email)

			if exists:
				user = frappe.get_doc("User", email)
				user.enabled = 1
				user.user_type = "System User"
				user.first_name = spec["first_name"]
				user.last_name = spec["last_name"]
				user.send_welcome_email = 0
				setattr(user, DEMO_PLAN_FIELD, tier)
				setattr(user, DATACENTER_FIELD, datacenter)
				user.new_password = password
				user.flags.ignore_permissions = True
				user.flags.ignore_password_policy = True
				user.set("roles", [])
				_apply_roles(user, tier)
				user.save(ignore_permissions=True)
				updated.append(email)
			else:
				user = frappe.get_doc(
					{
						"doctype": "User",
						"email": email,
						"first_name": spec["first_name"],
						"last_name": spec["last_name"],
						"enabled": 1,
						"user_type": "System User",
						"send_welcome_email": 0,
						"new_password": password,
						DEMO_PLAN_FIELD: tier,
						DATACENTER_FIELD: datacenter,
					}
				)
				user.flags.ignore_permissions = True
				user.flags.ignore_password_policy = True
				_apply_roles(user, tier)
				user.insert(ignore_permissions=True)
				created.append(email)

			if frappe.db.has_column("User", DEMO_PLAN_FIELD):
				frappe.db.set_value("User", email, DEMO_PLAN_FIELD, tier, update_modified=False)
			if frappe.db.has_column("User", DATACENTER_FIELD):
				frappe.db.set_value(
					"User", email, DATACENTER_FIELD, datacenter, update_modified=False
				)

		frappe.db.commit()

		# Provision three isolated tenants (company-per-tenant)
		tenancy = {}
		try:
			from zivvy_brand.tenancy.migrate_existing import migrate_existing_tenants

			tenancy = migrate_existing_tenants()
		except Exception:
			frappe.log_error(frappe.get_traceback(), "Zivvy demo tenant provision")
			tenancy = {"ok": False}
	finally:
		frappe.flags.zivvy_seeding_demos = False
		frappe.flags.zivvy_provisioning_tenant = False

	return {
		"ok": True,
		"created": created,
		"updated": updated,
		"emails": [s["email"] for s in DEMO_ACCOUNTS],
		"tenancy": tenancy,
		"password_source": "env or site_config (demo_password_*) — see DEPLOY.md",
	}
