# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""Populate Zivvy Addon polar_* ID fields from the live Vestcodes Polar catalogue.

Run on the production site after products exist:

  bench --site zivvy.xyz execute zivvy_brand.billing.setup_addon_polar_ids.apply_addon_polar_ids

Idempotent: overwrites polar_product_id / price IDs for the four seeded slugs.
"""

from __future__ import annotations

from typing import Any

import frappe
from frappe import _

ADDON_DOCTYPE = "Zivvy Addon"

# Generated 2026-07-25 via Polar MCP against org Vestcodes
# (e80453a0-44aa-4026-9002-22778c174e9d). Monthly = polar_product_id for checkout.
ADDON_POLAR_IDS: dict[str, dict[str, str]] = {
	"ecommerce-integrations": {
		"polar_product_id": "23aa137a-7ea6-4660-9e23-bd6e32f85a85",
		"polar_monthly_price_id": "ea5a1b26-0b44-4010-8a58-56b2782e0e41",
		"polar_annual_price_id": "0e227fcc-d6a3-440d-b9d1-ff1c2fdea9ee",
		"annual_product_id": "52472f31-e8c0-4e3a-bbba-785cce876092",
		"annual_price_usd": "278",
	},
	"erpnext-datev": {
		"polar_product_id": "f0bb5dbc-6a79-4ca8-8633-d0e7ccebe1b0",
		"polar_monthly_price_id": "74183cd5-74d9-4b31-ae8f-18d8348a5612",
		"polar_annual_price_id": "eab2fd43-2bb1-42b2-82c5-59c6ef40f0d8",
		"annual_product_id": "c12f3970-66f9-41c0-b639-3016bf2d074d",
		"annual_price_usd": "182",
	},
	"digital-signer": {
		"polar_product_id": "7e8a8b9c-abf5-4da2-9ba5-469c91ba20ef",
		"polar_monthly_price_id": "b8162317-e100-423d-b7f1-252236648860",
		"polar_annual_price_id": "d033f4a8-ef37-4c1a-800c-7d0c46e68fb9",
		"annual_product_id": "c8d5ad9e-7f02-4efb-907a-516af63780f5",
		"annual_price_usd": "144",
	},
	"payments-processor": {
		"polar_product_id": "399c0141-a518-4a3e-b09f-05121e654dc2",
		"polar_monthly_price_id": "8d7b936d-f86a-4d6e-b8ea-f04035652f02",
		"polar_annual_price_id": "f5cdd999-d334-4fd8-ba23-ff6d4ccb26f5",
		"annual_product_id": "f0233a78-e971-40d0-9f7d-12d268ad69b3",
		"annual_price_usd": "240",
	},
}


@frappe.whitelist()
def apply_addon_polar_ids() -> dict[str, Any]:
	"""Write polar product/price IDs onto seeded Zivvy Addon rows."""
	if frappe.session.user != "Administrator" and "System Manager" not in frappe.get_roles():
		frappe.throw(_("Only System Managers can apply Polar addon IDs."), frappe.PermissionError)

	if not frappe.db.exists("DocType", ADDON_DOCTYPE):
		frappe.throw(_("Zivvy Addon DocType is missing"))

	updated: list[str] = []
	missing: list[str] = []

	for slug, ids in ADDON_POLAR_IDS.items():
		name = frappe.db.get_value(ADDON_DOCTYPE, {"slug": slug}, "name")
		if not name:
			missing.append(slug)
			continue
		doc = frappe.get_doc(ADDON_DOCTYPE, name)
		doc.polar_product_id = ids["polar_product_id"]
		doc.polar_monthly_price_id = ids["polar_monthly_price_id"]
		doc.polar_annual_price_id = ids["polar_annual_price_id"]
		if hasattr(doc, "annual_price_usd") and ids.get("annual_price_usd"):
			doc.annual_price_usd = float(ids["annual_price_usd"])
		doc.flags.ignore_permissions = True
		doc.save(ignore_permissions=True)
		updated.append(slug)

	frappe.db.commit()
	return {
		"ok": True,
		"updated": updated,
		"missing": missing,
		"note": (
			"Annual billing uses separate Polar products; polar_annual_price_id "
			"is the USD yearly price. Checkout currently uses polar_product_id (monthly)."
		),
		"annual_product_ids": {
			slug: ids.get("annual_product_id") for slug, ids in ADDON_POLAR_IDS.items()
		},
	}
