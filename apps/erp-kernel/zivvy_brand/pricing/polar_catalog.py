# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""Polar per-currency price catalog for Zivvy tiers.

Polar exposes NO standalone `/v1/prices` resource — prices are always
embedded on the product (verified against api.polar.sh/openapi.json,
2026-07-26). This module walks each tier's two products (monthly + annual)
via `GET /v1/products/{id}`, enumerates the `prices` array, and materialises
a per-currency table:

    {
        "usd": {
            "monthly": {"amount_cents": 1800, "currency": "usd",
                        "price_id": "…uuid…"},
            "annual":  {"amount_cents": 14400, ...},
        },
        "eur":   { ... },
        "inr":   { ... },
        "cache_state": "fresh" | "stale" | "miss",
        "source":      "polar_catalog" | "usd_fallback",
    }

Public surface:
  * get_tier_prices(tier_slug) — cached lookup, 15-minute Redis TTL, with
    stale-cache-ok fallback on Polar 5xx / timeout and a final USD-only
    fallback that reads `monthly_price_usd` / `annual_price_usd` off the
    Zivvy Tier row.

Notes:
  * Currencies are lowercase ISO-4217 to match Polar's wire format.
  * `amount_cents` is Polar's `price_amount` verbatim: minor units for
    most currencies, whole units for the zero-decimal ones (JPY, KRW,
    VND, CLP, IDR). The `format_cents` helper in `regions.py` knows the
    difference.
  * Archived and non-fixed prices (custom / seat_based / metered_unit)
    are skipped — tier cards only show list prices.
"""

from __future__ import annotations

import json
from typing import Any

import frappe

TIER_DOCTYPE = "Zivvy Tier"
VALID_TIERS = ("pro", "business")

# 15 minutes fresh window; 24 h stale-fallback window.
CACHE_TTL_SEC = 15 * 60
STALE_TTL_SEC = 24 * 60 * 60

# Cache key prefixes — bumping the `v1` suffix invalidates all rows in one shot.
_CACHE_KEY = "zivvy:polar_catalog:{slug}:v1"
_STALE_KEY = "zivvy:polar_catalog:{slug}:stale:v1"


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def get_tier_prices(tier_slug: str) -> dict[str, Any]:
	"""Return the per-currency price catalog for a Zivvy tier.

	Shape (see module docstring). On Polar failure returns the last stale
	snapshot with `cache_state="stale"`, or a USD-only fallback derived from
	the tier row with `source="usd_fallback"`.
	"""
	slug = (tier_slug or "").strip().lower()
	if slug not in VALID_TIERS:
		return _empty_result(source="usd_fallback")

	# ---- 1. Fresh cache hit ------------------------------------------------
	fresh = _read_cache(_CACHE_KEY.format(slug=slug))
	if fresh is not None:
		fresh["cache_state"] = "fresh"
		return fresh

	# ---- 2. Fetch from Polar -----------------------------------------------
	try:
		fetched = _fetch_from_polar(slug)
	except Exception:
		# Any error path (PolarNotConfigured, PolarAPIError, timeout, missing
		# row, JSON crud) — fall through to stale, then USD-only.
		try:
			frappe.log_error(frappe.get_traceback(), f"polar_catalog fetch: {slug}")
		except Exception:
			pass
		stale = _read_cache(_STALE_KEY.format(slug=slug))
		if stale is not None:
			stale["cache_state"] = "stale"
			return stale
		return _usd_fallback(slug)

	# Persist under both fresh and stale keys so a Polar outage after this
	# point still has something to serve.
	result = dict(fetched)
	result["source"] = "polar_catalog"
	result["cache_state"] = "fresh"
	_write_cache(_CACHE_KEY.format(slug=slug), result, CACHE_TTL_SEC)
	_write_cache(_STALE_KEY.format(slug=slug), result, STALE_TTL_SEC)
	return result


# ---------------------------------------------------------------------------
# Internals
# ---------------------------------------------------------------------------

def _fetch_from_polar(slug: str) -> dict[str, Any]:
	"""Fetch monthly + annual products for a tier and pivot into per-currency
	cells. Raises on any Polar error / missing product IDs so the caller can
	trigger the stale / USD-only fallback path.
	"""
	row = _load_tier_row(slug)
	if row is None:
		raise RuntimeError(f"Zivvy Tier row missing for slug={slug!r}")

	monthly_product_id = (getattr(row, "polar_product_id_monthly", "") or "").strip()
	annual_product_id = (getattr(row, "polar_product_id_annual", "") or "").strip()

	if not monthly_product_id and not annual_product_id:
		# Nothing to enumerate — treat as a failure so the caller falls back
		# to USD-only from the tier row's static prices.
		raise RuntimeError(f"Tier {slug!r} has no Polar product IDs configured")

	# Import lazily so `regions.py` and this module can still be imported in
	# unit tests without pulling the whole billing chain.
	from zivvy_brand.billing.polar_client import api_request

	result: dict[str, dict[str, Any]] = {}

	if monthly_product_id:
		for ccy, price in _fetch_product_prices(api_request, monthly_product_id).items():
			result.setdefault(ccy, {"monthly": None, "annual": None})
			result[ccy]["monthly"] = price

	if annual_product_id:
		for ccy, price in _fetch_product_prices(api_request, annual_product_id).items():
			result.setdefault(ccy, {"monthly": None, "annual": None})
			result[ccy]["annual"] = price

	# Guarantee a USD entry — Polar's default price is always USD in our
	# storefront, so if it's missing that's a real problem (raise so the
	# stale / USD-only fallback kicks in rather than serving an empty cell).
	if "usd" not in result:
		raise RuntimeError(f"Tier {slug!r} product returned no USD price")

	return result


def _fetch_product_prices(api_request, product_id: str) -> dict[str, dict[str, Any]]:
	"""Enumerate `product.prices[]` → {currency: {amount_cents, currency, price_id}}.

	Only fixed-amount, non-archived prices are kept. Legacy / custom /
	seat-based / metered prices are ignored — the tier cards only surface
	list prices.
	"""
	resp = api_request("GET", f"/products/{product_id}")
	prices = resp.get("prices") if isinstance(resp, dict) else None
	if not isinstance(prices, list):
		return {}

	out: dict[str, dict[str, Any]] = {}
	for p in prices:
		if not isinstance(p, dict):
			continue
		if p.get("is_archived"):
			continue
		# ProductPrice is discriminated on amount_type; only `fixed` and the
		# legacy variants carry a usable price_amount for card display.
		amount_type = str(p.get("amount_type") or "").lower()
		if amount_type and amount_type != "fixed":
			# Legacy rows may lack amount_type but still expose price_amount —
			# accept if the field is missing.
			continue
		ccy = str(p.get("price_currency") or "").strip().lower()
		amount = p.get("price_amount")
		price_id = str(p.get("id") or "").strip()
		if not ccy or amount is None or not price_id:
			continue
		try:
			amount_int = int(amount)
		except (TypeError, ValueError):
			continue
		out[ccy] = {
			"amount_cents": amount_int,
			"currency": ccy,
			"price_id": price_id,
		}
	return out


def _load_tier_row(slug: str):
	"""Load the Zivvy Tier row for `slug` or return None."""
	if not frappe.db.exists("DocType", TIER_DOCTYPE):
		return None
	try:
		name = frappe.db.get_value(TIER_DOCTYPE, {"slug": slug}, "name")
	except Exception:
		return None
	if not name:
		return None
	try:
		return frappe.get_cached_doc(TIER_DOCTYPE, name)
	except Exception:
		return None


def _usd_fallback(slug: str) -> dict[str, Any]:
	"""Last-resort catalog derived from the Zivvy Tier row's static USD prices.

	Used when Polar is unreachable AND there's no stale cache to serve.
	Returns the same shape as the live path so downstream code doesn't need
	to branch on it.
	"""
	row = _load_tier_row(slug)
	monthly_usd = _as_float(getattr(row, "monthly_price_usd", 0) if row else 0)
	annual_usd = _as_float(getattr(row, "annual_price_usd", 0) if row else 0)
	usd_price_id_monthly = ""
	usd_price_id_annual = ""
	if row is not None:
		usd_price_id_monthly = (getattr(row, "polar_price_id_monthly", "") or "").strip()
		usd_price_id_annual = (getattr(row, "polar_price_id_annual", "") or "").strip()

	cells: dict[str, Any] = {"monthly": None, "annual": None}
	if monthly_usd > 0:
		cells["monthly"] = {
			"amount_cents": int(round(monthly_usd * 100)),
			"currency": "usd",
			"price_id": usd_price_id_monthly,
		}
	if annual_usd > 0:
		cells["annual"] = {
			"amount_cents": int(round(annual_usd * 100)),
			"currency": "usd",
			"price_id": usd_price_id_annual,
		}

	return {
		"usd": cells,
		"source": "usd_fallback",
		"cache_state": "miss",
	}


def _empty_result(*, source: str) -> dict[str, Any]:
	"""Return an empty catalog envelope — used for unknown tier slugs."""
	return {"source": source, "cache_state": "miss"}


# ---------------------------------------------------------------------------
# Cache helpers
# ---------------------------------------------------------------------------

def _read_cache(key: str) -> dict[str, Any] | None:
	"""Return the parsed dict at `key`, or None on miss / decode error."""
	try:
		raw = frappe.cache.get_value(key)
	except Exception:
		return None
	if not raw:
		return None
	if isinstance(raw, dict):
		return dict(raw)
	if isinstance(raw, (bytes, bytearray)):
		try:
			raw = raw.decode("utf-8")
		except Exception:
			return None
	if isinstance(raw, str):
		try:
			parsed = json.loads(raw)
		except Exception:
			return None
		return parsed if isinstance(parsed, dict) else None
	return None


def _write_cache(key: str, value: dict[str, Any], ttl_sec: int) -> None:
	"""Persist `value` at `key` with the given TTL. Failures are swallowed —
	the catalog can always be re-fetched next call.
	"""
	try:
		frappe.cache.set_value(key, json.dumps(value), expires_in_sec=ttl_sec)
	except Exception:
		pass


def _as_float(value: Any) -> float:
	try:
		return float(value or 0)
	except (TypeError, ValueError):
		return 0.0
