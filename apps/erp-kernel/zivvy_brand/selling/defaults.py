# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""Fill Selling Settings defaults on Quotation / Sales Order inserts."""

from __future__ import annotations

import frappe


def apply_selling_defaults(doc, method=None):
	"""before_validate: ensure price list + currency fields exist for REST inserts.

	ERPNext's ``set_missing_values`` is not always invoked on bare
	``frappe.client.insert`` / REST resource POST. Without these defaults,
	Quotation fails MandatoryError on selling_price_list / price_list_currency.
	"""
	if getattr(doc, "flags", None) and doc.flags.get("zivvy_skip_selling_defaults"):
		return

	try:
		if not getattr(doc, "selling_price_list", None):
			pl = frappe.db.get_single_value("Selling Settings", "selling_price_list")
			if pl:
				doc.selling_price_list = pl
		if getattr(doc, "selling_price_list", None) and not getattr(doc, "price_list_currency", None):
			doc.price_list_currency = frappe.db.get_value(
				"Price List", doc.selling_price_list, "currency"
			)
		if getattr(doc, "price_list_currency", None) and not getattr(doc, "plc_conversion_rate", None):
			doc.plc_conversion_rate = 1.0

		_fill_item_uoms(doc)

		# Stock items on Sales Order need a warehouse
		if doc.doctype == "Sales Order":
			_fill_item_warehouses(doc)
	except Exception:
		frappe.log_error(frappe.get_traceback(), "Zivvy apply_selling_defaults")


def _fill_item_uoms(doc) -> None:
	"""REST inserts often omit UOM; default to Nos or the Item's stock UOM."""
	for row in doc.get("items") or []:
		if getattr(row, "uom", None):
			continue
		uom = None
		item_code = getattr(row, "item_code", None)
		if item_code and frappe.db.exists("Item", item_code):
			uom = frappe.db.get_value("Item", item_code, "stock_uom")
		if not uom and frappe.db.exists("UOM", "Nos"):
			uom = "Nos"
		if not uom:
			uoms = frappe.get_all("UOM", pluck="name", limit_page_length=1)
			uom = uoms[0] if uoms else None
		if uom:
			row.uom = uom
			if not getattr(row, "stock_uom", None):
				row.stock_uom = uom


def _fill_item_warehouses(doc) -> None:
	default_wh = frappe.db.get_single_value("Stock Settings", "default_warehouse")
	if not default_wh and getattr(doc, "company", None):
		warehouses = frappe.get_all(
			"Warehouse",
			filters={"company": doc.company, "is_group": 0},
			pluck="name",
			limit_page_length=1,
		)
		default_wh = warehouses[0] if warehouses else None
	if not default_wh:
		return
	for row in doc.get("items") or []:
		if not getattr(row, "warehouse", None):
			row.warehouse = default_wh
		if not getattr(row, "delivery_date", None) and getattr(doc, "delivery_date", None):
			row.delivery_date = doc.delivery_date
