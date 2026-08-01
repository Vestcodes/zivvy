"""
Customer-facing team management API — the endpoints powering the /settings/team
page on zivvy.xyz.

All methods here follow the same contract:
  - @frappe.whitelist() with an explicit role check (Zivvy Tenant Admin on
    the caller's tenant). We do NOT rely on Frappe's permission_query for
    role mutations — those depend on doc-level perms that don't naturally
    scope by zivvy_tenant.
  - Every mutation is scoped by the caller's zivvy_tenant. Cross-tenant
    grants are rejected even if the caller is an Ops user.
  - Rate-limit invites — 20/hour/user — to prevent enumeration/spam.
  - Errors thrown via frappe.throw so the frontend's parseFrappeError picks
    them up and renders inline.
"""

from __future__ import annotations

import re
from typing import Any

import frappe
from frappe import _
from frappe.rate_limiter import rate_limit

from zivvy_brand.gating.seats import (
	count_billable_users_for_tenant,
	get_seat_allowance_for_tenant,
)
from zivvy_brand.tenancy.context import TENANT_ADMIN_ROLE, get_user_tenant_name

# Roles a tenant admin is allowed to grant/revoke. System Manager is
# deliberately excluded — it is an ops-level role that must never be
# assignable by tenant admins, because it bypasses all pqc/has_permission
# isolation when the user has no tenant link.
ASSIGNABLE_ROLES: tuple[str, ...] = (
	TENANT_ADMIN_ROLE,
	"Sales Manager",
	"Sales Master Manager",  # required for Customer delete on Frappe's stock role perms
	"Sales User",
	"Purchase Manager",
	"Purchase Master Manager",
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
	"Item Manager",
	"Wiki Approver",
	"Insights User",
)

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class TenantsApiError(frappe.ValidationError):
	pass


def _require_login() -> str:
	user = frappe.session.user
	if not user or user == "Guest":
		frappe.throw(_("Please sign in."), frappe.AuthenticationError)
	return user


def _require_tenant_admin() -> tuple[str, str]:
	"""Returns (caller_email, caller_tenant_name). Rejects if caller isn't
	an admin of a real tenant."""
	caller = _require_login()
	tenant = get_user_tenant_name(caller)
	if not tenant:
		frappe.throw(
			_("Your account isn't linked to a workspace yet."),
			TenantsApiError,
		)
	roles = set(frappe.get_roles(caller))
	if TENANT_ADMIN_ROLE not in roles and "System Manager" not in roles:
		frappe.throw(
			_("Only workspace admins can manage the team."),
			frappe.PermissionError,
		)
	return caller, tenant


def _validate_role(role: str) -> None:
	if role not in ASSIGNABLE_ROLES:
		frappe.throw(
			_("Role {0} isn't available. Contact support if you need it.").format(role),
			TenantsApiError,
		)


def _same_tenant(user_email: str, tenant: str) -> bool:
	from zivvy_brand.tenancy import TENANT_FIELD

	if not frappe.db.has_column("User", TENANT_FIELD):
		return False
	value = frappe.db.get_value("User", user_email, TENANT_FIELD)
	return bool(value) and value == tenant


@frappe.whitelist()
def list_assignable_roles() -> list[str]:
	"""Return the roles a tenant admin can grant. Called by the frontend
	to populate the role picker without hard-coding the list twice."""
	_require_tenant_admin()
	return list(ASSIGNABLE_ROLES)


@frappe.whitelist()
def invite_user(
	email: str,
	full_name: str = "",
	role: str = "Sales User",
	role_template: str | None = None,
) -> dict[str, Any]:
	"""Invite a new teammate to the caller's tenant.

	Creates a User with `zivvy_tenant = <caller tenant>`, grants the requested
	role(s) plus the baseline `System User` role, and sends a password-setup
	link via the site's configured mailer (Resend HTTP in prod).

	Pass ``role_template`` (template name) to assign all roles from a saved
	template instead of a single ``role``.

	Rate-limited to 20/hour/user to prevent invite spam / user enumeration.
	"""

	@rate_limit(limit=20, seconds=3600, key="user")
	def _guarded() -> dict[str, Any]:
		caller, tenant = _require_tenant_admin()

		email_clean = (email or "").strip().lower()
		if not _EMAIL_RE.match(email_clean):
			frappe.throw(_("That doesn't look like a valid email address."), TenantsApiError)

		# Resolve roles: template wins over single role
		invite_roles: list[str] = []
		template_used = None
		if role_template:
			tpl = frappe.get_all(
				"Zivvy Role Template",
				filters={"zivvy_tenant": tenant, "template_name": role_template},
				fields=["name"],
				limit_page_length=1,
			)
			if not tpl:
				frappe.throw(
					_("Role template {0} not found.").format(role_template),
					TenantsApiError,
				)
			invite_roles = [
				r.role
				for r in frappe.get_all(
					"Zivvy Role Template Item",
					filters={"parent": tpl[0].name},
					fields=["role"],
					order_by="idx asc",
				)
			]
			template_used = role_template
		else:
			_validate_role(role)
			invite_roles = [role]

		if frappe.db.exists("User", email_clean):
			if _same_tenant(email_clean, tenant):
				frappe.throw(
					_("{0} is already in your workspace.").format(email_clean),
					TenantsApiError,
				)
			frappe.throw(
				_("Could not send the invite. Please try a different email address."),
				TenantsApiError,
			)

		allowance = get_seat_allowance_for_tenant(tenant)
		used = count_billable_users_for_tenant(tenant)
		if allowance is not None and used >= allowance:
			frappe.throw(
				_("You've used all {0} seats on this plan. Upgrade to invite more teammates.").format(allowance),
				TenantsApiError,
			)

		from zivvy_brand.tenancy import TENANT_FIELD

		user_roles = [{"role": "System User"}]
		for r in invite_roles:
			user_roles.append({"role": r})

		user_doc = frappe.get_doc(
			{
				"doctype": "User",
				"email": email_clean,
				"first_name": (full_name or email_clean.split("@")[0]).strip(),
				"send_welcome_email": 0,
				"enabled": 1,
				"user_type": "System User",
				TENANT_FIELD: tenant,
				"roles": user_roles,
			}
		)
		user_doc.flags.no_welcome_mail = True
		user_doc.insert(ignore_permissions=True)

		display_role = template_used or role
		reset_url = _make_reset_link(user_doc.name)
		_send_invite_email(
			recipient=email_clean,
			inviter_email=caller,
			tenant=tenant,
			reset_url=reset_url,
			role=display_role,
		)

		return {
			"ok": True,
			"user": email_clean,
			"role": display_role,
			"roles": invite_roles,
			"template": template_used,
			"seats_used": used + 1,
			"seats_allowed": allowance,
		}

	return _guarded()


@frappe.whitelist()
def set_user_roles(email: str, roles: list[str] | str) -> dict[str, Any]:
	"""Replace the assignable-roles portion of a target user's role list.

	Non-assignable roles (Administrator, Auditor, etc.) are preserved
	untouched — this endpoint only manages the subset the tenant admin is
	permitted to grant. Cross-tenant grants and self-demotion out of
	System Manager are both rejected.
	"""
	import json

	caller, tenant = _require_tenant_admin()

	target_email = (email or "").strip().lower()
	if not target_email:
		frappe.throw(_("Missing target user."), TenantsApiError)

	if isinstance(roles, str):
		try:
			roles = json.loads(roles)
		except json.JSONDecodeError:
			frappe.throw(_("Roles must be a JSON array of role names."), TenantsApiError)

	if not isinstance(roles, list):
		frappe.throw(_("Roles must be a list."), TenantsApiError)

	requested = {str(r) for r in roles if isinstance(r, str) and r}
	invalid = requested - set(ASSIGNABLE_ROLES)
	if invalid:
		frappe.throw(
			_("These roles aren't available: {0}").format(", ".join(sorted(invalid))),
			TenantsApiError,
		)

	if not frappe.db.exists("User", target_email):
		frappe.throw(_("That user isn't in your workspace."), TenantsApiError)

	if not _same_tenant(target_email, tenant):
		# Never leak that the user exists in another tenant.
		frappe.throw(_("That user isn't in your workspace."), TenantsApiError)

	# Guard: caller can't demote themselves out of the admin role.
	if target_email == caller and TENANT_ADMIN_ROLE not in requested:
		frappe.throw(
			_("You can't remove your own admin role. Ask another admin to do it."),
			TenantsApiError,
		)

	# Load the user and diff the assignable-roles slice.
	user_doc = frappe.get_doc("User", target_email)
	current_assignable = {r.role for r in user_doc.roles if r.role in ASSIGNABLE_ROLES}
	if current_assignable == requested:
		return {"ok": True, "user": target_email, "unchanged": True}

	# Preserve everything outside the assignable set.
	preserved = [r for r in user_doc.roles if r.role not in ASSIGNABLE_ROLES]
	user_doc.set("roles", preserved)
	for role in sorted(requested):
		user_doc.append("roles", {"role": role})
	user_doc.save(ignore_permissions=True)

	_clear_user_sessions(target_email)
	return {"ok": True, "user": target_email, "roles": sorted(requested)}


@frappe.whitelist()
def disable_user(email: str) -> dict[str, Any]:
	"""Disable a teammate's seat. Same tenant guard as role editing.

	Uses `enabled = 0` rather than deleting the User so historical docs keep
	their creator/modifier references intact. Frappe's session table is not
	cleared by us — existing sessions may keep working until they expire,
	consistent with how Desk's own disable works. Note this in the frontend.
	"""
	caller, tenant = _require_tenant_admin()
	target_email = (email or "").strip().lower()
	if not target_email:
		frappe.throw(_("Missing target user."), TenantsApiError)
	if target_email == caller:
		frappe.throw(_("You can't disable your own seat."), TenantsApiError)
	if not frappe.db.exists("User", target_email):
		frappe.throw(_("That user isn't in your workspace."), TenantsApiError)
	if not _same_tenant(target_email, tenant):
		frappe.throw(_("That user isn't in your workspace."), TenantsApiError)

	frappe.db.set_value("User", target_email, "enabled", 0)
	terminated = _clear_user_sessions(target_email)
	return {"ok": True, "user": target_email, "enabled": 0, "sessions_terminated": terminated}


@frappe.whitelist()
def enable_user(email: str) -> dict[str, Any]:
	caller, tenant = _require_tenant_admin()
	target_email = (email or "").strip().lower()
	if not target_email or not frappe.db.exists("User", target_email):
		frappe.throw(_("That user isn't in your workspace."), TenantsApiError)
	if not _same_tenant(target_email, tenant):
		frappe.throw(_("That user isn't in your workspace."), TenantsApiError)

	allowance = get_seat_allowance_for_tenant(tenant)
	used = count_billable_users_for_tenant(tenant)
	if allowance is not None and used >= allowance:
		frappe.throw(
			_("Re-enabling this seat would exceed your plan cap. Upgrade or disable another seat first."),
			TenantsApiError,
		)

	frappe.db.set_value("User", target_email, "enabled", 1)
	return {"ok": True, "user": target_email, "enabled": 1}


def _clear_user_sessions(user_email: str) -> int:
	"""Terminate all active sessions for a user so role/disable changes take
	effect immediately rather than at session TTL expiry."""
	count = frappe.db.count("Sessions", {"user": user_email})
	if count:
		frappe.db.delete("Sessions", {"user": user_email})
	frappe.clear_cache(user=user_email)
	return count


# ---------------------------------------------------------------------------
# Role template CRUD


ROLE_DESCRIPTIONS: dict[str, str] = {
	"Sales Manager": "Full control over CRM, leads, opportunities, and sales pipeline",
	"Sales Master Manager": "Delete customers and manage master sales data",
	"Sales User": "View and create leads, opportunities, quotations, and orders",
	"Purchase Manager": "Full control over purchasing, suppliers, and purchase orders",
	"Purchase Master Manager": "Delete suppliers and manage master purchase data",
	"Purchase User": "View and create suppliers, purchase orders, and receipts",
	"Accounts Manager": "Full control over invoices, payments, and journal entries",
	"Accounts User": "View and create invoices and basic accounting entries",
	"Stock Manager": "Full control over inventory, warehouses, and stock movements",
	"Stock User": "View and create stock entries, delivery notes, and receipts",
	"Manufacturing Manager": "Full control over BOMs, work orders, and production",
	"Manufacturing User": "View and create work orders and manufacturing entries",
	"HR Manager": "Full control over employees, attendance, payroll, and leaves",
	"HR User": "View and create employee records and leave applications",
	"Projects Manager": "Full control over projects, tasks, and timesheets",
	"Projects User": "View and create tasks and log time against projects",
	"Employee": "Self-service access to leaves, expenses, and payslips",
	"Expense Approver": "Approve employee expense claims",
	"Leave Approver": "Approve employee leave applications",
	"Support Team": "Manage support tickets and customer issues",
	"Quality Manager": "Create and manage quality inspections",
	"Asset Manager": "Full control over fixed assets and depreciation",
	"Asset User": "View and create asset records and maintenance logs",
	"Agent": "Manage helpdesk tickets, knowledge base, and teams",
	"Item Manager": "Create and manage items and pricing",
	"Wiki Approver": "Approve and manage internal wiki content",
	"Insights User": "Create dashboards, charts, and run custom queries",
}


@frappe.whitelist()
def list_role_templates() -> list[dict]:
	"""List all role templates for the caller's tenant."""
	_caller, tenant = _require_tenant_admin()
	if not frappe.db.exists("DocType", "Zivvy Role Template"):
		return []
	templates = frappe.get_all(
		"Zivvy Role Template",
		filters={"zivvy_tenant": tenant},
		fields=["name", "template_name", "description", "is_default", "creation"],
		order_by="creation asc",
	)
	for t in templates:
		t["roles"] = [
			r.role
			for r in frappe.get_all(
				"Zivvy Role Template Item",
				filters={"parent": t["name"]},
				fields=["role"],
				order_by="idx asc",
			)
		]
	return templates


@frappe.whitelist()
def get_role_descriptions() -> dict[str, dict]:
	"""Return available roles with human-friendly descriptions for the UI."""
	_require_tenant_admin()
	return {
		role: {"label": role, "description": ROLE_DESCRIPTIONS.get(role, "")}
		for role in ASSIGNABLE_ROLES
	}


@frappe.whitelist()
def create_role_template(
	template_name: str,
	roles: list[str] | str,
	description: str = "",
	is_default: bool = False,
) -> dict[str, Any]:
	"""Create a new role template for the caller's tenant."""
	import json

	caller, tenant = _require_tenant_admin()

	template_name = (template_name or "").strip()
	if not template_name:
		frappe.throw(_("Template name is required."), TenantsApiError)

	if isinstance(roles, str):
		try:
			roles = json.loads(roles)
		except json.JSONDecodeError:
			frappe.throw(_("Roles must be a JSON array."), TenantsApiError)

	if not roles or not isinstance(roles, list):
		frappe.throw(_("At least one role is required."), TenantsApiError)

	for role in roles:
		_validate_role(role)

	doc = frappe.get_doc({
		"doctype": "Zivvy Role Template",
		"template_name": template_name,
		"description": (description or "").strip(),
		"is_default": 1 if is_default else 0,
		"zivvy_tenant": tenant,
		"roles": [{"role": r} for r in roles],
	})
	doc.insert(ignore_permissions=True)
	return {
		"ok": True,
		"name": doc.name,
		"template_name": doc.template_name,
		"roles": [r.role for r in doc.roles],
	}


@frappe.whitelist()
def update_role_template(
	name: str,
	template_name: str | None = None,
	roles: list[str] | str | None = None,
	description: str | None = None,
	is_default: bool | None = None,
) -> dict[str, Any]:
	"""Update an existing role template. Caller must own it."""
	import json

	_caller, tenant = _require_tenant_admin()

	if not frappe.db.exists("Zivvy Role Template", name):
		frappe.throw(_("Template not found."), TenantsApiError)

	doc = frappe.get_doc("Zivvy Role Template", name)
	if doc.zivvy_tenant != tenant:
		frappe.throw(_("Template not found."), TenantsApiError)

	if template_name is not None:
		doc.template_name = (template_name or "").strip()

	if description is not None:
		doc.description = (description or "").strip()

	if is_default is not None:
		doc.is_default = 1 if is_default else 0

	if roles is not None:
		if isinstance(roles, str):
			try:
				roles = json.loads(roles)
			except json.JSONDecodeError:
				frappe.throw(_("Roles must be a JSON array."), TenantsApiError)
		if not roles or not isinstance(roles, list):
			frappe.throw(_("At least one role is required."), TenantsApiError)
		for role in roles:
			_validate_role(role)
		doc.set("roles", [{"role": r} for r in roles])

	doc.save(ignore_permissions=True)
	return {
		"ok": True,
		"name": doc.name,
		"template_name": doc.template_name,
		"roles": [r.role for r in doc.roles],
	}


@frappe.whitelist()
def delete_role_template(name: str) -> dict[str, Any]:
	"""Delete a role template. Does not revoke roles from users who were
	assigned via this template — those are persisted on the User doc."""
	_caller, tenant = _require_tenant_admin()

	if not frappe.db.exists("Zivvy Role Template", name):
		frappe.throw(_("Template not found."), TenantsApiError)

	doc = frappe.get_doc("Zivvy Role Template", name)
	if doc.zivvy_tenant != tenant:
		frappe.throw(_("Template not found."), TenantsApiError)

	doc.delete(ignore_permissions=True)
	return {"ok": True, "deleted": name}


@frappe.whitelist()
def apply_role_template(email: str, template_name: str) -> dict[str, Any]:
	"""Apply a role template to a user — replaces their assignable roles with
	the template's role set. Same guards as set_user_roles."""
	caller, tenant = _require_tenant_admin()

	target_email = (email or "").strip().lower()
	if not target_email or not frappe.db.exists("User", target_email):
		frappe.throw(_("That user isn't in your workspace."), TenantsApiError)

	if not _same_tenant(target_email, tenant):
		frappe.throw(_("That user isn't in your workspace."), TenantsApiError)

	template = frappe.get_all(
		"Zivvy Role Template",
		filters={"zivvy_tenant": tenant, "template_name": template_name},
		fields=["name"],
		limit_page_length=1,
	)
	if not template:
		frappe.throw(_("Template {0} not found.").format(template_name), TenantsApiError)

	doc = frappe.get_doc("Zivvy Role Template", template[0].name)
	requested = {r.role for r in doc.roles}

	if target_email == caller and TENANT_ADMIN_ROLE not in requested:
		frappe.throw(
			_("You can't remove your own admin role. Ask another admin to do it."),
			TenantsApiError,
		)

	user_doc = frappe.get_doc("User", target_email)
	preserved = [r for r in user_doc.roles if r.role not in ASSIGNABLE_ROLES]
	user_doc.set("roles", preserved)
	for role in sorted(requested):
		user_doc.append("roles", {"role": role})
	user_doc.save(ignore_permissions=True)

	_clear_user_sessions(target_email)
	return {
		"ok": True,
		"user": target_email,
		"template": template_name,
		"roles": sorted(requested),
	}


# ---------------------------------------------------------------------------
# Email helpers


def _make_reset_link(user_email: str) -> str:
	"""Reset link with the user's `reset_password_key` — same mechanism as
	the built-in reset email, but we build the URL ourselves so the host
	matches host_name (zivvy.xyz) even if the request came in via Vercel
	proxy where the incoming Host header is the frontend."""
	user_doc = frappe.get_doc("User", user_email)
	key = user_doc.reset_password(send_email=False)
	base = frappe.utils.get_url()
	return f"{base}/update-password?key={key}&password_expired=1"


def _send_invite_email(
	recipient: str,
	inviter_email: str,
	tenant: str,
	reset_url: str,
	role: str,
) -> None:
	"""Send the branded invite email directly via Resend HTTP.

	Bypasses Frappe's Email Queue which silently swallows send failures.
	"""
	from zivvy_brand.email.resend import get_resend_config
	from zivvy_brand.email.resend_http import _post_resend
	from zivvy_brand.email.templates import cta_button, wrap

	tenant_display = tenant
	tenant_row = frappe.db.get_value("Zivvy Tenant", tenant, ["tenant_name"], as_dict=True)
	if tenant_row and tenant_row.get("tenant_name"):
		tenant_display = tenant_row["tenant_name"]

	inviter_name = frappe.db.get_value("User", inviter_email, "full_name") or inviter_email

	subject = _("You're invited to {0} on Zivvy").format(tenant_display)
	inner = f"""
		<h1 style="margin:0 0 12px 0;font-size:22px;line-height:1.3;font-weight:600;color:#0f1729;">
			You're invited to {frappe.utils.escape_html(tenant_display)}
		</h1>
		<p style="margin:0 0 12px 0;color:#5a687c;">
			{frappe.utils.escape_html(inviter_name)} added you as a <strong>{frappe.utils.escape_html(role)}</strong> on Zivvy. Set your password to sign in.
		</p>
		{cta_button("Set your password", reset_url)}
		<p style="margin:20px 0 0 0;color:#5a687c;font-size:13px;">
			The link expires in 24 hours. If you weren't expecting this invite, ignore this email — the account stays inactive until you set a password.
		</p>
	""".strip()

	html = wrap(inner, preheader=f"{inviter_name} invited you to {tenant_display}")

	cfg = get_resend_config()
	if not cfg["configured"]:
		frappe.throw(
			_("Email is not configured (RESEND_API_KEY missing)."),
			exc=frappe.OutgoingEmailError,
		)

	_post_resend(cfg["api_key"], {
		"from": cfg["from_email"],
		"to": [recipient],
		"subject": subject,
		"html": html,
	})
