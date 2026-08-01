# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""One-shot backfill: grant the tenant-admin role set to every tenant's owner.

Signup used to provision the first user of a tenant with only ``roles_for_tier
(TIER_FREE)`` (Sales User / Purchase User / Item Manager / Wiki Approver), so
opening Sales Invoice / Journal Entry / Bank Account / Employee / BOM / Asset —
and deleting a Customer or Lead — 403'd on Frappe's stock role checks even for
paying (Business-tier) tenants. Signup now grants ``TENANT_ADMIN_ROLES`` at
provision time; this helper repairs users created before that fix landed.

Run via ``bench --site <site> execute
zivvy_brand.setup.roles_backfill.backfill_tenant_admin_roles``.
"""

from __future__ import annotations

import frappe

from zivvy_brand.auth.roles import apply_tenant_admin_roles
from zivvy_brand.tenancy import TENANT_DOCTYPE


def backfill_tenant_admin_roles(dry_run: bool = False) -> dict:
	"""Grant TENANT_ADMIN_ROLES to every Zivvy Tenant's owner_user.

	Idempotent — ``apply_tenant_admin_roles`` skips roles the user already has.
	"""
	if not frappe.db.exists("DocType", TENANT_DOCTYPE):
		return {"ok": False, "error": "tenant_doctype_missing"}

	tenants = frappe.get_all(
		TENANT_DOCTYPE,
		fields=["name", "owner_user"],
		limit_page_length=0,
	)

	results = []
	granted = 0
	skipped = 0
	failed = 0
	for row in tenants:
		owner = (row.get("owner_user") or "").strip().lower()
		if not owner:
			skipped += 1
			continue
		if not frappe.db.exists("User", owner):
			skipped += 1
			continue
		if dry_run:
			results.append({"tenant": row.name, "owner": owner, "dry_run": True})
			continue
		try:
			result = apply_tenant_admin_roles(owner)
			results.append({"tenant": row.name, "owner": owner, **result})
			if result.get("ok"):
				granted += 1
			else:
				failed += 1
		except Exception:
			failed += 1
			try:
				frappe.log_error(
					frappe.get_traceback(),
					f"Zivvy backfill_tenant_admin_roles: {owner}",
				)
			except Exception:
				pass

	if not dry_run:
		try:
			frappe.db.commit()
		except Exception:
			pass

	return {
		"ok": True,
		"tenants_scanned": len(tenants),
		"granted": granted,
		"skipped": skipped,
		"failed": failed,
		"dry_run": dry_run,
		"results": results,
	}
