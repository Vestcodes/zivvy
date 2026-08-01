# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""Stamp zivvy_tenant on shared ERPNext docs (Customer has no Company field)."""

from __future__ import annotations

import frappe

from zivvy_brand.tenancy import TENANT_DOCTYPE, TENANT_FIELD
from zivvy_brand.tenancy.context import get_user_tenant_name, is_ops_user

# DocTypes that are global in ERPNext but must be tenant-scoped for SaaS.
# Company-linked docs (Sales Order, etc.) are additionally covered by
# pqc_company_scoped in isolation.py.
TENANT_SCOPED_DOCTYPES = (
	"Customer",
	"Lead",
	"Opportunity",
	"Contact",
	"Address",
	"Supplier",
	"Item",
	"Item Price",
	"Item Group",
	"Blog Post",
	"Comment",
	"Note",
	"ToDo",
	"Communication",
	"Zivvy Role Template",
	# --- Helpdesk (Frappe Helpdesk app) ---
	"HD Ticket",
	"HD Article",
	"HD Team",
	"HD Ticket Type",
	"HD Ticket Priority",
	"HD Service Level Agreement",
)


def ensure_tenant_link_fields():
	"""Add Link(Zivvy Tenant) custom field on tenant-scoped DocTypes.

	Wraps each DocType in its own try/except so that a single failure (e.g.
	Postgres ALTER TABLE hiccup) doesn't leave the remaining doctypes'
	Custom Fields uninserted. Also invokes `create_custom_fields` — which
	internally calls `frappe.db.updatedb(dt)` — so the physical column is
	materialized in the same call and we don't rely on a follow-up
	`bench migrate` to sync the schema.
	"""
	if not frappe.db.exists("DocType", TENANT_DOCTYPE):
		return

	try:
		from frappe.custom.doctype.custom_field.custom_field import create_custom_fields
	except Exception:
		create_custom_fields = None

	for dt in TENANT_SCOPED_DOCTYPES:
		try:
			if not frappe.db.exists("DocType", dt):
				continue
			has_meta_field = frappe.db.exists("Custom Field", {"dt": dt, "fieldname": TENANT_FIELD})
			has_schema_col = False
			try:
				# DocType name, not `tab{dt}` — Frappe resolves the table.
				has_schema_col = bool(frappe.db.has_column(dt, TENANT_FIELD))
			except Exception:
				has_schema_col = False
			if has_meta_field and has_schema_col:
				continue

			# Pick a stable insert_after so the Custom Field creation is deterministic.
			meta = frappe.get_meta(dt)
			insert_after = "naming_series" if meta.has_field("naming_series") else (
				meta.fields[0].fieldname if meta.fields else None
			)
			spec = {
				"fieldname": TENANT_FIELD,
				"label": "Zivvy Tenant",
				"fieldtype": "Link",
				"options": TENANT_DOCTYPE,
				"insert_after": insert_after,
				"read_only": 1,
				"no_copy": 1,
				"description": "Tenant isolation key (company-per-tenant SaaS).",
			}

			if not has_meta_field:
				if create_custom_fields is not None:
					# create_custom_fields runs updatedb(dt) after insert, so the
					# physical column lands in the same call.
					create_custom_fields({dt: [spec]}, ignore_validate=True, update=True)
				else:
					doc = frappe.get_doc({"doctype": "Custom Field", "dt": dt, **spec})
					doc.insert(ignore_permissions=True)

			# Belt-and-braces: force a schema sync if the column still isn't there.
			try:
				if not frappe.db.has_column(dt, TENANT_FIELD):
					frappe.db.updatedb(dt)
			except Exception:
				try:
					frappe.log_error(
						frappe.get_traceback(),
						f"Zivvy ensure_tenant_link_fields: updatedb({dt}) failed",
					)
				except Exception:
					pass

			frappe.clear_cache(doctype=dt)
			frappe.db.commit()
		except Exception:
			try:
				frappe.db.rollback()
			except Exception:
				pass
			try:
				frappe.log_error(
					frappe.get_traceback(),
					f"Zivvy ensure_tenant_link_fields: {dt}",
				)
			except Exception:
				pass

	try:
		frappe.db.commit()
	except Exception:
		pass


def stamp_tenant_on_doc(doc, method=None):
	"""before_insert: unconditionally bind doc to the caller's tenant.

	Runs on before_insert ONLY (not validate) so that:
	  - Client-supplied zivvy_tenant in the JSON payload is overwritten
	  - Existing documents are never silently re-stamped on save
	  - Administrator / background-job inserts without a tenant are caught
	"""
	if frappe.flags.in_install or frappe.flags.in_migrate or frappe.flags.in_patch:
		return
	if frappe.flags.get("zivvy_provisioning_tenant"):
		return
	if not hasattr(doc, TENANT_FIELD) and not frappe.get_meta(doc.doctype).has_field(TENANT_FIELD):
		return

	user = frappe.session.user
	caller_tenant = (
		get_user_tenant_name(user)
		or get_user_tenant_name(doc.owner)
		if user and user not in ("Guest",)
		else None
	)

	if doc.get(TENANT_FIELD) and doc.get(TENANT_FIELD) != caller_tenant:
		if not is_ops_user(user):
			frappe.throw(
				f"Cannot set {TENANT_FIELD} to a different tenant.",
				frappe.PermissionError,
			)

	if caller_tenant:
		setattr(doc, TENANT_FIELD, caller_tenant)
	elif is_ops_user(user):
		if not frappe.flags.get("zivvy_allow_untenanted"):
			if not doc.get(TENANT_FIELD):
				return
	else:
		if not doc.get(TENANT_FIELD):
			frappe.throw(
				f"Cannot create {doc.doctype} without a workspace. Please contact support.",
				frappe.PermissionError,
			)


def prevent_tenant_mutation(doc, method=None):
	"""validate (wildcard): block changing ``zivvy_tenant`` on existing docs.

	Custom Field ``read_only=1`` is Desk-only; REST/API can still PATCH the
	field. Ops users may reassign. New docs are handled by ``stamp_tenant_on_doc``.
	"""
	if frappe.flags.in_install or frappe.flags.in_migrate or frappe.flags.in_patch:
		return
	if frappe.flags.get("zivvy_provisioning_tenant"):
		return
	if getattr(doc, "is_new", lambda: True)():
		return
	try:
		meta = frappe.get_meta(doc.doctype)
	except Exception:
		return
	if not meta.has_field(TENANT_FIELD):
		return
	if not doc.has_value_changed(TENANT_FIELD):
		return
	user = frappe.session.user
	if is_ops_user(user):
		return
	frappe.throw(
		f"Cannot change {TENANT_FIELD} on an existing document.",
		frappe.PermissionError,
	)


def backfill_tenant_from_owner(doctype: str = "Customer") -> dict:
	"""Set zivvy_tenant from document owner for rows still blank."""
	if not frappe.db.exists("DocType", doctype):
		return {"ok": False, "error": "missing_doctype"}
	if not frappe.get_meta(doctype).has_field(TENANT_FIELD):
		return {"ok": False, "error": "missing_field"}
	updated = 0
	rows = frappe.get_all(
		doctype,
		filters={TENANT_FIELD: ("in", ("", None))},
		fields=["name", "owner"],
		limit_page_length=5000,
	)
	# Also catch null via SQL if empty string filter misses
	if not rows:
		rows = frappe.db.sql(
			f"""select name, owner from `tab{doctype}`
			where ifnull(`{TENANT_FIELD}`, '') = '' limit 5000""",
			as_dict=True,
		)
	for row in rows:
		tenant = get_user_tenant_name(row.owner) if row.owner else None
		if not tenant:
			continue
		frappe.db.set_value(doctype, row.name, TENANT_FIELD, tenant, update_modified=False)
		updated += 1
	frappe.db.commit()
	return {"ok": True, "doctype": doctype, "updated": updated}


def backfill_all_scoped() -> dict:
	ensure_tenant_link_fields()
	results = []
	for dt in TENANT_SCOPED_DOCTYPES:
		if frappe.db.exists("DocType", dt):
			results.append(backfill_tenant_from_owner(dt))
	return {"ok": True, "results": results}
