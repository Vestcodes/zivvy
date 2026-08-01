# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""Production tenant scrub — keep site, wipe workspaces, then optionally seed.

Keeps: Administrator, Guest, Email Account, Polar Settings, Website Settings,
global masters (UOM, Country, etc.).

Removes: Zivvy Tenants, non-system Users, Companies (+ company trees),
tenant-stamped transactional docs, User Permissions.
"""

from __future__ import annotations

from typing import Any

import frappe

KEEP_USERS = {"Administrator", "Guest"}

# DocTypes to wipe when they exist (best-effort, ignore missing).
TRANSACTIONAL = (
	"Sales Invoice",
	"Sales Order",
	"Quotation",
	"Delivery Note",
	"Purchase Invoice",
	"Purchase Order",
	"Purchase Receipt",
	"Payment Entry",
	"Journal Entry",
	"Stock Entry",
	"POS Invoice",
	"Material Request",
	"Work Order",
	"BOM",
	"Job Card",
	"Quality Inspection",
	"Asset",
	"Project",
	"Task",
	"Timesheet",
	"Expense Claim",
	"Leave Application",
	"Employee",
	"Bank Account",
	"Bank Transaction",
	"Payment Request",
	"Issue",
	"HD Ticket",
)

PARTY_MASTERS = (
	"Customer",
	"Supplier",
	"Lead",
	"Opportunity",
	"Contact",
	"Address",
	"Item",
	"Item Price",
)


def _delete_all(doctype: str) -> int:
	try:
		exists = frappe.db.sql(
			"select name from `tabDocType` where name=%s limit 1",
			doctype,
		)
	except Exception:
		exists = None
	if not exists:
		return 0
	try:
		n = frappe.db.sql(f"select count(*) from `tab{doctype}`")[0][0]
	except Exception:
		n = 0
	try:
		frappe.db.sql(f"delete from `tab{doctype}`")
	except Exception:
		frappe.log_error(frappe.get_traceback(), f"scrub sql delete {doctype}")
		try:
			names = frappe.db.sql(f"select name from `tab{doctype}`", pluck=True) or []
		except Exception:
			names = []
		for name in names:
			try:
				frappe.db.sql(f"delete from `tab{doctype}` where name=%s", name)
			except Exception:
				frappe.log_error(frappe.get_traceback(), f"scrub delete {doctype} {name}")
	return int(n or 0)


def scrub_production_tenants(*, confirm: bool = False) -> dict[str, Any]:
	"""Wipe all tenants/companies/users except Administrator/Guest.

	Must pass confirm=True to run.
	"""
	if not confirm:
		frappe.throw("Pass confirm=True to scrub production tenants.")

	# Avoid hook/meta get_attr("erpnext...") failures in bare scripts.
	frappe.flags.in_install = True
	frappe.flags.in_migrate = True
	frappe.flags.in_patch = True
	frappe.flags.zivvy_provisioning_tenant = True
	frappe.flags.zivvy_allow_untenanted = True
	frappe.set_user("Administrator")

	summary: dict[str, Any] = {"deleted": {}}

	# Order: transactions → parties → tenants → companies → users → permissions
	for dt in TRANSACTIONAL + PARTY_MASTERS:
		summary["deleted"][dt] = _delete_all(dt)

	if frappe.db.exists("DocType", "Zivvy Tenant Addon"):
		summary["deleted"]["Zivvy Tenant Addon"] = _delete_all("Zivvy Tenant Addon")
	if frappe.db.exists("DocType", "Zivvy Webhook"):
		summary["deleted"]["Zivvy Webhook"] = _delete_all("Zivvy Webhook")
	if frappe.db.exists("DocType", "Zivvy API Key"):
		summary["deleted"]["Zivvy API Key"] = _delete_all("Zivvy API Key")

	summary["deleted"]["Zivvy Tenant"] = _delete_all("Zivvy Tenant")

	# User Permissions before users
	summary["deleted"]["User Permission"] = _delete_all("User Permission")

	# DefaultValue rows for non-kept users.
	# NEVER touch system globals (`__default`, `__global`) — that stores
	# installed_apps and other site boot keys.
	try:
		frappe.db.sql(
			"""delete from `tabDefaultValue`
			where parent not in ('Administrator', 'Guest', '__default', '__global')
			  and parenttype = 'User Permission'"""
		)
	except Exception:
		try:
			frappe.db.rollback()
		except Exception:
			pass
		try:
			frappe.db.sql(
				"""delete from `tabDefaultValue`
				where parent not in ('Administrator', 'Guest', '__default', '__global')
				  and ifnull(parenttype, '') = ''
				  and defkey in ('company', 'time_zone', 'territory', 'customer_group')"""
			)
		except Exception:
			frappe.log_error(frappe.get_traceback(), "scrub DefaultValue")
			try:
				frappe.db.rollback()
			except Exception:
				pass

	# Intermediate commits so one failed statement cannot abort the whole scrub.
	try:
		frappe.db.commit()
	except Exception:
		frappe.db.rollback()

	# Companies via SQL (delete_doc pulls ERPNext hooks that need full boot)
	try:
		companies = frappe.db.sql("select name from `tabCompany`", pluck=True) or []
	except Exception:
		companies = []
	co_n = 0
	for company in companies:
		try:
			# Related trees often block Company delete — force SQL cascade-ish cleanup
			for child_dt, col in (
				("Warehouse", "company"),
				("Account", "company"),
				("Cost Center", "company"),
				("Department", "company"),
				("Employee", "company"),
				("Fiscal Year Company", "company"),
			):
				if frappe.db.exists("DocType", child_dt):
					try:
						frappe.db.sql(f"delete from `tab{child_dt}` where `{col}`=%s", company)
					except Exception:
						pass
			frappe.db.sql("delete from `tabCompany` where name=%s", company)
			co_n += 1
		except Exception:
			frappe.log_error(frappe.get_traceback(), f"scrub Company {company}")
	summary["deleted"]["Company"] = co_n

	# Users except keep list
	try:
		users = frappe.db.sql("select name from `tabUser`", pluck=True) or []
	except Exception:
		users = []
	u_n = 0
	for user in users:
		if user in KEEP_USERS:
			continue
		try:
			frappe.db.sql("delete from `tabHas Role` where parent=%s", user)
			frappe.db.sql("delete from `tabDefaultValue` where parent=%s", user)
			frappe.db.sql("delete from `tabUser` where name=%s", user)
			u_n += 1
		except Exception:
			frappe.log_error(frappe.get_traceback(), f"scrub User {user}")
	summary["deleted"]["User"] = u_n

	# Ensure signup stays open (singles table — not tabWebsite Settings on PG)
	try:
		frappe.db.sql(
			"update `tabSingles` set value='0' where doctype='Website Settings' and field='disable_signup'"
		)
	except Exception:
		try:
			frappe.db.rollback()
		except Exception:
			pass

	try:
		frappe.db.commit()
	except Exception:
		frappe.db.rollback()
		frappe.throw("scrub commit failed — see Error Log")

	try:
		frappe.clear_cache()
	except Exception:
		pass

	summary["ok"] = True
	summary["remaining_users"] = frappe.db.sql("select name from `tabUser`", pluck=True)
	summary["remaining_companies"] = frappe.db.sql("select name from `tabCompany`", pluck=True)
	try:
		summary["remaining_tenants"] = frappe.db.sql("select name from `tabZivvy Tenant`", pluck=True)
	except Exception:
		summary["remaining_tenants"] = []
	return summary


def create_client(
	*,
	email: str,
	full_name: str,
	company_name: str,
	password: str,
	datacenter: str = "eu",
	plan: str = "business",
) -> dict[str, Any]:
	"""Create a Desk user + Tenant + Company (Administrator path)."""
	from zivvy_brand.auth.roles import apply_tenant_admin_roles
	from zivvy_brand.gating.tiers import normalize_tier
	from zivvy_brand.tenancy.provision import create_tenant_for_signup

	# Bare scripts often leave installed_apps empty; repair so Company hooks
	# can resolve erpnext.* via get_attr. Keep in_install True as belt-and-braces.
	if not getattr(frappe.local, "installed_apps", None):
		rows = frappe.db.sql(
			"select app_name from `tabInstalled Application` order by idx",
			pluck=True,
		)
		frappe.local.installed_apps = list(rows or [])

	frappe.flags.in_install = True
	frappe.flags.in_migrate = True
	frappe.flags.zivvy_provisioning_tenant = True
	frappe.set_user("Administrator")

	email = (email or "").strip().lower()
	if not email or not password:
		frappe.throw("email and password are required")

	if frappe.db.exists("User", email):
		# Idempotent: if leftover from a failed create, remove and recreate
		frappe.db.sql("delete from `tabHas Role` where parent=%s", email)
		frappe.db.sql("delete from `tabDefaultValue` where parent=%s", email)
		frappe.db.sql("delete from `tabUser` where name=%s", email)
		frappe.db.commit()

	user = frappe.get_doc(
		{
			"doctype": "User",
			"email": email,
			"first_name": (full_name or email.split("@")[0]).strip(),
			"enabled": 1,
			"user_type": "System User",
			"send_welcome_email": 0,
			"new_password": password,
		}
	)
	user.flags.ignore_permissions = True
	user.insert(ignore_permissions=True)

	# Keep in_install True so country fixtures get_attr("erpnext...") does not
	# falsely claim erpnext is not installed during bare-script boot.
	frappe.flags.zivvy_provisioning_tenant = True

	result = create_tenant_for_signup(
		email=email,
		full_name=full_name or user.first_name,
		company_name=company_name,
		datacenter=datacenter,
		plan=normalize_tier(plan),
		status="active",
	)
	apply_tenant_admin_roles(email)
	frappe.db.commit()

	frappe.flags.in_install = False
	frappe.flags.in_migrate = False

	return {
		"ok": True,
		"email": email,
		"tenant": result.get("tenant"),
		"company": result.get("company"),
		"slug": result.get("slug"),
		"plan": normalize_tier(plan),
		"datacenter": datacenter,
	}
