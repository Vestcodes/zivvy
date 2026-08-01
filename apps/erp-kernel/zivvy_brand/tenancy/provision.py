# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""Provision Zivvy Tenant + Company + admin User with Company isolation."""

from __future__ import annotations

import re

import frappe
from frappe import _
from frappe.utils import cint, now_datetime

from zivvy_brand.auth.datacenter import DATACENTER_US, normalize_datacenter
from zivvy_brand.gating.tiers import DEFAULT_SEAT_CAPS, TIER_FREE, normalize_tier
from zivvy_brand.tenancy import TENANT_DOCTYPE, TENANT_FIELD
from zivvy_brand.tenancy.context import ensure_tenant_user_field
from zivvy_brand.tenancy.slug import slug_from_company_or_email, unique_slug

# Currencies by datacenter preference (soft default)
_CURRENCY_BY_DC = {
	"india": "INR",
	"eu": "EUR",
	"us": "USD",
}
_COUNTRY_BY_DC = {
	"india": "India",
	"eu": "Germany",
	"us": "United States",
}


def _unique_company_name(base: str) -> str:
	name = (base or "Company").strip()[:100] or "Company"
	if not frappe.db.exists("Company", name):
		return name
	n = 1
	while frappe.db.exists("Company", f"{name} {n}"):
		n += 1
		if n > 500:
			frappe.throw(_("Could not allocate a unique Company name"))
	return f"{name} {n}"


def _abbr_from_name(company_name: str, slug: str) -> str:
	"""Short unique Company abbr (ERPNext requires unique abbr)."""
	letters = re.sub(r"[^A-Za-z0-9]", "", company_name or "")[:3].upper()
	if not letters:
		letters = re.sub(r"[^A-Za-z0-9]", "", slug or "ZVY")[:3].upper() or "ZVY"
	candidate = letters
	n = 0
	while frappe.db.exists("Company", {"abbr": candidate}):
		n += 1
		candidate = f"{letters}{n}"[:10]
		if n > 500:
			frappe.throw(_("Could not allocate a unique Company abbreviation"))
	return candidate



def _ensure_warehouse_types():
	"""ERPNext Company.on_update creates default warehouses that need these types."""
	if not frappe.db.exists("DocType", "Warehouse Type"):
		return
	for name in ("Transit",):
		if frappe.db.exists("Warehouse Type", name):
			continue
		doc = frappe.new_doc("Warehouse Type")
		doc.name = name
		doc.flags.ignore_permissions = True
		doc.insert(ignore_permissions=True)
	frappe.db.commit()


def _ensure_erpnext_masters(country: str):
	"""Backfill baseline ERPNext masters BEFORE the first tenant Company is
	inserted so Salutation / Gender / UOM / Territory / Customer Group /
	Supplier Group / Item Group / Mode of Payment / Price List references
	resolve. Idempotent; never re-raises."""
	try:
		from zivvy_brand.setup.masters_seed import seed_erpnext_masters

		seed_erpnext_masters(country=country or "United States")
	except Exception:
		try:
			frappe.log_error(frappe.get_traceback(), "Zivvy tenant provision: masters seed")
		except Exception:
			pass


def create_tenant_company(
	*,
	company_name: str,
	slug: str,
	datacenter: str | None = None,
) -> str:
	"""Create an ERPNext Company for a tenant. Returns company name."""
	dc = normalize_datacenter(datacenter) or DATACENTER_US
	name = _unique_company_name(company_name)
	abbr = _abbr_from_name(name, slug)
	currency = _CURRENCY_BY_DC.get(dc, "USD")
	country = _COUNTRY_BY_DC.get(dc, "United States")

	frappe.flags.zivvy_provisioning_tenant = True
	try:
		_ensure_warehouse_types()
		_ensure_erpnext_masters(country)
		payload = {
			"doctype": "Company",
			"company_name": name,
			"abbr": abbr,
			"default_currency": currency,
			"country": country,
		}
		# Prefer standard CoA when the field exists on this ERPNext version
		meta = frappe.get_meta("Company")
		if meta.has_field("create_chart_of_accounts_based_on"):
			payload["create_chart_of_accounts_based_on"] = "Standard Template"
		company = frappe.get_doc(payload)
		company.flags.ignore_permissions = True
		company.insert(ignore_permissions=True)
		frappe.db.commit()
		_ensure_company_stock_defaults(company.name)
		return company.name
	finally:
		frappe.flags.zivvy_provisioning_tenant = False


def _ensure_company_stock_defaults(company: str) -> None:
	"""Point Stock Settings / warehouse defaults so SO stock items don't fail WarehouseRequired."""
	try:
		warehouses = frappe.get_all(
			"Warehouse",
			filters={"company": company, "is_group": 0},
			pluck="name",
			order_by="creation asc",
			limit_page_length=5,
		)
		if not warehouses:
			return
		# Prefer a Stores-like warehouse when present
		preferred = next(
			(w for w in warehouses if "store" in w.lower()),
			warehouses[0],
		)
		if frappe.db.exists("DocType", "Stock Settings"):
			current = frappe.db.get_single_value("Stock Settings", "default_warehouse")
			if not current:
				frappe.db.set_single_value("Stock Settings", "default_warehouse", preferred)
		# Item default warehouse via Stock Settings is enough for set_missing_values
		# on many paths; also stamp Company default if the field exists.
		meta = frappe.get_meta("Company")
		if meta.has_field("default_warehouse"):
			if not frappe.db.get_value("Company", company, "default_warehouse"):
				frappe.db.set_value(
					"Company", company, "default_warehouse", preferred, update_modified=False
				)
	except Exception:
		frappe.log_error(frappe.get_traceback(), "Zivvy company stock defaults")


# DocTypes where Company User Permission should apply.
# Intentionally excludes Customer / Lead / Supplier / Item / Contact / Address —
# those are tenant-scoped via ``zivvy_tenant``. ``apply_to_all_doctypes=1`` was
# rejecting Customer rows whose ``represents_company`` Link is NULL.
def _company_user_permission_doctypes() -> tuple[str, ...]:
	from zivvy_brand.tenancy.isolation import COMPANY_SCOPED_DOCTYPES

	return tuple(
		dict.fromkeys(
			(
				"Company",
				"Bank Account",
				"Bank Transaction",
				"Quotation",
				*COMPANY_SCOPED_DOCTYPES,
			)
		)
	)


def set_user_company_isolation(user: str, company: str):
	"""User Permission + defaults so the user only sees this Company.

	Creates one User Permission row per company-keyed DocType with
	``applicable_for`` set (never ``apply_to_all_doctypes=1``). Customer /
	Lead / Supplier stay visible under tenant PQC even when
	``represents_company`` is NULL.
	"""
	if not user or not company:
		return

	# Drop legacy apply-to-all Company UPs for this user — they poison any
	# DocType that happens to Link → Company (e.g. Customer.represents_company).
	legacy = frappe.get_all(
		"User Permission",
		filters={
			"user": user,
			"allow": "Company",
			"apply_to_all_doctypes": 1,
		},
		pluck="name",
	)
	for name in legacy:
		try:
			frappe.delete_doc("User Permission", name, ignore_permissions=True, force=True)
		except Exception:
			try:
				frappe.db.delete("User Permission", {"name": name})
			except Exception:
				pass

	for doctype in _company_user_permission_doctypes():
		if not frappe.db.exists("DocType", doctype):
			continue
		exists = frappe.db.exists(
			"User Permission",
			{
				"user": user,
				"allow": "Company",
				"for_value": company,
				"applicable_for": doctype,
			},
		)
		if exists:
			# Ensure narrowed shape (never apply-to-all) + default on Company row.
			frappe.db.set_value(
				"User Permission",
				exists,
				{
					"apply_to_all_doctypes": 0,
					"is_default": 1 if doctype == "Company" else 0,
				},
				update_modified=False,
			)
			continue
		up = frappe.get_doc(
			{
				"doctype": "User Permission",
				"user": user,
				"allow": "Company",
				"for_value": company,
				"apply_to_all_doctypes": 0,
				"applicable_for": doctype,
				"is_default": 1 if doctype == "Company" else 0,
			}
		)
		up.flags.ignore_permissions = True
		up.insert(ignore_permissions=True)

	# Defaults: company
	_set_default(user, "company", company)
	# Session Defaults (Desk)
	try:
		from frappe.core.doctype.session_default_settings.session_default_settings import (
			set_session_default_values,
		)

		set_session_default_values({"company": company})
	except Exception:
		# May fail outside request / older Frappe — Defaults still set
		pass

	try:
		frappe.clear_cache(user=user)
	except Exception:
		pass


def _set_default(user: str, key: str, value: str):
	try:
		frappe.defaults.set_user_default(key, value, user)
	except Exception:
		existing = frappe.db.get_value(
			"DefaultValue",
			{"parent": user, "defkey": key},
			"name",
		)
		if existing:
			frappe.db.set_value("DefaultValue", existing, "defvalue", value, update_modified=False)
		else:
			frappe.get_doc(
				{
					"doctype": "DefaultValue",
					"parent": user,
					"parenttype": "User Permission",
					"parentfield": "defaults",
					"defkey": key,
					"defvalue": value,
				}
			).db_insert()


def bind_user_to_tenant(user: str, tenant_name: str):
	ensure_tenant_user_field()
	if frappe.db.has_column("User", TENANT_FIELD):
		frappe.db.set_value("User", user, TENANT_FIELD, tenant_name, update_modified=False)


def create_tenant_for_signup(
	*,
	email: str,
	full_name: str,
	company_name: str | None = None,
	datacenter: str | None = None,
	plan: str = TIER_FREE,
	status: str = "trial",
) -> dict:
	"""Create Tenant + Company and bind the (already inserted) User.

	Caller creates the User first; this attaches isolation + tenant record.
	"""
	if not frappe.db.exists("DocType", TENANT_DOCTYPE):
		frappe.throw(_("Zivvy Tenant DocType is not installed. Run bench migrate."))

	ensure_tenant_user_field()
	email = (email or "").strip().lower()
	full_name = (full_name or "").strip() or email
	company_label = (company_name or "").strip() or f"{full_name}'s Company"
	dc = normalize_datacenter(datacenter) or DATACENTER_US
	tier = normalize_tier(plan)

	# Idempotent: user already bound
	existing_tenant = None
	if frappe.db.has_column("User", TENANT_FIELD):
		existing_tenant = frappe.db.get_value("User", email, TENANT_FIELD)
	if existing_tenant and frappe.db.exists(TENANT_DOCTYPE, existing_tenant):
		tenant = frappe.get_doc(TENANT_DOCTYPE, existing_tenant)
		if tenant.company:
			set_user_company_isolation(email, tenant.company)
		return {
			"ok": True,
			"tenant": tenant.name,
			"company": tenant.company,
			"slug": tenant.slug,
			"reused": True,
		}

	slug = slug_from_company_or_email(company_label, email)
	company = create_tenant_company(
		company_name=company_label,
		slug=slug,
		datacenter=dc,
	)

	tenant = frappe.get_doc(
		{
			"doctype": TENANT_DOCTYPE,
			"tenant_name": company_label[:140],
			"slug": slug,
			"status": status,
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

	frappe.db.commit()

	return {
		"ok": True,
		"tenant": tenant.name,
		"company": company,
		"slug": slug,
		"reused": False,
	}


def refresh_tenant_seat_count(tenant_name: str) -> int:
	"""Recount billable users for a tenant and persist seats_used."""
	from zivvy_brand.gating.seats import count_billable_users_for_tenant

	used = count_billable_users_for_tenant(tenant_name)
	if frappe.db.exists(TENANT_DOCTYPE, tenant_name):
		frappe.db.set_value(
			TENANT_DOCTYPE,
			tenant_name,
			"seats_used",
			cint(used),
			update_modified=False,
		)
	return used


def apply_tenant_subscription_update(
	tenant_name: str,
	*,
	tier: str | None = None,
	status: str | None = None,
	seats_allowed: int | None = None,
	polar_subscription_id: str | None = None,
	polar_customer_id: str | None = None,
	product_id: str | None = None,
	current_period_end=None,
	cancel_at_period_end: bool | None = None,
):
	"""Persist Polar sync onto a Zivvy Tenant (not site Single).

	Also re-syncs the tenant owner's admin roles so that any roles added
	to ``TENANT_ADMIN_ROLES`` since the original signup are picked up
	without a manual backfill.
	"""
	if not tenant_name or not frappe.db.exists(TENANT_DOCTYPE, tenant_name):
		return
	doc = frappe.get_doc(TENANT_DOCTYPE, tenant_name)
	if tier is not None:
		doc.plan = normalize_tier(tier)
		if seats_allowed is None and normalize_tier(tier) == TIER_FREE:
			doc.seat_limit = DEFAULT_SEAT_CAPS[TIER_FREE]
	if status is not None:
		doc.subscription_status = status
		# Map Polar active → tenant active; canceled → stay active on free
		if status in ("active", "trialing"):
			doc.status = "active"
		elif status in ("canceled", "cancelled", "revoked"):
			doc.status = "active"  # downgraded to free, still usable
	if seats_allowed is not None:
		doc.seat_limit = max(1, cint(seats_allowed))
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
	doc.last_synced_at = now_datetime()
	doc.flags.ignore_permissions = True
	doc.save(ignore_permissions=True)
	frappe.db.commit()

	_sync_owner_admin_roles(doc)


def _sync_owner_admin_roles(tenant_doc) -> None:
	"""Re-apply TENANT_ADMIN_ROLES to every admin user in the tenant.

	Called on every plan change so newly-added roles propagate without
	a manual backfill. Idempotent (additive only, never removes roles).
	Syncs the workspace owner plus any team member who holds the Tenant
	Admin role.
	"""
	from zivvy_brand.auth.roles import apply_tenant_admin_roles
	from zivvy_brand.tenancy.context import TENANT_ADMIN_ROLE

	tenant_name = tenant_doc.name
	owner = getattr(tenant_doc, "owner_user", None)

	admin_emails = set()
	if owner and frappe.db.exists("User", owner):
		admin_emails.add(owner)

	if frappe.db.has_column("User", TENANT_FIELD):
		tenant_users = frappe.get_all(
			"User",
			filters={
				TENANT_FIELD: tenant_name,
				"enabled": 1,
				"user_type": "System User",
				"name": ("not in", ("Guest", "Administrator")),
			},
			pluck="name",
		)
		for email in tenant_users:
			roles = {r.role for r in frappe.get_doc("User", email).roles}
			if TENANT_ADMIN_ROLE in roles:
				admin_emails.add(email)

	for email in admin_emails:
		try:
			apply_tenant_admin_roles(email)
		except Exception:
			frappe.log_error(
				frappe.get_traceback(),
				f"Zivvy plan change: sync admin roles for {email}",
			)
