# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""Seed default Zivvy Tier catalog rows.

Called from ``zivvy_brand.setup.install.after_migrate``. Upserts by slug so
ops-authored Polar IDs are preserved across migrations:

- Pricing fields (``monthly_price_usd`` / ``annual_price_usd``) and ``title``
  are always refreshed to keep the marketing hero in sync.
- Polar product / price IDs are ONLY written when the row's current value is
  empty, so ops edits made in Desk stick across ``bench migrate``.

Canonical Polar IDs live below as hardcoded defaults; each one can be
overridden via an environment variable (see ``ENV_KEYS``) without touching
the codebase.
"""

from __future__ import annotations

import os

import frappe

TIER_DOCTYPE = "Zivvy Tier"


# Hardcoded canonical Polar IDs for the production zivvy.xyz storefront.
# Monthly and annual are SEPARATE products in Polar, so each cadence gets its
# own (product_id, price_id) pair.
_DEFAULT_POLAR_IDS: dict[str, dict[str, str]] = {
	"pro": {
		"polar_product_id_monthly": "69a971ba-3d51-4df5-b86c-95fd72c58006",
		"polar_price_id_monthly": "aedf8143-db71-4029-b834-0706ddc6053a",
		"polar_product_id_annual": "22ecef08-a3c8-4768-b2d5-6b27e635f10b",
		"polar_price_id_annual": "a827708e-b85a-49c4-a5e1-514fd30b68bc",
	},
	"business": {
		"polar_product_id_monthly": "ad515a76-fc1e-4f83-ac1b-b709d8797f62",
		"polar_price_id_monthly": "3cfcba3b-2b3a-40c5-9696-74496e407885",
		"polar_product_id_annual": "f5a04ac6-b425-4b23-8fe9-4ee32e2b6625",
		"polar_price_id_annual": "bc168cd1-a998-4c06-8c03-8e4a45e768ec",
	},
}

# Env var overrides — keyed the same as _DEFAULT_POLAR_IDS[<slug>].
_ENV_KEYS: dict[str, dict[str, str]] = {
	"pro": {
		"polar_product_id_monthly": "ZIVVY_POLAR_PRO_PRODUCT_MONTHLY",
		"polar_price_id_monthly": "ZIVVY_POLAR_PRO_PRICE_MONTHLY",
		"polar_product_id_annual": "ZIVVY_POLAR_PRO_PRODUCT_ANNUAL",
		"polar_price_id_annual": "ZIVVY_POLAR_PRO_PRICE_ANNUAL",
	},
	"business": {
		"polar_product_id_monthly": "ZIVVY_POLAR_BUSINESS_PRODUCT_MONTHLY",
		"polar_price_id_monthly": "ZIVVY_POLAR_BUSINESS_PRICE_MONTHLY",
		"polar_product_id_annual": "ZIVVY_POLAR_BUSINESS_PRODUCT_ANNUAL",
		"polar_price_id_annual": "ZIVVY_POLAR_BUSINESS_PRICE_ANNUAL",
	},
}


DEFAULT_TIERS: list[dict] = [
	{
		"slug": "pro",
		"title": "Pro",
		"monthly_price_usd": 18,
		"annual_price_usd": 14,
	},
	{
		"slug": "business",
		"title": "Business",
		"monthly_price_usd": 30,
		"annual_price_usd": 24,
	},
]


def _resolve_polar_ids(slug: str) -> dict[str, str]:
	"""Env vars win over hardcoded defaults. Empty env values fall back."""
	defaults = _DEFAULT_POLAR_IDS.get(slug, {})
	env_keys = _ENV_KEYS.get(slug, {})
	resolved: dict[str, str] = {}
	for field, default_id in defaults.items():
		env_key = env_keys.get(field, "")
		override = (os.environ.get(env_key) or "").strip() if env_key else ""
		resolved[field] = override or default_id
	return resolved


def seed_default_tiers() -> None:
	"""Upsert the default Zivvy Tier rows by slug."""
	if not frappe.db.exists("DocType", TIER_DOCTYPE):
		return

	for spec in DEFAULT_TIERS:
		_upsert_tier(spec)

	try:
		frappe.db.commit()
	except Exception:
		pass


def _upsert_tier(spec: dict) -> None:
	slug = (spec.get("slug") or "").strip().lower()
	if slug not in ("pro", "business"):
		return

	polar_ids = _resolve_polar_ids(slug)
	existing = frappe.db.get_value(TIER_DOCTYPE, {"slug": slug}, "name")

	try:
		if existing:
			doc = frappe.get_doc(TIER_DOCTYPE, existing)
			# Refresh authoritative pricing / title on every migrate.
			doc.title = spec["title"]
			doc.monthly_price_usd = spec["monthly_price_usd"]
			if spec.get("annual_price_usd") is not None:
				doc.annual_price_usd = spec["annual_price_usd"]
			if doc.enabled is None:
				doc.enabled = 1
			# Polar IDs: only backfill fields that are empty. Ops edits in Desk
			# override the defaults and must survive re-migrate.
			for field, value in polar_ids.items():
				current = (getattr(doc, field, "") or "").strip()
				if not current and value:
					setattr(doc, field, value)
			doc.flags.ignore_permissions = True
			doc.save(ignore_permissions=True)
		else:
			payload = {
				"doctype": TIER_DOCTYPE,
				"slug": slug,
				"title": spec["title"],
				"monthly_price_usd": spec["monthly_price_usd"],
				"annual_price_usd": spec.get("annual_price_usd") or 0,
				"enabled": 1,
			}
			payload.update(polar_ids)
			doc = frappe.get_doc(payload)
			doc.flags.ignore_permissions = True
			doc.insert(ignore_permissions=True)
	except Exception:
		try:
			frappe.db.rollback()
		except Exception:
			pass
		try:
			frappe.log_error(frappe.get_traceback(), f"Zivvy tier seed: {slug}")
		except Exception:
			pass
