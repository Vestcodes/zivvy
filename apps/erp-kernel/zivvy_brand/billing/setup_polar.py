# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""Idempotent Polar product bootstrap for Zivvy Pro / Business.

Creates or reuses seat-based monthly and annual products when POLAR_ACCESS_TOKEN
(or Polar Settings → Access Token) is configured. Never hardcodes secrets.

Usage (bench console / whitelisted):
  from zivvy_brand.billing.setup_polar import setup_polar_products
  setup_polar_products()

Or:  bench execute zivvy_brand.billing.setup_polar.setup_polar_products
"""

from __future__ import annotations

from typing import Any

import frappe
from frappe import _

from zivvy_brand.billing.polar_client import (
	PolarAPIError,
	PolarNotConfigured,
	api_request,
	get_polar_config,
	require_configured,
)
from zivvy_brand.constants import (
	POLAR_BUSINESS_ANNUAL_NAME,
	POLAR_BUSINESS_ANNUAL_PRICE_CENTS,
	POLAR_BUSINESS_NAME,
	POLAR_BUSINESS_PRICE_CENTS,
	POLAR_CANCEL_URL,
	POLAR_PRO_ANNUAL_NAME,
	POLAR_PRO_ANNUAL_PRICE_CENTS,
	POLAR_PRO_NAME,
	POLAR_PRO_PRICE_CENTS,
	POLAR_SUCCESS_URL,
	POLAR_WEBHOOK_URL,
	PRODUCTION_ORIGIN,
)


def _seat_price_payload(price_cents: int) -> dict[str, Any]:
	return {
		"amount_type": "seat_based",
		"price_currency": "usd",
		"seat_tiers": {
			"seat_tier_type": "volume",
			"tiers": [
				{
					"min_seats": 1,
					"max_seats": None,
					"price_per_seat": int(price_cents),
				}
			],
		},
	}


def _list_products() -> list[dict]:
	"""GET /v1/products/ — paginate first page (enough for small catalogues)."""
	data = api_request("GET", "/products/?limit=100")
	if isinstance(data, list):
		return data
	return data.get("items") or data.get("results") or []


def _find_product_by_name(products: list[dict], name: str) -> dict | None:
	needle = (name or "").strip().lower()
	for p in products:
		if (p.get("name") or "").strip().lower() == needle and not p.get("is_archived"):
			return p
	return None


def _create_seat_product(
	*,
	name: str,
	description: str,
	price_cents: int,
	organization_id: str,
	recurring_interval: str = "month",
) -> dict:
	payload: dict[str, Any] = {
		"name": name,
		"description": description,
		"recurring_interval": recurring_interval,
		"recurring_interval_count": 1,
		"prices": [_seat_price_payload(price_cents)],
	}
	if organization_id:
		payload["organization_id"] = organization_id
	return api_request("POST", "/products/", payload=payload)


def _persist_product_ids(
	pro_id: str,
	business_id: str,
	pro_annual_id: str = "",
	business_annual_id: str = "",
) -> None:
	"""Write product IDs into Polar Settings when fields are empty (env still wins at runtime)."""
	if not frappe.db.exists("DocType", "Polar Settings"):
		return
	doc = frappe.get_single("Polar Settings")
	changed = False
	if pro_id and not (doc.pro_product_id or "").strip():
		doc.pro_product_id = pro_id
		changed = True
	if business_id and not (doc.business_product_id or "").strip():
		doc.business_product_id = business_id
		changed = True
	if pro_annual_id and hasattr(doc, "pro_annual_product_id") and not (
		doc.pro_annual_product_id or ""
	).strip():
		doc.pro_annual_product_id = pro_annual_id
		changed = True
	if business_annual_id and hasattr(doc, "business_annual_product_id") and not (
		doc.business_annual_product_id or ""
	).strip():
		doc.business_annual_product_id = business_annual_id
		changed = True
	if not (doc.success_url or "").strip():
		doc.success_url = POLAR_SUCCESS_URL
		changed = True
	if not (doc.cancel_url or "").strip():
		doc.cancel_url = POLAR_CANCEL_URL
		changed = True
	if changed:
		doc.save(ignore_permissions=True)
		frappe.db.commit()


@frappe.whitelist()
def setup_polar_products(force: int | bool = 0) -> dict[str, Any]:
	"""Create/reuse Zivvy Pro & Business seat products; return IDs + webhook docs.

	Idempotent: if a product named exactly \"Zivvy Pro\" / \"Zivvy Business\"
	(or annual variants) exists, reuses it. When `force`, still reuses by name
	(does not duplicate). Requires System Manager. Secrets must already be in
	env or Polar Settings.
	"""
	if frappe.session.user != "Administrator" and "System Manager" not in frappe.get_roles():
		frappe.throw(_("Only System Managers can set up Polar products."), frappe.PermissionError)

	force = int(force or 0)
	try:
		cfg = require_configured()
	except PolarNotConfigured as e:
		frappe.throw(str(e), title=_("Polar not configured"))

	org_id = (cfg.get("organization_id") or "").strip()
	existing = _list_products()

	specs = (
		{
			"key": "pro",
			"name": POLAR_PRO_NAME,
			"description": "Zivvy Pro - $18 per seat / month. CRM, accounting, stock, HR, projects, priority support.",
			"price_cents": POLAR_PRO_PRICE_CENTS,
			"recurring_interval": "month",
			"configured_id": (cfg.get("pro_product_id") or "").strip(),
		},
		{
			"key": "business",
			"name": POLAR_BUSINESS_NAME,
			"description": "Zivvy Business - $30 per seat / month. Advanced manufacturing, multi-company, advanced operations.",
			"price_cents": POLAR_BUSINESS_PRICE_CENTS,
			"recurring_interval": "month",
			"configured_id": (cfg.get("business_product_id") or "").strip(),
		},
		{
			"key": "pro_annual",
			"name": POLAR_PRO_ANNUAL_NAME,
			"description": "Zivvy Pro billed annually - $14/seat/mo equivalent ($168/seat/year, 20% off).",
			"price_cents": POLAR_PRO_ANNUAL_PRICE_CENTS,
			"recurring_interval": "year",
			"configured_id": (cfg.get("pro_annual_product_id") or "").strip(),
		},
		{
			"key": "business_annual",
			"name": POLAR_BUSINESS_ANNUAL_NAME,
			"description": "Zivvy Business billed annually - $24/seat/mo equivalent ($288/seat/year, 20% off).",
			"price_cents": POLAR_BUSINESS_ANNUAL_PRICE_CENTS,
			"recurring_interval": "year",
			"configured_id": (cfg.get("business_annual_product_id") or "").strip(),
		},
	)

	results: dict[str, Any] = {"created": [], "reused": [], "products": {}}

	for spec in specs:
		product = None
		if spec["configured_id"] and not force:
			# Already configured — trust ID, skip create
			results["reused"].append(spec["name"])
			results["products"][spec["key"]] = {
				"id": spec["configured_id"],
				"name": spec["name"],
				"status": "already_configured",
			}
			continue

		product = _find_product_by_name(existing, spec["name"])
		if product:
			results["reused"].append(spec["name"])
			status = "reused_by_name"
		else:
			try:
				product = _create_seat_product(
					name=spec["name"],
					description=spec["description"],
					price_cents=spec["price_cents"],
					organization_id=org_id,
					recurring_interval=spec["recurring_interval"],
				)
				results["created"].append(spec["name"])
				status = "created"
				existing.append(product)
			except PolarAPIError as e:
				frappe.throw(
					_("Could not create {0}: {1}").format(spec["name"], str(e)),
					title=_("Polar product setup failed"),
				)

		results["products"][spec["key"]] = {
			"id": product.get("id"),
			"name": product.get("name") or spec["name"],
			"status": status,
		}

	pro_id = results["products"].get("pro", {}).get("id") or cfg.get("pro_product_id") or ""
	business_id = results["products"].get("business", {}).get("id") or cfg.get("business_product_id") or ""
	pro_annual_id = (
		results["products"].get("pro_annual", {}).get("id") or cfg.get("pro_annual_product_id") or ""
	)
	business_annual_id = (
		results["products"].get("business_annual", {}).get("id")
		or cfg.get("business_annual_product_id")
		or ""
	)
	_persist_product_ids(pro_id, business_id, pro_annual_id, business_annual_id)

	results["urls"] = {
		"success_url": POLAR_SUCCESS_URL,
		"cancel_url": POLAR_CANCEL_URL,
		"webhook_url": POLAR_WEBHOOK_URL,
		"site": PRODUCTION_ORIGIN,
	}
	results["pricing"] = {
		"pro_monthly_usd": POLAR_PRO_PRICE_CENTS / 100,
		"business_monthly_usd": POLAR_BUSINESS_PRICE_CENTS / 100,
		"pro_annual_usd_per_year": POLAR_PRO_ANNUAL_PRICE_CENTS / 100,
		"business_annual_usd_per_year": POLAR_BUSINESS_ANNUAL_PRICE_CENTS / 100,
		"annual_discount": "20%",
	}
	results["next_steps"] = [
		f"Register webhook in Polar dashboard: {POLAR_WEBHOOK_URL}",
		"Subscribe to subscription.* and order.paid events; paste signing secret into POLAR_WEBHOOK_SECRET",
		"Set POLAR_PRO_PRODUCT_ID / POLAR_BUSINESS_PRODUCT_ID and annual IDs from the results below",
		"Test checkout from https://zivvy.xyz/app/billing",
	]
	return results


def try_setup_from_env() -> dict[str, Any] | None:
	"""Optional bootstrap when POLAR_ACCESS_TOKEN is present (CLI / migrate helper).

	Returns None when token missing; never raises on missing token.
	"""
	cfg = get_polar_config()
	if not cfg.get("configured"):
		return None
	try:
		return setup_polar_products()
	except Exception:
		frappe.log_error(frappe.get_traceback(), "try_setup_from_env Polar")
		return {"error": "setup failed — see Error Log"}


def apply_webhook_secret_from_site_config() -> dict[str, Any]:
	"""Ops helper: move site_config `_zivvy_whsec_b64` into Polar Settings, then delete the key.

	Usage::

	  bench --site zivvy.xyz set-config _zivvy_whsec_b64 \"$(printf %s 'whsec_…' | openssl base64 -A)\"
	  bench --site zivvy.xyz execute zivvy_brand.billing.setup_polar.apply_webhook_secret_from_site_config
	"""
	import base64
	import json

	b64 = frappe.conf.get("_zivvy_whsec_b64") or ""
	if not b64:
		frappe.throw(_("site_config key _zivvy_whsec_b64 is missing"))

	try:
		secret = base64.b64decode(b64).decode("utf-8").strip()
	except Exception as e:
		frappe.throw(_("Invalid _zivvy_whsec_b64: {0}").format(str(e)))

	if not secret.startswith(("whsec_", "polar_whs_")) or len(secret) < 20:
		frappe.throw(_("Webhook secret shape looks wrong"))

	doc = frappe.get_single("Polar Settings")
	doc.webhook_secret = secret
	if not (doc.success_url or "").strip():
		doc.success_url = POLAR_SUCCESS_URL
	if not (doc.cancel_url or "").strip():
		doc.cancel_url = POLAR_CANCEL_URL
	doc.flags.ignore_permissions = True
	doc.save(ignore_permissions=True)
	frappe.db.commit()

	# Remove bootstrap key from site_config.json
	try:
		path = frappe.get_site_path("site_config.json")
		with open(path) as f:
			data = json.load(f)
		if "_zivvy_whsec_b64" in data:
			del data["_zivvy_whsec_b64"]
			with open(path, "w") as f:
				json.dump(data, f, indent=1, sort_keys=True)
				f.write("\n")
	except Exception:
		frappe.log_error(frappe.get_traceback(), "clear _zivvy_whsec_b64")

	cfg = get_polar_config()
	return {
		"ok": True,
		"has_webhook_secret": bool(cfg.get("webhook_secret")),
		"webhook_is_whsec": (cfg.get("webhook_secret") or "").startswith("whsec_"),
		"configured": bool(cfg.get("configured")),
		"has_pro_product": bool(cfg.get("pro_product_id")),
		"has_business_product": bool(cfg.get("business_product_id")),
		"has_pro_annual_product": bool(cfg.get("pro_annual_product_id")),
		"has_business_annual_product": bool(cfg.get("business_annual_product_id")),
	}
