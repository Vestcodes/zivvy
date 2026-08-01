# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""Login / session helpers — default Desk landing, tenant context, soft permission UX."""

from __future__ import annotations

import frappe

from zivvy_brand.auth.datacenter import get_user_datacenter
from zivvy_brand.auth.roles import DEFAULT_DESK_REDIRECT, ensure_saas_user_desk_access
from zivvy_brand.setup.setup_state import ensure_saas_setup_complete


def on_login(login_manager):
	"""Prefer /app (workspace) over /app/users after login; bind tenant defaults."""
	user = getattr(login_manager, "user", None) or frappe.session.user
	if not user or user in ("Guest",):
		return

	user_type = frappe.db.get_value("User", user, "user_type")
	if user_type != "System User" and user != "Administrator":
		return

	def _safe_log(title: str):
		"""Log without poisoning login when a prior DB statement aborted the txn."""
		try:
			frappe.db.rollback()
		except Exception:
			pass
		try:
			frappe.log_error(frappe.get_traceback(), title)
		except Exception:
			pass

	# Keep desk setup-wizard gating disabled for SaaS users.
	try:
		ensure_saas_setup_complete()
	except Exception:
		_safe_log("Zivvy on_login setup state")

	# Ensure core Desk roles still exist on residual/legacy users.
	# Skip save when already a System User with roles — HRMS User hooks can
	# fail mid-migrate and must not hard-fail login.
	try:
		roles = frappe.get_roles(user)
		user_type = frappe.db.get_value("User", user, "user_type")
		if user_type != "System User" or not roles or roles == ["All", "Guest"]:
			ensure_saas_user_desk_access(user)
	except Exception:
		_safe_log("Zivvy on_login desk access")

	# Resolve tenant into request local + ensure Company default
	try:
		from zivvy_brand.tenancy.context import get_user_tenant_name, set_request_tenant
		from zivvy_brand.tenancy.provision import create_tenant_for_signup, set_user_company_isolation

		set_request_tenant()
		if user != "Administrator":
			full_name = frappe.db.get_value("User", user, "full_name") or user.split("@")[0]
			# Idempotent guard: if signup tenant provision partially failed, repair on first login.
			create_tenant_for_signup(
				email=user,
				full_name=full_name,
				datacenter=get_user_datacenter(user),
			)
		tenant_name = get_user_tenant_name(user)
		if tenant_name:
			company = frappe.db.get_value("Zivvy Tenant", tenant_name, "company")
			if company:
				set_user_company_isolation(user, company)
	except Exception:
		_safe_log("Zivvy on_login tenant bind")

	# Fail-closed: non-ops users with no tenant must not access Desk.
	if user != "Administrator":
		from zivvy_brand.tenancy.context import get_user_tenant_name, is_ops_user

		if not get_user_tenant_name(user) and not is_ops_user(user):
			frappe.db.set_value("User", user, "enabled", 0, update_modified=False)
			frappe.local.login_manager.logout()
			frappe.throw(
				"Your workspace could not be set up. Please contact support.",
				frappe.AuthenticationError,
			)

	existing = str(frappe.cache.hget("redirect_after_login", user) or "")
	existing_lc = existing.lower()
	if (
		not existing
		or "/app/user" in existing_lc
		or "setup-wizard" in existing_lc
		or "/app/setup" in existing_lc
	):
		frappe.cache.hset("redirect_after_login", user, DEFAULT_DESK_REDIRECT)

	redirect_to = frappe.form_dict.get("redirect-to") or frappe.form_dict.get("redirect_to")
	if redirect_to:
		redirect_lc = str(redirect_to).lower()
		if (
			"/app/user" in redirect_lc
			or "setup-wizard" in redirect_lc
			or "/app/setup" in redirect_lc
		):
			if "System Manager" not in frappe.get_roles(user):
				frappe.cache.hset("redirect_after_login", user, DEFAULT_DESK_REDIRECT)


def soft_redirect_unauthorized_desk():
	"""If a Desk System User hits a forbidden non-Desk website route, send to /app."""
	if frappe.session.user in (None, "Guest"):
		return
	user_type = frappe.db.get_value("User", frappe.session.user, "user_type")
	if user_type != "System User" and frappe.session.user != "Administrator":
		return
	path = (frappe.request.path if frappe.request else "") or ""
	if path.startswith("/app"):
		return
	frappe.local.flags.redirect_location = DEFAULT_DESK_REDIRECT
	raise frappe.Redirect
