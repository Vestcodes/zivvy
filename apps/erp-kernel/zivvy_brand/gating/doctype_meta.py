# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""Slim doctype meta endpoint for the Next.js frontend.

frappe.desk.form.load.getdoctype returns the full Desk form bundle (all child
doctypes, print formats, dashboard links, etc.) — 50-200 KB per call. The
frontend only needs the field list and a few top-level flags. This endpoint
returns ~5 KB.
"""

from __future__ import annotations

import frappe
from frappe import _


@frappe.whitelist()
def get_slim_meta(doctype: str) -> dict:
	"""Return just the fields + top-level meta for a doctype."""
	if not doctype:
		frappe.throw(_("Missing doctype"), frappe.ValidationError)

	if not frappe.db.exists("DocType", doctype):
		frappe.throw(_("DocType {0} not found").format(doctype), frappe.DoesNotExistError)

	meta = frappe.get_meta(doctype)

	fields = []
	for f in meta.fields:
		fields.append({
			"fieldname": f.fieldname,
			"label": f.label,
			"fieldtype": f.fieldtype,
			"options": f.options,
			"in_list_view": f.in_list_view,
			"in_standard_filter": f.in_standard_filter,
			"reqd": f.reqd,
			"read_only": f.read_only,
			"hidden": f.hidden,
			"default": f.default,
			"precision": f.precision,
			"translatable": f.translatable,
			"is_virtual": f.is_virtual,
		})

	return {
		"name": meta.name,
		"module": meta.module,
		"fields": fields,
		"is_submittable": meta.is_submittable,
		"istable": meta.istable,
		"issingle": meta.issingle,
		"title_field": meta.title_field,
		"search_fields": meta.search_fields,
		"sort_field": meta.sort_field,
		"sort_order": meta.sort_order,
		"autoname": meta.autoname,
	}
