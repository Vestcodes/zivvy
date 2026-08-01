# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""Ops helper — print tenancy status (no secrets)."""

from __future__ import annotations

import json


def run():
	import frappe

	out = {
		"doctype": bool(frappe.db.exists("DocType", "Zivvy Tenant")),
		"companies": frappe.get_all("Company", pluck="name"),
		"user_field": frappe.db.has_column("User", "zivvy_tenant"),
	}
	if out["doctype"]:
		out["tenants"] = frappe.get_all(
			"Zivvy Tenant",
			fields=["name", "slug", "company", "plan", "owner_user", "status"],
		)
	if frappe.db.exists("DocType", "Warehouse Type"):
		out["wh_types"] = frappe.get_all("Warehouse Type", pluck="name")
	out["patches"] = frappe.db.sql(
		"select patch from `tabPatch Log` where patch like %s",
		("%tenancy%",),
		as_dict=True,
	)
	print(json.dumps(out, default=str, indent=2))
	return out
