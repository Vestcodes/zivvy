# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

from __future__ import annotations

import json


def run():
	import frappe

	meta = frappe.get_meta("Customer")
	fields = [f.fieldname for f in meta.fields if f.fieldname in ("company", "zivvy_tenant", "customer_name")]
	has_company = meta.has_field("company")
	sample = frappe.get_all("Customer", fields=["name", "customer_name", "owner", "creation"], limit=5)
	ups = frappe.get_all(
		"User Permission",
		filters={"user": "demo.free@zivvy.xyz"},
		fields=["allow", "for_value", "apply_to_all_doctypes", "applicable_for"],
	)
	print(
		json.dumps(
			{
				"has_company": has_company,
				"fields": fields,
				"sample": sample,
				"user_permissions_free": ups,
			},
			default=str,
			indent=2,
		)
	)
