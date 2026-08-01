# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""SaaS website signup — Tenant + Company + Desk System User (Free tier)."""

from __future__ import annotations

import frappe
from frappe import _
from frappe.utils import cint, escape_html, random_string
from frappe.website.utils import is_signup_disabled

from zivvy_brand.auth.datacenter import (
	DATACENTER_FIELD,
	ensure_datacenter_custom_field,
	require_datacenter,
)
from zivvy_brand.auth.roles import (
	DEFAULT_DESK_REDIRECT,
	FREE_TIER_ROLES,
	apply_tenant_admin_roles,
	ensure_saas_user_desk_access,
	promote_to_system_user,
	roles_for_tier,
)
from zivvy_brand.setup.setup_state import ensure_saas_setup_complete

try:
	from frappe.utils import sanitize_redirect
except ImportError:  # Frappe version variance
	try:
		from frappe.utils.http import sanitize_redirect
	except ImportError:
		try:
			from frappe.www.login import sanitize_redirect
		except ImportError:

			def sanitize_redirect(url: str) -> str:
				return url or ""


def _default_redirect(redirect_to: str) -> str:
	cleaned = sanitize_redirect(redirect_to) if redirect_to else ""
	if not cleaned or cleaned in ("/", "/home", "/login"):
		return DEFAULT_DESK_REDIRECT
	cleaned_lc = cleaned.lower()
	if "/app/user" in cleaned_lc or "setup-wizard" in cleaned_lc or "/app/setup" in cleaned_lc:
		return DEFAULT_DESK_REDIRECT
	return cleaned


def _form_company_name() -> str:
	return (
		frappe.form_dict.get("company_name")
		or frappe.form_dict.get("company")
		or frappe.form_dict.get("organization")
		or ""
	).strip()


def _ensure_signup_ready(
	*,
	email: str,
	full_name: str,
	company_name: str | None,
	datacenter: str,
) -> None:
	"""Idempotent post-signup guard: setup state + desk roles + tenant isolation."""
	ensure_saas_setup_complete()
	ensure_saas_user_desk_access(email)

	from zivvy_brand.tenancy import TENANT_DOCTYPE
	from zivvy_brand.tenancy.provision import create_tenant_for_signup

	result = create_tenant_for_signup(
		email=email,
		full_name=full_name,
		company_name=company_name,
		datacenter=datacenter,
	)

	# Grant the tenant-admin role set to the workspace owner. Frappe's
	# stock role checks (delete on Customer/Lead, HR/Accounts docs, etc.)
	# are what gate the SaaS Desk experience — access to *tier-gated*
	# features stays bounded by ``zivvy_brand.gating.permissions`` and
	# ``guard_api_access``, so this grant is safe on Free.
	try:
		tenant_name = (result or {}).get("tenant")
		if tenant_name and frappe.db.exists(TENANT_DOCTYPE, tenant_name):
			owner_user = frappe.db.get_value(TENANT_DOCTYPE, tenant_name, "owner_user")
			if owner_user and owner_user == email:
				apply_tenant_admin_roles(email)
	except Exception:
		frappe.log_error(
			frappe.get_traceback(),
			"Zivvy signup: apply_tenant_admin_roles",
		)


@frappe.whitelist(allow_guest=True)
def sign_up(
	email: str,
	full_name: str,
	redirect_to: str = "",
	zivvy_datacenter: str | None = None,
	company_name: str | None = None,
) -> tuple[int, str]:
	"""Website signup with company-per-tenant provisioning.

	Creates:
	1. Enabled System User (Free Desk roles — not System Manager)
	2. Zivvy Tenant + slug
	3. Dedicated Company + User Permission / defaults

	``zivvy_datacenter`` is required (``india`` / ``eu`` / ``us``).
	``company_name`` is optional (defaults from full name).
	"""
	if is_signup_disabled():
		frappe.throw(_("Sign Up is disabled"), title=_("Not Allowed"))

	email = (email or "").strip().lower()
	full_name = (full_name or "").strip()
	if not email or not full_name:
		frappe.throw(_("Invalid signup details"), title=_("Not Allowed"))

	if not zivvy_datacenter:
		zivvy_datacenter = (
			frappe.form_dict.get("zivvy_datacenter")
			or frappe.form_dict.get("datacenter")
			or frappe.form_dict.get("data_center")
		)
	datacenter = require_datacenter(zivvy_datacenter)
	ensure_datacenter_custom_field()

	company_label = (company_name or "").strip() or _form_company_name()
	ensure_saas_setup_complete()

	# Advisory lock to prevent race conditions where two concurrent signups
	# for the same email both pass the existence check and insert.
	lock_key = f"zivvy_signup:{email}"
	frappe.cache.set_value(lock_key, 1, expires_in_sec=30)

	user = frappe.db.get_value("User", {"email": email}, ["name", "enabled"], as_dict=True)
	if user:
		if cint(user.enabled):
			# Ensure tenant isolation even for prior shared-site signups
			try:
				_ensure_signup_ready(
					email=email,
					full_name=full_name,
					company_name=company_label or None,
					datacenter=datacenter,
				)
			except Exception:
				frappe.log_error(frappe.get_traceback(), "Zivvy re-signup tenant provision")
			# Send welcome email so returning users always get a login link
			try:
				_send_branded_welcome(email, full_name)
				return 1, _("Check your email for a login link.")
			except Exception:
				frappe.log_error(frappe.get_traceback(), "Zivvy re-signup welcome email")
				return 2, _("You already have an account but we couldn't send the email. Use Forgot Password.")
		doc = frappe.get_doc("User", user.name)
		doc.flags.ignore_permissions = True
		promote_to_system_user(doc, roles=roles_for_tier())
		if frappe.db.has_column("User", DATACENTER_FIELD):
			setattr(doc, DATACENTER_FIELD, datacenter)
		doc.save(ignore_permissions=True)
		try:
			_ensure_signup_ready(
				email=email,
				full_name=full_name,
				company_name=company_label or None,
				datacenter=datacenter,
			)
		except Exception:
			frappe.log_error(frappe.get_traceback(), "Zivvy re-enable tenant provision")
			frappe.db.set_value("User", user.name, "enabled", 0, update_modified=False)
		frappe.db.commit()
		frappe.cache.hset(
			"redirect_after_login", doc.name, _default_redirect(redirect_to)
		)
		# Send welcome email for re-enabled users too
		try:
			_send_branded_welcome(doc.name, full_name)
			return 1, _("Your account is ready. Check your email for a login link.")
		except Exception:
			frappe.log_error(frappe.get_traceback(), "Zivvy re-enable welcome email")
			return 2, _("Account re-enabled but we couldn't send the email. Use Forgot Password.")

	max_signups_allowed_per_hour = cint(frappe.get_system_settings("max_signups_allowed_per_hour") or 300)
	users_created_past_hour = frappe.db.get_creation_count("User", 60)
	if users_created_past_hour >= max_signups_allowed_per_hour:
		frappe.respond_as_web_page(
			_("Temporarily Disabled"),
			_(
				"Too many users signed up recently, so the registration is disabled. Please try back in an hour"
			),
			http_status_code=429,
		)
		return 0, _("Temporarily Disabled")

	password = random_string(10)
	user_payload = {
		"doctype": "User",
		"email": email,
		"first_name": escape_html(full_name),
		"enabled": 1,
		"new_password": password,
		"user_type": "System User",
		# Suppress Frappe's stock "Welcome to <company>" template — we send
		# our own branded welcome below via zivvy_brand.email.templates.
		"send_welcome_email": 0,
		DATACENTER_FIELD: datacenter,
	}
	user_doc = frappe.get_doc(user_payload)
	user_doc.flags.ignore_permissions = True
	user_doc.flags.ignore_password_policy = True
	user_doc.flags.no_welcome_mail = True
	promote_to_system_user(user_doc, roles=roles_for_tier())
	try:
		user_doc.insert()
	except Exception:
		existing = frappe.db.get_value("User", {"email": email}, "name")
		if not existing:
			raise
		user_doc = frappe.get_doc("User", existing)
		promote_to_system_user(user_doc, roles=roles_for_tier())
		user_doc.save(ignore_permissions=True)

	if not cint(user_doc.enabled):
		frappe.db.set_value("User", user_doc.name, "enabled", 1, update_modified=False)

	if frappe.db.has_column("User", DATACENTER_FIELD):
		frappe.db.set_value(
			"User", user_doc.name, DATACENTER_FIELD, datacenter, update_modified=False
		)

	default_role = frappe.db.get_single_value("Portal Settings", "default_role")
	if default_role in {"Customer"}:
		user_doc.add_roles(default_role)

	# --- Multi-tenant provision (Tenant + Company + User Permission) ---
	try:
		_ensure_signup_ready(
			email=user_doc.name,
			full_name=full_name,
			company_name=company_label or None,
			datacenter=datacenter,
		)
	except Exception:
		frappe.log_error(frappe.get_traceback(), "Zivvy signup tenant provision")
		# Fail closed: disable the user so they can't log in without a tenant.
		# Ops can repair via migrate_existing and re-enable.
		frappe.db.set_value("User", user_doc.name, "enabled", 0, update_modified=False)

	frappe.cache.hset(
		"redirect_after_login", user_doc.name, _default_redirect(redirect_to)
	)

	# Fire our branded welcome email (independent of Frappe's stock one).
	email_sent = False
	try:
		_send_branded_welcome(user_doc.name, full_name)
		email_sent = True
	except Exception:
		frappe.log_error(frappe.get_traceback(), "Zivvy signup welcome email")

	if email_sent:
		return (
			1,
			_("Account created. Check your email for a welcome message."),
		)
	else:
		return (
			2,
			_(
				"Account created but the welcome email could not be sent. Use the Resend button or Forgot Password to get a login link."
			),
		)


@frappe.whitelist(allow_guest=True)
def resend_welcome_email(email: str) -> tuple[int, str]:
	"""Resend the branded welcome email for a pending signup."""
	from frappe.rate_limiter import rate_limit

	email = (email or "").strip().lower()
	if not email:
		frappe.throw(_("Email is required"))

	@rate_limit(limit=5, seconds=60 * 60)
	def _guarded():
		user = frappe.db.get_value("User", {"email": email}, ["name", "enabled", "first_name", "full_name"], as_dict=True)
		if not user:
			return (0, _("No account found for this email."))
		try:
			_send_branded_welcome(user.name, user.full_name or user.first_name or email)
			return (1, _("Welcome email sent. Check your inbox."))
		except Exception:
			frappe.log_error(frappe.get_traceback(), "Zivvy resend welcome email")
			return (0, _("Could not send the email. Please try Forgot Password instead."))

	return _guarded()


def ensure_website_user_enabled(doc, method=None):
	"""Force SaaS signups to stay enabled on initial creation only.

	Gated on is_new() so that subsequent User.save() calls (password reset,
	HRMS Employee link, set_user_roles) don't silently re-enable a user that
	an admin has explicitly disabled.
	"""
	if doc.name in ("Administrator", "Guest"):
		return
	if not doc.is_new():
		return
	if not cint(doc.enabled):
		if (doc.user_type or "") in ("Website User", "System User"):
			doc.enabled = 1


def _send_branded_welcome(user_email: str, full_name: str) -> None:
	"""Send the emerald-branded Zivvy welcome email with a set-password CTA.

	Uses the same reset-password key mechanism as Forgot Password so the
	recipient can activate the account immediately without needing the
	random password we generated at signup.

	Sends directly via Resend HTTP — Frappe's Email Queue silently swallows
	send failures (marks the queue entry as Error without re-raising), so
	``frappe.sendmail(now=True)`` can return success even when nothing was
	delivered. Critical transactional emails bypass the queue entirely.
	"""
	from zivvy_brand.email.resend import get_resend_config
	from zivvy_brand.email.resend_http import _post_resend
	from zivvy_brand.email.templates import cta_button, wrap

	user_doc = frappe.get_doc("User", user_email)
	key = user_doc.reset_password(send_email=False)
	base = frappe.utils.get_url()
	reset_url = f"{base}/update-password?key={key}&password_expired=1"

	first_name = escape_html((full_name or user_email.split("@")[0]).split(" ")[0])
	inner = f"""
		<h1 style="margin:0 0 12px 0;font-size:22px;line-height:1.3;font-weight:600;color:#0f1729;">
			Welcome to Zivvy, {first_name}.
		</h1>
		<p style="margin:0 0 12px 0;color:#5a687c;">
			Your workspace is ready. Set a password to activate it.
		</p>
		{cta_button("Set your password", reset_url)}
		<p style="margin:20px 0 0 0;color:#5a687c;font-size:13px;">
			The link expires in 24 hours. If you didn't ask for a Zivvy account, ignore this email — nothing will happen until you set a password.
		</p>
	""".strip()

	html = wrap(inner, preheader="Set your password to activate your Zivvy workspace")
	subject = _("Welcome to Zivvy")

	cfg = get_resend_config()
	if not cfg["configured"]:
		frappe.throw(
			_("Email is not configured (RESEND_API_KEY missing)."),
			exc=frappe.OutgoingEmailError,
		)

	_post_resend(cfg["api_key"], {
		"from": cfg["from_email"],
		"to": [user_email],
		"subject": subject,
		"html": html,
	})
