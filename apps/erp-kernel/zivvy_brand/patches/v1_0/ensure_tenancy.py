# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

from __future__ import annotations

import frappe


def execute():
	"""Ensure tenant custom field + migrate founder/demos after Zivvy Tenant exists."""
	if not frappe.db.exists("DocType", "Zivvy Tenant"):
		return
	from zivvy_brand.tenancy.binding import backfill_all_scoped, ensure_tenant_link_fields
	from zivvy_brand.tenancy.context import ensure_tenant_user_field
	from zivvy_brand.tenancy.migrate_existing import (
		migrate_existing_tenants,
		scrub_shared_default_company_pollution,
	)

	ensure_tenant_user_field()
	ensure_tenant_link_fields()
	migrate_existing_tenants()
	scrub_shared_default_company_pollution()
	backfill_all_scoped()
