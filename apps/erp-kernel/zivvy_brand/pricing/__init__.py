# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""Zivvy localised pricing module.

Owns the region → currency map + display formatting used by the public
`get_localised_pricing` endpoint and checkout. Amounts themselves come from
Polar's per-currency catalog (`polar_catalog.get_tier_prices`); this module
no longer computes prices via PPP × FX.
"""

from zivvy_brand.pricing.regions import (
	EU_COUNTRIES,
	REGION_CURRENCY,
	SUPPORTED_CURRENCIES,
	ZERO_DECIMAL_CURRENCIES,
	format_cents,
	format_price,
	get_region_for_country,
	resolve_currency,
)

__all__ = [
	"EU_COUNTRIES",
	"REGION_CURRENCY",
	"SUPPORTED_CURRENCIES",
	"ZERO_DECIMAL_CURRENCIES",
	"format_cents",
	"format_price",
	"get_region_for_country",
	"resolve_currency",
]
