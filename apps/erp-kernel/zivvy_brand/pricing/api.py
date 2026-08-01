# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""Public whitelisted endpoint: `zivvy_brand.pricing.api.get_localised_pricing`.

Side-effect-free, cache-friendly, guest-callable. The FE uses this to render
the /pricing page tier cards in the visitor's local currency.

Prices come from Polar's per-currency catalog (see
`zivvy_brand.pricing.polar_catalog.get_tier_prices`). If Polar doesn't have a
native price for the visitor's currency, the endpoint transparently falls
back to USD and sets `notes.source = "usd_fallback"`.

Contract:

    GET /api/method/zivvy_brand.pricing.api.get_localised_pricing?country=IN

    → {
        "region": {
            "country":  "IN",
            "currency": "INR",
            "in_eu":    false,
            "known":    true
        },
        "currency": "INR",
        "tiers": {
            "pro": {
                "monthly": {
                    "amount_cents": 149900,
                    "currency":     "INR",
                    "formatted":    "₹1,499",
                    "source":       "polar_catalog",  # or "usd_fallback"
                    "price_id":     "…uuid…"           # empty on usd_fallback
                                                       # w/o wired USD price
                },
                "annual":  { ... }
            },
            "business": { ... }
        },
        "notes": {
            "source":                       "polar_catalog" | "usd_fallback",
            "cache_state":                  "fresh" | "stale" | "miss",
            "checkout_currency_supported":  true | false
        }
    }
"""

from __future__ import annotations

from typing import Any

import frappe

from zivvy_brand.pricing.polar_catalog import get_tier_prices
from zivvy_brand.pricing.regions import (
	SUPPORTED_CURRENCIES,
	format_cents,
	get_region_for_country,
	resolve_currency,
)

_KNOWN_TIER_SLUGS = ("pro", "business")


# ---------------------------------------------------------------------------
# Public endpoint
# ---------------------------------------------------------------------------

@frappe.whitelist(allow_guest=True)
def get_localised_pricing(country: str | None = None, currency: str | None = None) -> dict:
	"""Return localised pricing for Pro + Business tiers.

	Args:
	    country:  ISO-3166 alpha-2 (case-insensitive). Optional.
	    currency: Explicit ISO-4217 override. Optional. Wins over the
	              country-derived currency if supported; ignored otherwise.

	Guest-callable + side-effect-free. Safe to CDN-cache per (country, currency)
	for the duration of the polar_catalog Redis TTL (currently 15 minutes).
	"""
	country_code = (country or "").strip().upper()
	explicit_currency = (currency or "").strip().upper() or None

	region = get_region_for_country(country_code)

	# Currency resolution: explicit override wins if supported, else the
	# country-derived currency (which itself falls back to USD when unknown).
	if explicit_currency and explicit_currency in SUPPORTED_CURRENCIES:
		display_currency = explicit_currency
	else:
		display_currency = resolve_currency(country_code)

	# One catalog fetch per tier — both are cached in Redis for 15 min so this
	# is effectively free on hot paths.
	tiers_payload: dict[str, dict[str, Any]] = {}
	overall_source = "polar_catalog"
	overall_cache_state = "fresh"
	checkout_supported = False

	for slug in _KNOWN_TIER_SLUGS:
		catalog = get_tier_prices(slug)
		# Aggregate cache state across tiers: any tier degrading demotes the
		# whole response so the FE can render a single banner.
		tier_source = str(catalog.get("source") or "usd_fallback")
		tier_cache = str(catalog.get("cache_state") or "miss")
		overall_source = _demote_source(overall_source, tier_source)
		overall_cache_state = _demote_cache_state(overall_cache_state, tier_cache)

		monthly_cell, m_supported = _project_cell(catalog, display_currency, "monthly")
		annual_cell, a_supported = _project_cell(catalog, display_currency, "annual")
		# We consider checkout "supported" in the requested currency when at
		# least one cadence has a native (non-fallback) price — the FE uses
		# this to suppress the "billed in USD" disclosure.
		checkout_supported = checkout_supported or m_supported or a_supported

		tiers_payload[slug] = {"monthly": monthly_cell, "annual": annual_cell}

	return {
		"region": region,
		"currency": display_currency,
		"tiers": tiers_payload,
		"notes": {
			"source": overall_source,
			"cache_state": overall_cache_state,
			"checkout_currency_supported": checkout_supported,
		},
	}


# ---------------------------------------------------------------------------
# Internals
# ---------------------------------------------------------------------------

def _project_cell(
	catalog: dict[str, Any],
	display_currency: str,
	cadence: str,
) -> tuple[dict[str, Any] | None, bool]:
	"""Pick a `{monthly|annual}` cell from the catalog for `display_currency`.

	Returns `(cell, native_currency_available)`. When the requested currency
	isn't in the catalog we fall back to USD and stamp `source="usd_fallback"`
	on the returned cell.
	"""
	target_ccy = display_currency.lower()
	native = _read_cell(catalog, target_ccy, cadence)
	if native is not None:
		return _formatted_cell(native, source="polar_catalog"), True

	# Currency not on Polar for this tier — fall back to the USD price. The
	# FE surfaces this via the "billed in USD" disclosure.
	usd_cell = _read_cell(catalog, "usd", cadence)
	if usd_cell is not None:
		return _formatted_cell(usd_cell, source="usd_fallback"), False

	# No cell at all (tier row missing / Polar returned nothing) — surface an
	# empty placeholder so the FE can degrade gracefully.
	return None, False


def _read_cell(catalog: dict[str, Any], ccy: str, cadence: str) -> dict[str, Any] | None:
	bucket = catalog.get(ccy)
	if not isinstance(bucket, dict):
		return None
	cell = bucket.get(cadence)
	if not isinstance(cell, dict):
		return None
	# Defensive: must have both an amount and a currency.
	if cell.get("amount_cents") is None or not cell.get("currency"):
		return None
	return cell


def _formatted_cell(cell: dict[str, Any], *, source: str) -> dict[str, Any]:
	"""Attach display fields + source label to a raw catalog cell."""
	amount_cents = cell.get("amount_cents") or 0
	currency = str(cell.get("currency") or "usd").upper()
	price_id = str(cell.get("price_id") or "")
	return {
		"amount_cents": int(amount_cents),
		"currency": currency,
		"formatted": format_cents(amount_cents, currency),
		"source": source,
		"price_id": price_id,
	}


def _demote_source(current: str, incoming: str) -> str:
	"""Aggregate source labels: any `usd_fallback` demotes the whole response."""
	if current == "usd_fallback" or incoming == "usd_fallback":
		return "usd_fallback"
	return "polar_catalog"


def _demote_cache_state(current: str, incoming: str) -> str:
	"""Aggregate cache states: miss > stale > fresh (worse wins)."""
	order = {"fresh": 0, "stale": 1, "miss": 2}
	a = order.get(current, 2)
	b = order.get(incoming, 2)
	worse = max(a, b)
	for label, rank in order.items():
		if rank == worse:
			return label
	return "miss"
