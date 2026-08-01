# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""Rewrite Company User Permissions that use ``apply_to_all_doctypes=1``.

Legacy provisioning stamped a single Company User Permission with
``apply_to_all_doctypes=1``. Frappe then filters every DocType that Links →
Company — including ``Customer.represents_company``. Rows with
``represents_company=NULL`` disappear from ``get_list`` and ``getdoc`` 403s
even when the user owns the Customer and has the right roles.

Fix: drop apply-to-all rows and re-stamp per-DocType ``applicable_for``
permissions via :func:`zivvy_brand.tenancy.provision.set_user_company_isolation`.

Run::

	bench --site zivvy.xyz execute \\
		zivvy_brand.setup.user_perm_backfill.backfill_company_user_permissions
"""

from __future__ import annotations

import frappe

from zivvy_brand.tenancy import TENANT_DOCTYPE, TENANT_FIELD
from zivvy_brand.tenancy.provision import set_user_company_isolation


def backfill_company_user_permissions(dry_run: bool = False) -> dict:
	"""Narrow every legacy apply-to-all Company User Permission.

	Idempotent. Prefers the tenant's primary company when the user is bound to
	a Zivvy Tenant; otherwise uses the ``for_value`` on the legacy UP row.
	"""
	legacy = frappe.get_all(
		"User Permission",
		filters={"allow": "Company", "apply_to_all_doctypes": 1},
		fields=["name", "user", "for_value"],
		limit_page_length=0,
	)

	by_user: dict[str, str] = {}
	for row in legacy:
		user = (row.user or "").strip()
		company = (row.for_value or "").strip()
		if user and company:
			by_user[user] = company

	# Tenant users: always re-stamp so narrowed UPs exist even if the legacy
	# apply-to-all row was already deleted by a partial run.
	if frappe.db.exists("DocType", TENANT_DOCTYPE) and frappe.db.has_column("User", TENANT_FIELD):
		tenant_users = frappe.db.sql(
			f"""
			SELECT u.name AS user, t.company AS company
			FROM `tabUser` u
			INNER JOIN `tab{TENANT_DOCTYPE}` t ON t.name = u.`{TENANT_FIELD}`
			WHERE u.enabled = 1
			  AND u.user_type = 'System User'
			  AND IFNULL(t.company, '') != ''
			  AND u.name NOT IN ('Administrator', 'Guest')
			""",
			as_dict=True,
		)
		for row in tenant_users:
			user = (row.user or "").strip()
			company = (row.company or "").strip()
			if user and company:
				# Tenant company wins over a stale UP for_value.
				by_user[user] = company

	results = []
	rewritten = 0
	skipped = 0
	failed = 0

	for user, company in sorted(by_user.items()):
		if not frappe.db.exists("User", user):
			skipped += 1
			continue
		if not frappe.db.exists("Company", company):
			skipped += 1
			results.append(
				{"user": user, "company": company, "ok": False, "error": "company_missing"}
			)
			continue
		if dry_run:
			results.append({"user": user, "company": company, "dry_run": True})
			continue
		try:
			set_user_company_isolation(user, company)
			rewritten += 1
			results.append({"user": user, "company": company, "ok": True})
		except Exception as exc:
			failed += 1
			results.append({"user": user, "company": company, "ok": False, "error": str(exc)[:200]})
			try:
				frappe.log_error(
					frappe.get_traceback(),
					f"Zivvy backfill_company_user_permissions: {user}",
				)
			except Exception:
				pass

	if not dry_run:
		try:
			frappe.db.commit()
		except Exception:
			pass
		try:
			frappe.clear_cache()
		except Exception:
			pass

	return {
		"ok": failed == 0,
		"legacy_rows": len(legacy),
		"users_targeted": len(by_user),
		"rewritten": rewritten,
		"skipped": skipped,
		"failed": failed,
		"dry_run": bool(dry_run),
		"results": results,
	}
