# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""Migrate existing users into company-per-tenant isolation."""

from __future__ import annotations

import frappe
from frappe.utils import now_datetime

from zivvy_brand.auth.datacenter import (
	DATACENTER_EU,
	DATACENTER_FIELD,
	DATACENTER_INDIA,
	DATACENTER_US,
	get_user_datacenter,
)
from zivvy_brand.auth.roles import FOUNDER_ADMIN_EMAILS
from zivvy_brand.gating.effective import DEMO_PLAN_FIELD
from zivvy_brand.gating.tiers import DEFAULT_SEAT_CAPS, TIER_BUSINESS, TIER_FREE, TIER_PRO, normalize_tier
from zivvy_brand.tenancy import TENANT_DOCTYPE, TENANT_FIELD
from zivvy_brand.tenancy.context import ensure_tenant_user_field
from zivvy_brand.tenancy.provision import bind_user_to_tenant, create_tenant_company, set_user_company_isolation
from zivvy_brand.tenancy.slug import unique_slug

# Founder ops tenant (System Manager may remain global)
FOUNDER_SPEC = {
	"email": "sarwagyasingh69@gmail.com",
	"tenant_name": "Sarwagya",
	"slug": "sarwagya",
	"plan": TIER_BUSINESS,
	"status": "active",
	"datacenter": DATACENTER_INDIA,
}

DEMO_SPECS = (
	{
		"email": "demo.free@zivvy.xyz",
		"tenant_name": "Demo Free",
		"slug": "demo-free",
		"plan": TIER_FREE,
		"status": "active",
		"datacenter": DATACENTER_INDIA,
	},
	{
		"email": "demo.pro@zivvy.xyz",
		"tenant_name": "Demo Pro",
		"slug": "demo-pro",
		"plan": TIER_PRO,
		"status": "active",
		"datacenter": DATACENTER_EU,
	},
	{
		"email": "demo.business@zivvy.xyz",
		"tenant_name": "Demo Business",
		"slug": "demo-business",
		"plan": TIER_BUSINESS,
		"status": "active",
		"datacenter": DATACENTER_US,
	},
)


def _ensure_tenant_for_user(spec: dict) -> dict:
	email = spec["email"]
	if not frappe.db.exists("User", email):
		return {"ok": False, "email": email, "error": "user_missing"}

	ensure_tenant_user_field()
	existing = None
	if frappe.db.has_column("User", TENANT_FIELD):
		existing = frappe.db.get_value("User", email, TENANT_FIELD)
	if existing and frappe.db.exists(TENANT_DOCTYPE, existing):
		tenant = frappe.get_doc(TENANT_DOCTYPE, existing)
		# Refresh plan / isolation
		tenant.plan = normalize_tier(spec["plan"])
		tenant.seat_limit = DEFAULT_SEAT_CAPS.get(tenant.plan, DEFAULT_SEAT_CAPS[TIER_FREE])
		tenant.status = spec.get("status") or "active"
		tenant.datacenter = spec.get("datacenter") or tenant.datacenter
		tenant.flags.ignore_permissions = True
		tenant.save(ignore_permissions=True)
		if tenant.company:
			set_user_company_isolation(email, tenant.company)
		return {
			"ok": True,
			"email": email,
			"tenant": tenant.name,
			"company": tenant.company,
			"reused": True,
		}

	slug = unique_slug(spec.get("slug") or spec["tenant_name"])
	# Prefer existing slug if free
	wanted = spec.get("slug")
	if wanted and not frappe.db.exists(TENANT_DOCTYPE, {"slug": wanted}):
		slug = wanted

	dc = spec.get("datacenter") or get_user_datacenter(email) or DATACENTER_US
	company = create_tenant_company(
		company_name=spec["tenant_name"],
		slug=slug,
		datacenter=dc,
	)
	tier = normalize_tier(spec["plan"])
	tenant = frappe.get_doc(
		{
			"doctype": TENANT_DOCTYPE,
			"tenant_name": spec["tenant_name"],
			"slug": slug,
			"status": spec.get("status") or "active",
			"plan": tier,
			"seat_limit": DEFAULT_SEAT_CAPS.get(tier, DEFAULT_SEAT_CAPS[TIER_FREE]),
			"seats_used": 1,
			"company": company,
			"owner_user": email,
			"datacenter": dc,
			"created": now_datetime(),
			"subscription_status": "none",
		}
	)
	tenant.flags.ignore_permissions = True
	tenant.insert(ignore_permissions=True)
	bind_user_to_tenant(email, tenant.name)
	set_user_company_isolation(email, company)

	# Align demo plan field with tenant plan
	if frappe.db.has_column("User", DEMO_PLAN_FIELD) and email.startswith("demo."):
		frappe.db.set_value("User", email, DEMO_PLAN_FIELD, tier, update_modified=False)
	if frappe.db.has_column("User", DATACENTER_FIELD):
		frappe.db.set_value("User", email, DATACENTER_FIELD, dc, update_modified=False)

	return {
		"ok": True,
		"email": email,
		"tenant": tenant.name,
		"company": company,
		"slug": slug,
		"reused": False,
	}


def migrate_existing_tenants() -> dict:
	"""Idempotent: founder + three demo tenants with isolated Companies."""
	if not frappe.db.exists("DocType", TENANT_DOCTYPE):
		return {"ok": False, "error": "Zivvy Tenant DocType missing — run migrate"}

	frappe.flags.zivvy_provisioning_tenant = True
	results = []
	try:
		results.append(_ensure_tenant_for_user(FOUNDER_SPEC))
		for spec in DEMO_SPECS:
			results.append(_ensure_tenant_for_user(spec))
		# Ensure founder keeps System Manager (ops)
		for email in FOUNDER_ADMIN_EMAILS:
			if frappe.db.exists("User", email):
				from zivvy_brand.auth.roles import ensure_saas_user_desk_access

				ensure_saas_user_desk_access(email, tier=TIER_BUSINESS, system_manager=True)
		frappe.db.commit()
	finally:
		frappe.flags.zivvy_provisioning_tenant = False

	return {"ok": True, "tenants": results}


def scrub_shared_default_company_pollution() -> dict:
	"""Clear site-wide default Company for tenant users so defaults stay per-user.

	Does not delete the original ERPNext default company — only stops it being
	forced onto tenant sessions via System Settings when we can avoid it.
	"""
	touched = []
	if not frappe.db.exists("DocType", TENANT_DOCTYPE):
		return {"ok": False, "touched": touched}

	# Ensure each tenant user has User Permission + DefaultValue for their company
	users = frappe.get_all(
		"User",
		filters={"enabled": 1, "user_type": "System User"},
		fields=["name", TENANT_FIELD] if frappe.db.has_column("User", TENANT_FIELD) else ["name"],
	)
	for row in users:
		tenant = row.get(TENANT_FIELD) if isinstance(row, dict) else None
		if not tenant:
			continue
		company = frappe.db.get_value(TENANT_DOCTYPE, tenant, "company")
		if company:
			set_user_company_isolation(row["name"] if isinstance(row, dict) else row.name, company)
			touched.append(row["name"] if isinstance(row, dict) else row.name)

	frappe.db.commit()
	return {"ok": True, "touched": touched}
