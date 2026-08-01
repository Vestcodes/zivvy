# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

from __future__ import annotations

import frappe
from frappe import _

from zivvy_brand.gating.tiers import DEFAULT_SEAT_CAPS, TIER_BUSINESS, TIER_FREE, normalize_tier, tier_at_least

SEAT_EXEMPT_OPS_ROLES = ("System Manager", "Administrator")


def _ops_exempt_users() -> set[str]:
	"""Users who carry an ops role AND have no tenant link — true ops staff, not billed."""
	from zivvy_brand.tenancy import TENANT_FIELD

	rows = frappe.get_all(
		"Has Role",
		filters={"parenttype": "User", "role": ("in", SEAT_EXEMPT_OPS_ROLES)},
		pluck="parent",
	)
	if not rows:
		return set()
	if not frappe.db.has_column("User", TENANT_FIELD):
		return {u for u in rows if u}
	exempt = set()
	for user in rows:
		if not user:
			continue
		tenant = frappe.db.get_value("User", user, TENANT_FIELD)
		if not tenant:
			exempt.add(user)
	return exempt


def _doc_has_ops_role(doc) -> bool:
	roles = doc.get("roles") or []
	for row in roles:
		role = row.get("role") if hasattr(row, "get") else getattr(row, "role", None)
		if role in SEAT_EXEMPT_OPS_ROLES:
			return True
	return False


def count_billable_users_for_tenant(tenant_name: str | None) -> int:
	"""Enabled System Users bound to this tenant (excludes Administrator + ops users)."""
	from zivvy_brand.tenancy import TENANT_FIELD

	if not tenant_name:
		return 0
	filters = {
		"enabled": 1,
		"user_type": "System User",
		"name": ("not in", ("Guest", "Administrator")),
	}
	if frappe.db.has_column("User", TENANT_FIELD):
		filters[TENANT_FIELD] = tenant_name
	else:
		return 0

	rows = frappe.get_all("User", filters=filters, fields=["name"])
	ops_users = _ops_exempt_users()
	return sum(1 for row in rows if row.get("name") not in ops_users)


def count_billable_users(user: str | None = None) -> int:
	"""Billable seats for the current user's tenant (site-wide only as last resort)."""
	from zivvy_brand.tenancy import TENANT_FIELD
	from zivvy_brand.tenancy.context import get_user_tenant_name

	user = user or frappe.session.user
	tenant = get_user_tenant_name(user) if user and user not in ("Guest",) else None
	if tenant:
		return count_billable_users_for_tenant(tenant)

	# Legacy site-wide count (pre-tenant users / ops)
	filters = {
		"enabled": 1,
		"user_type": "System User",
		"name": ("not in", ("Guest", "Administrator")),
	}
	fields = ["name", TENANT_FIELD] if frappe.db.has_column("User", TENANT_FIELD) else ["name"]
	rows = frappe.get_all("User", filters=filters, fields=fields)
	ops_users = _ops_exempt_users()
	return sum(
		1
		for row in rows
		if row.get("name") not in ops_users and not row.get(TENANT_FIELD)
	)


def get_seat_allowance_for_tenant(tenant_name: str | None) -> int | None:
	if tenant_name and frappe.db.exists("Zivvy Tenant", tenant_name):
		row = frappe.db.get_value(
			"Zivvy Tenant",
			tenant_name,
			["plan", "seat_limit"],
			as_dict=True,
		)
		if row:
			allowed = row.get("seat_limit")
			if allowed is not None and int(allowed) > 0:
				return int(allowed)
			tier = normalize_tier(row.get("plan"))
			return int(DEFAULT_SEAT_CAPS.get(tier, DEFAULT_SEAT_CAPS[TIER_FREE]))
	return None


def get_seat_allowance(user: str | None = None) -> int:
	"""Seat cap for the current user's tenant (or site Single fallback)."""
	from zivvy_brand.tenancy.context import get_user_tenant_name

	user = user or frappe.session.user
	# Demo accounts always use the plan's soft seat cap (not a stuck Free leftover).
	try:
		from zivvy_brand.gating.effective import get_user_demo_plan

		demo = get_user_demo_plan(user)
		if demo and demo != TIER_FREE:
			return int(DEFAULT_SEAT_CAPS.get(demo, DEFAULT_SEAT_CAPS[TIER_BUSINESS]))
	except Exception:
		pass

	tenant_name = get_user_tenant_name(user) if user and user not in ("Guest",) else None
	tenant_cap = get_seat_allowance_for_tenant(tenant_name)
	if tenant_cap is not None:
		return tenant_cap

	from zivvy_brand.billing.subscription import get_subscription_state

	state = get_subscription_state()
	tier = normalize_tier(state.get("tier"))
	allowed = state.get("seats_allowed")
	if allowed is not None and int(allowed) > 0:
		return int(allowed)
	return int(DEFAULT_SEAT_CAPS.get(tier, DEFAULT_SEAT_CAPS[TIER_FREE]))


def validate_user_seat(doc, method=None):
	"""Enforce Free 2-user (and paid) caps **within the user's tenant**."""
	if frappe.flags.in_install or frappe.flags.in_migrate or frappe.flags.in_patch:
		return
	if frappe.flags.get("zivvy_provisioning_tenant") or frappe.flags.get("zivvy_seeding_demos"):
		return

	if doc.name in ("Guest", "Administrator"):
		return
	if doc.name in _ops_exempt_users() or _doc_has_ops_role(doc):
		return

	user_type = doc.get("user_type") or "System User"
	if user_type != "System User":
		return
	if not doc.get("enabled"):
		return

	is_new = doc.is_new()
	was_enabled = True
	if not is_new:
		was_enabled = bool(frappe.db.get_value("User", doc.name, "enabled"))

	if not is_new and was_enabled:
		return

	from zivvy_brand.tenancy import TENANT_FIELD
	from zivvy_brand.tenancy.context import get_user_tenant_name

	tenant = doc.get(TENANT_FIELD) or get_user_tenant_name(doc.name)
	# When inviting a new user into a tenant, prefer session user's tenant
	if not tenant and frappe.session.user not in ("Guest", "Administrator"):
		tenant = get_user_tenant_name(frappe.session.user)

	allowed = get_seat_allowance_for_tenant(tenant) if tenant else None
	if allowed is None:
		allowed = get_seat_allowance(doc.name if tenant else frappe.session.user)
	if tenant:
		used = count_billable_users_for_tenant(tenant)
	else:
		used = count_billable_users()

	projected = used + 1 if (is_new or not was_enabled) else used

	if projected > allowed:
		from zivvy_brand.gating.effective import get_effective_tier

		tier = (
			normalize_tier(frappe.db.get_value("Zivvy Tenant", tenant, "plan"))
			if tenant and frappe.db.exists("Zivvy Tenant", tenant)
			else get_effective_tier(frappe.session.user)
		)
		if tier == TIER_FREE:
			msg = _(
				"The Free plan allows up to {0} seats for this workspace. "
				"Disable another user or upgrade to Pro/Business."
			).format(int(allowed))
		else:
			msg = _(
				"Seat limit reached: {0} allowed, {1} in use for this workspace. "
				"Add seats in Billing or disable another user."
			).format(int(allowed), int(used))
		frappe.throw(msg, title=_("Seat limit reached"))


def sync_user_tenant_seat_count(doc, method=None):
	"""Keep Tenant.seats_used accurate after user edits/invites/disables."""
	if frappe.flags.in_install or frappe.flags.in_migrate or frappe.flags.in_patch:
		return
	from zivvy_brand.tenancy import TENANT_FIELD
	from zivvy_brand.tenancy.provision import refresh_tenant_seat_count

	tenants: set[str] = set()
	before = doc.get_doc_before_save() if hasattr(doc, "get_doc_before_save") else None
	if before and getattr(before, TENANT_FIELD, None):
		tenants.add(getattr(before, TENANT_FIELD))
	current = doc.get(TENANT_FIELD)
	if current:
		tenants.add(current)
	if not tenants and doc.name and doc.name not in ("Guest",):
		try:
			old = frappe.db.get_value("User", doc.name, TENANT_FIELD)
			if old:
				tenants.add(old)
		except Exception:
			pass

	for tenant in tenants:
		try:
			refresh_tenant_seat_count(tenant)
		except Exception:
			frappe.log_error(frappe.get_traceback(), "Zivvy seat count refresh failed")


def validate_company_multi(doc, method=None):
	"""Extra companies require Business **for that tenant** (not site-wide)."""
	if frappe.flags.in_install or frappe.flags.in_migrate or frappe.flags.in_patch:
		return
	if frappe.flags.get("zivvy_provisioning_tenant"):
		return
	if not doc.is_new():
		return

	from zivvy_brand.gating.effective import get_effective_tier
	from zivvy_brand.tenancy import TENANT_DOCTYPE
	from zivvy_brand.tenancy.context import get_user_tenant_name, is_ops_user

	if is_ops_user():
		return

	tier = get_effective_tier()
	tenant = get_user_tenant_name()
	if tenant and frappe.db.exists(TENANT_DOCTYPE, tenant):
		# Tenant already has its primary company — additional need Business
		primary = frappe.db.get_value(TENANT_DOCTYPE, tenant, "company")
		if primary and not tier_at_least(tier, TIER_BUSINESS):
			frappe.throw(
				_("Multiple companies require the Business plan. Upgrade in Billing."),
				title=_("Upgrade required"),
			)
		return

	# Unbound / legacy: block second site company unless Business
	existing = frappe.db.count("Company")
	if existing >= 1 and not tier_at_least(tier, TIER_BUSINESS):
		frappe.throw(
			_("Multiple companies require the Business plan. Upgrade in Billing."),
			title=_("Upgrade required"),
		)
