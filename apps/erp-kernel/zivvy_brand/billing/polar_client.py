# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""Thin Polar.sh HTTP client (no Stripe). Credentials from env or Polar Settings."""

from __future__ import annotations

import json
import os
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

import frappe
from frappe import _

from zivvy_brand.constants import (
	POLAR_CANCEL_URL,
	POLAR_SUCCESS_URL,
	PRODUCTION_ORIGIN,
)

PROD_API = "https://api.polar.sh/v1"
SANDBOX_API = "https://sandbox-api.polar.sh/v1"


class PolarNotConfigured(frappe.ValidationError):
	pass


class PolarAPIError(frappe.ValidationError):
	def __init__(
		self,
		message: str,
		*,
		status_code: int | None = None,
		raw_body: str | None = None,
		payload: dict[str, Any] | None = None,
	):
		super().__init__(message)
		self.status_code = status_code
		self.raw_body = raw_body or ""
		self.payload = payload or {}


def _env_secret(name: str) -> str:
	"""Read env secret; treat empty / PLACEHOLDER* stubs as unset so Desk Settings can win."""
	raw = (os.environ.get(name) or "").strip()
	if not raw:
		return ""
	upper = raw.upper()
	if upper.startswith("PLACEHOLDER") or upper in {"TODO", "CHANGE_ME", "REPLACE_ME", "XXX"}:
		return ""
	return raw


def get_polar_config() -> dict[str, Any]:
	"""Merge env with Polar Settings Single (env wins for real secrets; stubs ignored)."""
	cfg = {
		"access_token": _env_secret("POLAR_ACCESS_TOKEN"),
		"webhook_secret": _env_secret("POLAR_WEBHOOK_SECRET"),
		"organization_id": os.environ.get("POLAR_ORGANIZATION_ID") or "",
		"organization_slug": os.environ.get("POLAR_ORGANIZATION_SLUG") or "",
		"pro_product_id": os.environ.get("POLAR_PRO_PRODUCT_ID") or "",
		"business_product_id": os.environ.get("POLAR_BUSINESS_PRODUCT_ID") or "",
		"pro_annual_product_id": os.environ.get("POLAR_PRO_ANNUAL_PRODUCT_ID") or "",
		"business_annual_product_id": os.environ.get("POLAR_BUSINESS_ANNUAL_PRODUCT_ID") or "",
		"success_url": os.environ.get("POLAR_SUCCESS_URL") or "",
		"cancel_url": os.environ.get("POLAR_CANCEL_URL") or "",
		"use_sandbox": cint_env("POLAR_USE_SANDBOX", False),
		"configured": False,
	}

	if frappe.db.exists("DocType", "Polar Settings"):
		try:
			doc = frappe.get_single("Polar Settings")
			cfg["access_token"] = cfg["access_token"] or _password_or_empty(doc, "access_token")
			cfg["webhook_secret"] = cfg["webhook_secret"] or _password_or_empty(doc, "webhook_secret")
			cfg["organization_id"] = cfg["organization_id"] or (doc.organization_id or "")
			cfg["organization_slug"] = cfg["organization_slug"] or (getattr(doc, "organization_slug", None) or "")
			cfg["pro_product_id"] = cfg["pro_product_id"] or (doc.pro_product_id or "")
			cfg["business_product_id"] = cfg["business_product_id"] or (doc.business_product_id or "")
			cfg["pro_annual_product_id"] = cfg["pro_annual_product_id"] or (
				getattr(doc, "pro_annual_product_id", None) or ""
			)
			cfg["business_annual_product_id"] = cfg["business_annual_product_id"] or (
				getattr(doc, "business_annual_product_id", None) or ""
			)
			cfg["success_url"] = cfg["success_url"] or (doc.success_url or "")
			cfg["cancel_url"] = cfg["cancel_url"] or (doc.cancel_url or "")
			if not os.environ.get("POLAR_USE_SANDBOX"):
				cfg["use_sandbox"] = bool(doc.use_sandbox)
		except Exception:
			# Password fields / missing row during migrate
			pass

	cfg["access_token"] = (cfg["access_token"] or "").strip()
	cfg["webhook_secret"] = (cfg["webhook_secret"] or "").strip()
	# Absolute production defaults when nothing configured yet
	cfg["success_url"] = (cfg["success_url"] or "").strip() or POLAR_SUCCESS_URL
	cfg["cancel_url"] = (cfg["cancel_url"] or "").strip() or POLAR_CANCEL_URL
	cfg["base_url"] = SANDBOX_API if cfg["use_sandbox"] else PROD_API
	cfg["configured"] = bool(cfg["access_token"])
	return cfg


def _password_or_empty(doc, fieldname: str) -> str:
	if not doc.get(fieldname):
		return ""
	try:
		return doc.get_password(fieldname) or ""
	except Exception:
		return ""


def cint_env(name: str, default: bool = False) -> bool:
	raw = os.environ.get(name)
	if raw is None:
		return default
	return str(raw).strip().lower() in ("1", "true", "yes", "on")


def require_configured() -> dict[str, Any]:
	cfg = get_polar_config()
	if not cfg["configured"]:
		raise PolarNotConfigured(
			_(
				"Polar billing is not configured. Set POLAR_ACCESS_TOKEN or "
				"Polar Settings → Access Token, plus Pro/Business product IDs."
			)
		)
	return cfg


def api_request(
	method: str,
	path: str,
	*,
	payload: dict | None = None,
	token: str | None = None,
	base_url: str | None = None,
) -> dict:
	cfg = get_polar_config()
	url = (base_url or cfg["base_url"]).rstrip("/") + "/" + path.lstrip("/")
	headers = {
		"Authorization": f"Bearer {token or cfg['access_token']}",
		"Accept": "application/json",
		"Content-Type": "application/json",
		"User-Agent": f"Zivvy-Polar/1.0 (+{PRODUCTION_ORIGIN})",
	}
	data = None
	if payload is not None:
		data = json.dumps(payload).encode("utf-8")

	req = Request(url, data=data, headers=headers, method=method.upper())
	try:
		with urlopen(req, timeout=30) as resp:
			body = resp.read().decode("utf-8")
			return json.loads(body) if body else {}
	except HTTPError as e:
		err_body = e.read().decode("utf-8", errors="replace")
		parsed = _parse_json_object(err_body)
		frappe.log_error(
			title="Polar API error",
			message=f"{method} {url}\n{e.code}\n{err_body}",
		)
		raise PolarAPIError(
			_polar_error_message(e.code, parsed, err_body),
			status_code=e.code,
			raw_body=err_body,
			payload=parsed,
		) from e
	except URLError as e:
		frappe.log_error(title="Polar network error", message=str(e))
		raise PolarAPIError(_("Could not reach Polar API: {0}").format(str(e.reason))) from e


def _short(text: str, limit: int = 280) -> str:
	text = (text or "").strip()
	return text if len(text) <= limit else text[: limit - 1] + "…"


def _parse_json_object(text: str) -> dict[str, Any]:
	try:
		parsed = json.loads(text)
		return parsed if isinstance(parsed, dict) else {}
	except Exception:
		return {}


def _flatten_errors(value: Any) -> list[str]:
	lines: list[str] = []
	if value is None:
		return lines
	if isinstance(value, str):
		text = value.strip()
		if text:
			lines.append(text)
		return lines
	if isinstance(value, dict):
		for key in ("message", "detail", "error", "title", "reason"):
			if key in value:
				lines.extend(_flatten_errors(value.get(key)))
		if value.get("errors") is not None:
			lines.extend(_flatten_errors(value.get("errors")))
		return lines
	if isinstance(value, list):
		for item in value:
			lines.extend(_flatten_errors(item))
	return lines


def _polar_error_message(status_code: int, payload: dict[str, Any], raw_body: str) -> str:
	msg = _short("; ".join(dict.fromkeys(_flatten_errors(payload))), 220)
	if not msg:
		msg = _("Unexpected response from billing provider.")
	if status_code in (401, 403):
		return _("Billing provider rejected the request. Please contact support.")
	if status_code in (404, 422):
		return _("Billing provider could not process this request: {0}").format(msg)
	if status_code >= 500:
		return _("Billing provider is temporarily unavailable. Please retry shortly.")
	if msg:
		return _("Billing provider request failed ({0}): {1}").format(status_code, msg)
	return _("Billing provider request failed ({0}).").format(status_code)


# ISO-4217 codes we're willing to forward to Polar. Kept in lock-step with
# zivvy_brand.pricing.regions.SUPPORTED_CURRENCIES so a currency that reaches
# checkout has definitely rendered on the /pricing card first.
SUPPORTED_POLAR_CURRENCIES: tuple[str, ...] = (
	"usd", "eur", "gbp", "cad", "aud", "nzd", "chf", "sek", "nok", "dkk",
	"pln", "czk", "huf", "ron", "bgn", "inr", "brl", "mxn", "idr", "jpy",
	"sgd", "hkd", "twd", "krw", "myr", "thb", "php", "vnd", "aed", "sar",
	"ils", "try", "zar", "egp", "ngn", "kes", "ars", "clp", "cop", "pen",
	"cny", "pkr", "bdt", "lkr", "uah",
)


def _is_currency_not_enabled(err: "PolarAPIError") -> bool:
	"""Detect Polar's "currency not enabled on this org" 4xx.

	Polar's 4xx bodies are `{"detail": [ {loc, msg, type}, ... ]}` FastAPI-style.
	Both the `type` slug and a `loc == [..., "currency"]` shape are checked so we
	tolerate future wording changes.
	"""
	payload = getattr(err, "payload", None) or {}
	if not isinstance(payload, dict):
		return False
	detail = payload.get("detail")
	if not isinstance(detail, list):
		# Some Polar 4xx come as `{"detail": "single message"}` — accept that
		# too when the wording is unambiguous.
		if isinstance(detail, str) and "currency" in detail.lower():
			return True
		return False
	for item in detail:
		if not isinstance(item, dict):
			continue
		t = str(item.get("type") or "").lower()
		if "currency_not_available" in t or "currency_not_enabled" in t:
			return True
		loc = item.get("loc")
		if isinstance(loc, list) and any(
			isinstance(seg, str) and seg.lower() == "currency" for seg in loc
		):
			return True
	return False


def create_checkout_session(
	*,
	product_id: str,
	seats: int | None = None,
	customer_email: str | None = None,
	external_customer_id: str | None = None,
	success_url: str | None = None,
	return_url: str | None = None,
	metadata: dict | None = None,
	discount_id: str | None = None,
	currency: str | None = None,
	customer_ip_address: str | None = None,
	price_id: str | None = None,
) -> dict:
	"""POST /v1/checkouts/ — subscription / one-time checkout.

	``seats`` is only sent for seat-based products. Fixed-price add-ons should
	pass ``seats=None``.

	Localisation:
	  * ``currency`` — lowercase ISO-4217. If set (and not "usd"), it's added
	    to the payload. Polar 4xx with "currency not enabled" triggers a
	    single retry at the org default (USD) — logged for reconciliation.
	  * ``customer_ip_address`` — dotted IPv4 / IPv6 string. Polar uses this
	    to auto-derive country + currency when no explicit `currency` is set.
	    Belt-and-braces so we still localise if the FE forgot to send one.
	  * ``price_id`` — when set, we forward it in the products array
	    (Polar accepts either product or price IDs). Used to swap to a
	    currency-specific price wired up on Zivvy Tier.
	"""
	cfg = require_configured()
	if not product_id and not price_id:
		raise PolarNotConfigured(_("Missing Polar product / price ID for this plan."))

	success = success_url or cfg["success_url"] or POLAR_SUCCESS_URL
	# Polar uses success_url; cancel / abandon is typically handled via return_url
	cancel = return_url or cfg["cancel_url"] or POLAR_CANCEL_URL

	# Polar's `products` array accepts either product IDs or price IDs — if the
	# caller wired up a currency-specific price ID, use that; otherwise the
	# product ID picks Polar's default price.
	products_list = [price_id] if price_id else [product_id]

	base_metadata: dict[str, Any] = dict(metadata or {})
	# Echo the localisation hints so webhook handlers can reconcile without a
	# lookup. Callers may already have set these — don't clobber.
	if currency:
		base_metadata.setdefault("zv_currency", currency.lower())
	if customer_ip_address:
		base_metadata.setdefault("zv_customer_ip", customer_ip_address)

	payload: dict[str, Any] = {
		"products": products_list,
		"success_url": success,
		"return_url": cancel,
		# Let customers enter Polar discount / promo codes (e.g. ActimiTrial, ZIVVY100PRO).
		"allow_discount_codes": True,
		"metadata": base_metadata,
	}
	if seats is not None:
		payload["seats"] = max(1, int(seats))
	if customer_email:
		payload["customer_email"] = customer_email
	if external_customer_id:
		payload["external_customer_id"] = external_customer_id
	if discount_id:
		payload["discount_id"] = discount_id

	requested_currency = (currency or "").strip().lower()
	if requested_currency and requested_currency != "usd":
		if requested_currency in SUPPORTED_POLAR_CURRENCIES:
			payload["currency"] = requested_currency
		else:
			# Unknown currency — don't send it. The caller-level validator
			# should have caught this; we belt-and-brace here so a stale FE
			# doesn't 400 the whole checkout.
			frappe.log_error(
				title="polar_currency_unsupported",
				message=f"Dropped unsupported currency={requested_currency!r} on checkout",
			)

	if customer_ip_address:
		payload["customer_ip_address"] = customer_ip_address

	try:
		return api_request("POST", "/checkouts/", payload=payload)
	except PolarAPIError as e:
		# One retry: if Polar rejected our currency (org doesn't have it
		# enabled), drop it and try again at the org default. Everything else
		# re-raises — silent USD fallback on a *real* checkout error would
		# hide bugs.
		status = getattr(e, "status_code", None)
		if (
			status in (400, 422)
			and "currency" in payload
			and _is_currency_not_enabled(e)
		):
			try:
				frappe.log_error(
					title="polar_currency_fallback",
					message=(
						f"Polar rejected currency={payload.get('currency')!r}; "
						f"retrying at org default. detail={getattr(e, 'raw_body', '')[:400]}"
					),
				)
			except Exception:
				pass
			retry_payload = {**payload}
			retry_payload.pop("currency", None)
			return api_request("POST", "/checkouts/", payload=retry_payload)
		raise


def create_customer_portal_session(
	*,
	customer_id: str | None = None,
	external_customer_id: str | None = None,
) -> dict:
	"""POST /v1/customer-sessions/ — returns customer_portal_url."""
	require_configured()
	if customer_id:
		payload = {"customer_id": customer_id}
	elif external_customer_id:
		payload = {"external_customer_id": external_customer_id}
	else:
		raise PolarAPIError(_("No Polar customer ID on file. Complete a checkout first."))

	return api_request("POST", "/customer-sessions/", payload=payload)


def update_subscription_seats(*, subscription_id: str, seats: int) -> dict:
	"""PATCH /v1/subscriptions/{id} — bump or trim seat quantity on an
	existing seat-priced subscription.

	Raises ``PolarAPIError`` on any non-2xx response so callers can fall back
	to the customer portal when the Polar product / API refuses in-app seat
	mutation (e.g. legacy fixed-quantity plans).
	"""
	require_configured()
	if not subscription_id:
		raise PolarAPIError(_("Missing Polar subscription id."))
	qty = max(1, int(seats))
	# Polar accepts either `seats` or `quantity` depending on product config;
	# send both so the API can pick the one that matches the price model.
	payload = {"seats": qty, "quantity": qty}
	return api_request("PATCH", f"/subscriptions/{subscription_id}", payload=payload)
