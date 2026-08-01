# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""Seed default Zivvy Addon catalog rows.

Called from ``zivvy_brand.setup.install.after_migrate``. Upserts by slug so
custom copy / pricing changes made by ops are preserved across migrations
(only the fields we treat as authoritative are refreshed).
"""

from __future__ import annotations

import json

import frappe

ADDON_DOCTYPE = "Zivvy Addon"


DEFAULT_ADDONS: list[dict] = [
	{
		"slug": "ecommerce-integrations",
		"title": "Ecommerce Integrations",
		"description": "Sync orders, inventory and fulfillment with Shopify, Amazon SP-API and Unicommerce.",
		"monthly_price_usd": 29,
		"category": "Integrations",
		"upstream_frappe_app": "ecommerce_integrations",
		"doctypes_unlocked": [
			"Shopify Settings",
			"Amazon SP Settings",
			"Unicommerce Settings",
			"Ecommerce Integration Log",
		],
	},
	{
		"slug": "erpnext-datev",
		"title": "DATEV Export",
		"description": "Generate DATEV-compliant financial exports for German tax filings.",
		"monthly_price_usd": 19,
		"category": "Compliance",
		"upstream_frappe_app": "erpnext_datev",
		"doctypes_unlocked": [
			"DATEV Settings",
			"DATEV Export",
		],
	},
	{
		"slug": "digital-signer",
		"title": "Digital Signer",
		"description": "Send documents for e-signature and track signed copies inside Zivvy.",
		"monthly_price_usd": 15,
		"category": "Documents",
		"upstream_frappe_app": "digital_signer",
		"doctypes_unlocked": [
			"Digital Signer Settings",
			"Signed Document",
		],
	},
	{
		"slug": "payments-processor",
		"title": "Payments Processor",
		"description": "Automate payment capture, refunds and reconciliation batches.",
		"monthly_price_usd": 25,
		"category": "Payments",
		"upstream_frappe_app": "payments_processor",
		"doctypes_unlocked": [
			"Payments Processor Settings",
			"Payment Batch",
		],
	},
]


def seed_default_addons() -> None:
	"""Upsert the default Zivvy Addon rows by slug."""
	if not frappe.db.exists("DocType", ADDON_DOCTYPE):
		return

	for spec in DEFAULT_ADDONS:
		_upsert_addon(spec)

	try:
		frappe.db.commit()
	except Exception:
		pass


def _upsert_addon(spec: dict) -> None:
	slug = (spec.get("slug") or "").strip().lower()
	if not slug:
		return

	doctypes_json = json.dumps(spec.get("doctypes_unlocked") or [])
	modules_json = json.dumps(spec.get("modules_unlocked") or [])

	existing = frappe.db.get_value(ADDON_DOCTYPE, {"slug": slug}, "name")

	try:
		if existing:
			doc = frappe.get_doc(ADDON_DOCTYPE, existing)
			# Refresh authoritative fields; keep any ops-authored marketing copy
			doc.title = spec["title"]
			doc.description = spec.get("description") or doc.description
			doc.monthly_price_usd = spec["monthly_price_usd"]
			doc.category = spec.get("category") or doc.category or "Other"
			doc.upstream_frappe_app = (
				spec.get("upstream_frappe_app") or doc.upstream_frappe_app
			)
			doc.doctypes_unlocked = doctypes_json
			if spec.get("modules_unlocked"):
				doc.modules_unlocked = modules_json
			if doc.enabled is None:
				doc.enabled = 1
			doc.flags.ignore_permissions = True
			doc.save(ignore_permissions=True)
		else:
			doc = frappe.get_doc(
				{
					"doctype": ADDON_DOCTYPE,
					"slug": slug,
					"title": spec["title"],
					"description": spec.get("description"),
					"monthly_price_usd": spec["monthly_price_usd"],
					"category": spec.get("category") or "Other",
					"upstream_frappe_app": spec.get("upstream_frappe_app"),
					"doctypes_unlocked": doctypes_json,
					"modules_unlocked": modules_json,
					"enabled": 1,
				}
			)
			doc.flags.ignore_permissions = True
			doc.insert(ignore_permissions=True)
	except Exception:
		try:
			frappe.db.rollback()
		except Exception:
			pass
		try:
			frappe.log_error(frappe.get_traceback(), f"Zivvy addon seed: {slug}")
		except Exception:
			pass
