# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""Region → currency tables (v2, Polar-sourced pricing).

Kept in lock-step with `zivvy-web/lib/pricing.ts` — any change here needs a
matching change there. PPP math is gone: displayed prices come from Polar's
per-currency catalog (see `polar_catalog.py`) rather than a static PPP × FX
multiplier. This module now just maps countries → currencies and formats
amounts for display.

Public surface:
  * REGION_CURRENCY       — ISO-3166 alpha-2 → ISO-4217 (uppercase)
  * EU_COUNTRIES          — frozenset of EU ISO-2 codes (derived, cached)
  * SUPPORTED_CURRENCIES  — frozenset of the currencies we quote in
  * ZERO_DECIMAL_CURRENCIES — currencies where fractional units are silly
  * resolve_currency(iso2)         → uppercase 3-letter currency
  * get_region_for_country(iso2)   → { country, currency, in_eu, known,
                                       zero_decimal }
  * format_price(amount, ccy)      → "€49" / "₹1,999" style display string
  * format_cents(cents, ccy)       → same, from a minor-units integer
"""

from __future__ import annotations

from typing import Any


# ---------------------------------------------------------------------------
# Region → currency map
# ---------------------------------------------------------------------------

# Kept flat + explicit rather than clever — it doubles as the source of truth
# for the EU set used by GDPR / tax copy elsewhere in the app.
REGION_CURRENCY: dict[str, str] = {
	# --- USD (US + territories) ---
	"US": "USD", "PR": "USD", "VI": "USD", "GU": "USD",
	"AS": "USD", "MP": "USD", "UM": "USD",
	# --- Anglophone majors ---
	"CA": "CAD", "GB": "GBP", "AU": "AUD", "NZ": "NZD",
	# --- Euro area ---
	"DE": "EUR", "FR": "EUR", "IT": "EUR", "ES": "EUR", "NL": "EUR",
	"BE": "EUR", "IE": "EUR", "PT": "EUR", "AT": "EUR", "FI": "EUR",
	"GR": "EUR", "LU": "EUR", "MT": "EUR", "CY": "EUR", "SK": "EUR",
	"SI": "EUR", "EE": "EUR", "LV": "EUR", "LT": "EUR", "HR": "EUR",
	# --- Rest of Europe ---
	"CH": "CHF", "LI": "CHF",
	"SE": "SEK", "NO": "NOK", "DK": "DKK",
	"PL": "PLN", "CZ": "CZK", "HU": "HUF",
	"RO": "RON", "BG": "BGN", "UA": "UAH",
	# --- Asia-Pacific ---
	"JP": "JPY", "SG": "SGD", "HK": "HKD", "TW": "TWD", "KR": "KRW",
	"MY": "MYR", "TH": "THB", "PH": "PHP", "VN": "VND", "CN": "CNY",
	"ID": "IDR", "IN": "INR", "PK": "PKR", "BD": "BDT", "LK": "LKR",
	# --- MENA ---
	"AE": "AED", "SA": "SAR", "IL": "ILS", "TR": "TRY", "EG": "EGP",
	# --- Sub-Saharan Africa ---
	"ZA": "ZAR", "NG": "NGN", "KE": "KES",
	# --- Latin America ---
	"BR": "BRL", "MX": "MXN", "AR": "ARS", "CL": "CLP",
	"CO": "COP", "PE": "PEN",
}

# The Euro-area subset — one source of truth for downstream GDPR / tax modules.
EU_COUNTRIES: frozenset[str] = frozenset(
	{iso for iso, ccy in REGION_CURRENCY.items() if ccy == "EUR"}
)

# All the currencies we can actually quote in. Anything outside this set
# degrades to USD in `resolve_currency`.
SUPPORTED_CURRENCIES: frozenset[str] = frozenset(REGION_CURRENCY.values()) | {"USD"}

# Currencies where 1 minor unit is <<1 USD-cent — pointless to show decimals.
ZERO_DECIMAL_CURRENCIES: frozenset[str] = frozenset({"JPY", "KRW", "VND", "CLP", "IDR"})


# ---------------------------------------------------------------------------
# Currency symbols (best-effort display)
# ---------------------------------------------------------------------------

_CURRENCY_SYMBOL: dict[str, str] = {
	"USD": "$",
	"EUR": "€",
	"GBP": "£",
	"CAD": "CA$",
	"AUD": "A$",
	"NZD": "NZ$",
	"CHF": "CHF ",
	"SEK": "kr ",
	"NOK": "kr ",
	"DKK": "kr ",
	"PLN": "zl ",
	"CZK": "Kc ",
	"HUF": "Ft ",
	"RON": "lei ",
	"BGN": "lv ",
	"INR": "₹",
	"BRL": "R$",
	"MXN": "MX$",
	"IDR": "Rp ",
	"JPY": "¥",
	"SGD": "S$",
	"HKD": "HK$",
	"TWD": "NT$",
	"KRW": "₩",
	"MYR": "RM ",
	"THB": "฿",
	"PHP": "₱",
	"VND": "₫",
	"AED": "AED ",
	"SAR": "SAR ",
	"ILS": "₪",
	"TRY": "₺",
	"ZAR": "R ",
	"EGP": "EGP ",
	"NGN": "₦",
	"KES": "KSh ",
	"ARS": "AR$",
	"CLP": "CLP ",
	"COP": "COL$",
	"PEN": "S/ ",
	"CNY": "¥",
	"PKR": "Rs ",
	"BDT": "৳",
	"LKR": "Rs ",
	"UAH": "₴",
}


# ---------------------------------------------------------------------------
# Public helpers
# ---------------------------------------------------------------------------

def _clean_iso2(country: Any) -> str:
	"""Coerce arbitrary input to a normalized 2-letter uppercase code."""
	if not country:
		return ""
	code = str(country).strip().upper()
	if len(code) != 2 or not code.isalpha():
		return ""
	return code


def resolve_currency(country: Any) -> str:
	"""Return the ISO-4217 currency we quote in for this country.

	Falls back to USD when the country is unknown, blank, or the mapped
	currency is (somehow) not in the supported set.
	"""
	code = _clean_iso2(country)
	if not code:
		return "USD"
	ccy = REGION_CURRENCY.get(code, "USD")
	if ccy not in SUPPORTED_CURRENCIES:
		return "USD"
	return ccy


def get_region_for_country(country: Any) -> dict[str, Any]:
	"""Return the region descriptor for an ISO-3166 alpha-2 code.

	Shape:
	    {
	        "country":      "IN",         # normalized (may be "" if unknown)
	        "currency":     "INR",        # always populated
	        "zero_decimal": False,        # whether to skip fractional digits
	        "in_eu":        False,        # convenience for tax/GDPR copy
	        "known":        True,         # False when we degraded to USD
	    }
	"""
	code = _clean_iso2(country)
	currency = resolve_currency(code)
	return {
		"country": code,
		"currency": currency,
		"zero_decimal": currency in ZERO_DECIMAL_CURRENCIES,
		"in_eu": code in EU_COUNTRIES,
		"known": bool(code) and code in REGION_CURRENCY,
	}


def format_price(amount: Any, currency: str) -> str:
	"""Format a whole-unit amount for display.

	`amount` is in **whole currency units** (dollars, euros, rupees, yen…),
	not cents/paise. Used when a caller already has a converted, rounded
	value (Polar amounts flow through `format_cents` instead).
	"""
	ccy = (currency or "USD").upper()
	if ccy not in SUPPORTED_CURRENCIES:
		ccy = "USD"

	try:
		value = float(amount)
	except (TypeError, ValueError):
		value = 0.0

	if ccy in ZERO_DECIMAL_CURRENCIES:
		body = f"{value:,.0f}"
	elif value >= 10 and abs(value - round(value)) < 1e-6:
		body = f"{value:,.0f}"
	else:
		body = f"{value:,.2f}"

	symbol = _CURRENCY_SYMBOL.get(ccy, ccy + " ")
	return f"{symbol}{body}"


def format_cents(amount_cents: Any, currency: str) -> str:
	"""Format a Polar-style minor-units integer for display.

	Zero-decimal currencies (JPY, KRW, VND, CLP, IDR) are stored in Polar as
	*already* in whole units — Polar keeps `price_amount` as an integer but
	semantically it's still the presentational quantity, not "hundredths".
	Everything else is cents/paise/pence and gets divided by 100.
	"""
	ccy = (currency or "USD").upper()
	if ccy not in SUPPORTED_CURRENCIES:
		ccy = "USD"

	try:
		cents = int(amount_cents)
	except (TypeError, ValueError):
		cents = 0

	if ccy in ZERO_DECIMAL_CURRENCIES:
		value: float = float(cents)
	else:
		value = cents / 100.0

	return format_price(value, ccy)
