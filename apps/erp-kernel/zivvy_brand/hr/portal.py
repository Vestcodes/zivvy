# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""Employee → Portal User provisioning.

When an Employee is created with an email address, automatically provision
a Website User with the "Employee Self Service" role and send a Zivvy-branded
welcome email with a password-setup link.

Portal users are Website Users (not System Users) and do NOT consume billable
seats.
"""

from __future__ import annotations

import frappe
from frappe import _
from frappe.utils import escape_html, random_string


PORTAL_ROLE = "Employee Self Service"


def provision_portal_user(doc, method=None):
	"""Employee after_insert hook: create a portal User and send welcome email."""
	if frappe.flags.in_install or frappe.flags.in_migrate or frappe.flags.in_patch:
		return
	if frappe.flags.get("zivvy_provisioning_tenant") or frappe.flags.get("zivvy_seeding_demos"):
		return

	email = doc.get("company_email") or doc.get("personal_email")
	if not email:
		return
	email = email.strip().lower()

	if doc.get("user_id"):
		return

	if frappe.db.exists("User", email):
		_link_existing_user(doc, email)
		return

	_create_portal_user(doc, email)


def _link_existing_user(doc, email: str):
	"""Link an existing User to this Employee and ensure portal role."""
	user = frappe.get_doc("User", email)
	user.flags.ignore_permissions = True

	existing_roles = {r.role for r in (user.roles or [])}
	if PORTAL_ROLE not in existing_roles:
		user.append("roles", {"role": PORTAL_ROLE})
		user.save(ignore_permissions=True)

	doc.db_set("user_id", email, update_modified=False)
	frappe.db.set_value("Employee", doc.name, "create_user_permission", 1, update_modified=False)


def _create_portal_user(doc, email: str):
	"""Create a new Website User for this Employee."""
	employee_name = doc.get("employee_name") or doc.get("first_name") or email.split("@")[0]
	first_name = doc.get("first_name") or employee_name.split(" ")[0]
	last_name = doc.get("last_name") or ""

	from zivvy_brand.tenancy import TENANT_FIELD

	user_payload = {
		"doctype": "User",
		"email": email,
		"first_name": escape_html(first_name),
		"last_name": escape_html(last_name) if last_name else "",
		"enabled": 1,
		"new_password": random_string(12),
		"user_type": "Website User",
		"send_welcome_email": 0,
	}

	# Stamp the same tenant as the session user (the admin creating the employee)
	if frappe.db.has_column("User", TENANT_FIELD):
		from zivvy_brand.tenancy.context import get_user_tenant_name

		tenant = get_user_tenant_name(frappe.session.user)
		if tenant:
			user_payload[TENANT_FIELD] = tenant

	user_doc = frappe.get_doc(user_payload)
	user_doc.flags.ignore_permissions = True
	user_doc.flags.ignore_password_policy = True
	user_doc.flags.no_welcome_mail = True
	user_doc.append("roles", {"role": PORTAL_ROLE})

	try:
		user_doc.insert()
	except frappe.DuplicateEntryError:
		_link_existing_user(doc, email)
		return

	doc.db_set("user_id", user_doc.name, update_modified=False)
	frappe.db.set_value("Employee", doc.name, "create_user_permission", 1, update_modified=False)

	try:
		_send_portal_welcome(user_doc.name, employee_name)
	except Exception:
		frappe.log_error(frappe.get_traceback(), "Zivvy portal welcome email")


def _send_portal_welcome(user_email: str, full_name: str):
	"""Send Zivvy-branded portal welcome with password-setup CTA."""
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
			Your employer has set up an employee portal for you. Set a password to access your leave, attendance, payslips, and expenses.
		</p>
		{cta_button("Set your password", reset_url)}
		<p style="margin:20px 0 0 0;color:#5a687c;font-size:13px;">
			The link expires in 24 hours. If you weren't expecting this, contact your HR department.
		</p>
	""".strip()

	html = wrap(inner, preheader="Set your password to access the Zivvy employee portal")
	subject = _("Welcome to the Zivvy Employee Portal")

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
