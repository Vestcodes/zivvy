# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""Self-serve Pro / Business tier checkout + seat mutation endpoints.

- ``list_tiers``: public catalog of enabled Zivvy Tier rows.
- ``get_my_subscription``: authenticated view of the current tenant's
  ``Zivvy Subscription`` (site single — Polar-provisioned tier + status).
- ``subscribe_tier``: create a Polar checkout session for the requested
  tier + billing cadence. Falls back to a placeholder billing URL when
  Polar is not fully configured yet.
- ``update_seat_quantity``: bump / trim seat count on the current
  tenant's Polar subscription. Falls back to a fresh checkout for
  free-tier tenants with no active subscription, and to the customer
  portal when Polar refuses direct PATCH.
"""

from __future__ import annotations

from typing import Any

import frappe
from frappe import _
from frappe.utils import cint

TIER_DOCTYPE = "Zivvy Tier"
SUCCESS_URL_BASE = "https://zivvy.xyz/settings?polar_success=1"
CANCEL_URL = "https://zivvy.xyz/pricing?polar_cancelled=1"
SEATS_SUCCESS_URL_BASE = "https://zivvy.xyz/dashboard?polar_seats_updated=1"

VALID_TIERS = ("pro", "business")
VALID_BILLING = ("monthly", "annual")

# Currencies for which a per-currency Polar price ID may be wired up on Zivvy
# Tier (fields `polar_price_id_{monthly|annual}_{ccy}`). Kept lowercase to
# match the fieldname convention. Extend cautiously — an entry here without a
# real Polar price falls through to USD anyway (logged), but a stale name
# looks like a bug.
LOCALISED_PRICE_CURRENCIES: tuple[str, ...] = (
	"eur", "gbp", "inr", "brl", "mxn", "idr", "pln",
	"aud", "cad", "jpy", "sgd",
)


# ---------------------------------------------------------------------------
# Public catalog
# ---------------------------------------------------------------------------

@frappe.whitelist(allow_guest=True)
def list_tiers() -> list[dict]:
	"""Public list of enabled paid tiers."""
	if not frappe.db.exists("DocType", TIER_DOCTYPE):
		return []
	rows = frappe.get_all(
		TIER_DOCTYPE,
		filters={"enabled": 1},
		fields=[
			"name",
			"slug",
			"title",
			"monthly_price_usd",
			"annual_price_usd",
		],
		order_by="monthly_price_usd asc",
		ignore_permissions=True,
	)
	return [
		{
			"name": row.get("name"),
			"slug": row.get("slug"),
			"title": row.get("title"),
			"monthly_price_usd": row.get("monthly_price_usd"),
			"annual_price_usd": row.get("annual_price_usd"),
		}
		for row in rows
	]


@frappe.whitelist()
def get_my_subscription() -> dict:
	"""Return the current tenant's live subscription snapshot."""
	_require_auth()
	tenant = _current_tenant_name()
	if not tenant:
		return {"tier": "free", "status": "none", "tenant": None}

	try:
		from zivvy_brand.billing.subscription import get_subscription_state

		state = get_subscription_state()
	except Exception:
		state = {"tier": "free", "status": "none"}

	state["tenant"] = tenant
	return state


# ---------------------------------------------------------------------------
# Checkout
# ---------------------------------------------------------------------------

@frappe.whitelist()
def subscribe_tier(
	tier: str,
	billing: str = "monthly",
	currency: str | None = None,
	country: str | None = None,
) -> dict:
	"""Kick off Polar checkout for a paid tier + billing cadence.

	Args:
	  tier:     "pro" | "business"
	  billing:  "monthly" | "annual"
	  currency: optional lowercase ISO-4217 (e.g. "eur", "inr"). When set,
	            we look up a per-currency Polar price ID via
	            `polar_catalog.get_tier_prices` (or a manual override on the
	            Zivvy Tier row) and use it if present; otherwise we forward
	            the currency to Polar so it presents in that currency via its
	            own FX. Falls back cleanly to USD if neither piece is wired
	            up.
	  country:  optional ISO-3166 alpha-2. Used only for metadata /
	            observability today — Polar itself infers geo from the IP
	            we forward.
	"""
	_require_auth()

	slug = (tier or "").strip().lower()
	cadence = (billing or "monthly").strip().lower()
	req_currency = _validate_currency_arg(currency)
	req_country = (country or "").strip().upper() or None

	if slug not in VALID_TIERS:
		frappe.throw(_("Unknown tier: {0}").format(tier or ""))
	if cadence not in VALID_BILLING:
		frappe.throw(_("Unknown billing cadence: {0}").format(billing or ""))

	tenant = _current_tenant_name()
	if not tenant:
		frappe.throw(_("Your account is not linked to a tenant."), frappe.PermissionError)

	row = _load_tier_by_slug(slug)
	if not row:
		frappe.throw(_("Tier {0} not available").format(slug), frappe.DoesNotExistError)
	if not cint(row.enabled):
		frappe.throw(_("Tier {0} not available").format(slug))

	# Monthly and annual are SEPARATE products in Polar. Each cadence needs
	# its own (product_id, price_id) pair — using a monthly price against an
	# annual product (or vice-versa) fails at Polar with a 4xx.
	if cadence == "annual":
		product_id = (getattr(row, "polar_product_id_annual", "") or "").strip()
		usd_price_id = (getattr(row, "polar_price_id_annual", "") or "").strip()
	else:
		product_id = (getattr(row, "polar_product_id_monthly", "") or "").strip()
		usd_price_id = (getattr(row, "polar_price_id_monthly", "") or "").strip()

	# When Polar isn't wired up yet (missing token, product id, or price id),
	# fall back to the Desk billing route so the FE still routes to something.
	if not product_id or not usd_price_id:
		return {
			"checkout_url": f"/app/billing?tier={slug}&billing={cadence}",
			"polar_configured": False,
		}

	# Currency-specific price ID lookup (v1 non-breaking optional fields).
	# If empty → USD fallback, logged so we can see how often it happens.
	localised_price_id, effective_currency = _pick_localised_price_id(
		row=row, cadence=cadence, requested_currency=req_currency,
	)
	price_id = localised_price_id or usd_price_id

	try:
		from zivvy_brand.billing.polar_client import (
			PolarNotConfigured,
			create_checkout_session,
		)
	except Exception:
		return {
			"checkout_url": f"/app/billing?tier={slug}&billing={cadence}",
			"polar_configured": False,
		}

	success_url = f"{SUCCESS_URL_BASE}&tier={slug}&billing={cadence}"
	if effective_currency:
		success_url = f"{success_url}&currency={effective_currency}"

	# Belt-and-braces: forward the caller's IP to Polar so it can still
	# localise even if the FE forgot to send `currency`.
	client_ip = _safe_request_ip()

	metadata: dict[str, Any] = {
		"zivvy_tenant": tenant,
		"tenant": tenant,
		"tier": slug,
		"billing": cadence,
		"polar_price_id": price_id,
	}
	if effective_currency:
		metadata["zv_currency"] = effective_currency
	if req_country:
		metadata["zv_country"] = req_country

	try:
		user_email = frappe.session.user if frappe.session.user != "Guest" else None
		session = create_checkout_session(
			product_id=product_id,
			price_id=localised_price_id or None,
			customer_email=user_email,
			external_customer_id=tenant,
			success_url=success_url,
			return_url=CANCEL_URL,
			currency=effective_currency,
			customer_ip_address=client_ip,
			metadata=metadata,
		)
		url = (session or {}).get("url") or ""
		if not url:
			return {
				"checkout_url": f"/app/billing?tier={slug}&billing={cadence}",
				"polar_configured": False,
			}
		result = {
			"checkout_url": url,
			"polar_configured": True,
			"currency": effective_currency or "usd",
		}
		if req_currency and not localised_price_id:
			# We requested a currency but couldn't map it to a per-currency
			# price ID — Polar will present in the requested currency using
			# its own FX (or fall back internally). Surface this to the FE
			# so it can render a "billed via Polar FX" hint.
			result["price_source"] = "usd_polar_fx"
		elif localised_price_id:
			result["price_source"] = "localised_price_id"
		else:
			result["price_source"] = "usd"
		return result
	except PolarNotConfigured:
		return {
			"checkout_url": f"/app/billing?tier={slug}&billing={cadence}",
			"polar_configured": False,
		}
	except Exception:
		try:
			frappe.log_error(frappe.get_traceback(), "Zivvy tier checkout")
		except Exception:
			pass
		return {
			"checkout_url": f"/app/billing?tier={slug}&billing={cadence}",
			"polar_configured": False,
		}


# Back-compat alias — the design brief refers to `create_tier_checkout`; the
# original codebase uses `subscribe_tier`. New callers should prefer either.
create_tier_checkout = subscribe_tier


# ---------------------------------------------------------------------------
# Seat quantity mutation
# ---------------------------------------------------------------------------

@frappe.whitelist()
def update_seat_quantity(new_quantity) -> dict:
	"""Bump / trim seats on the current tenant's Polar subscription.

	Response modes:
	  - ``{ mode: "direct", updated: true, seats }``   → PATCH accepted; the
	    ``seat_limit`` is optimistically bumped locally; the ``subscription.updated``
	    webhook confirms and may correct.
	  - ``{ mode: "checkout", checkout_url, seats }``  → tenant has no active
	    subscription (or is on Free); redirect the user to Polar to buy the
	    requested seat count on the tenant's current-or-Pro tier.
	  - ``{ mode: "portal", portal_url, seats }``      → Polar refused the
	    direct PATCH (product config, legacy plan); hand the user off to the
	    Polar customer portal to adjust seats themselves.
	  - ``{ mode: "placeholder", checkout_url, polar_configured: false }``
	    → Polar isn't wired up yet — send them into the Desk billing route.

	Refuses to shrink below the tenant's live billable-user count so the FE
	can surface a clear "disable users first" message.
	"""
	_require_auth()
	tenant = _current_tenant_name()
	if not tenant:
		frappe.throw(_("Your account is not linked to a workspace."), frappe.PermissionError)

	try:
		qty = int(new_quantity)
	except (TypeError, ValueError):
		frappe.throw(_("Seats must be a whole number."))
	if qty < 1:
		frappe.throw(_("Seats must be at least 1."))

	from zivvy_brand.gating.seats import count_billable_users_for_tenant

	used = count_billable_users_for_tenant(tenant)
	if qty < used:
		frappe.throw(
			_(
				"You have {0} active users on this workspace. "
				"Disable users before reducing seats to {1}."
			).format(used, qty)
		)

	if not frappe.db.exists("Zivvy Tenant", tenant):
		frappe.throw(_("Workspace record missing."))

	row = frappe.db.get_value(
		"Zivvy Tenant",
		tenant,
		["polar_subscription_id", "plan"],
		as_dict=True,
	) or {}
	subscription_id = (row.get("polar_subscription_id") or "").strip()
	raw_tier = (row.get("plan") or "free").strip().lower()
	current_tier = raw_tier if raw_tier in VALID_TIERS else "free"

	# --- No live subscription: mint a fresh checkout for the desired quantity ---
	if not subscription_id:
		checkout_tier = current_tier if current_tier in VALID_TIERS else "pro"
		return _mint_seat_checkout(tenant=tenant, tier_slug=checkout_tier, qty=qty)

	# --- Live subscription: attempt direct PATCH ---
	try:
		from zivvy_brand.billing.polar_client import (
			PolarAPIError,
			PolarNotConfigured,
			update_subscription_seats,
		)
	except Exception:
		return {
			"mode": "placeholder",
			"checkout_url": f"/app/billing?tier={current_tier}&seats={qty}",
			"polar_configured": False,
			"seats": qty,
		}

	try:
		update_subscription_seats(subscription_id=subscription_id, seats=qty)
	except PolarNotConfigured:
		return {
			"mode": "placeholder",
			"checkout_url": f"/app/billing?tier={current_tier}&seats={qty}",
			"polar_configured": False,
			"seats": qty,
		}
	except PolarAPIError:
		# PATCH not supported / rejected. Cascading fallbacks:
		#   1) Reuse the mature portal-open flow in billing.api.create_portal_session
		#      (it retries customer_id + external_customer_id, handles missing-customer)
		#   2) Failing that, mint a fresh checkout URL for the requested seat count
		# Do NOT throw — the whole point is to always give the user a next step.
		try:
			from zivvy_brand.billing.api import create_portal_session as _open_portal
			session = _open_portal()
			url = (session or {}).get("url") or ""
			if url:
				return {"mode": "portal", "portal_url": url, "seats": qty}
		except Exception:
			frappe.log_error(frappe.get_traceback(), "Zivvy seat portal fallback")
		# Portal path unavailable → hand out a fresh checkout for the desired qty.
		return _mint_seat_checkout(tenant=tenant, tier_slug=current_tier, qty=qty)
	except Exception:
		frappe.log_error(frappe.get_traceback(), "Zivvy seat quantity update")
		# Same fallback rather than a dead-end throw.
		return _mint_seat_checkout(tenant=tenant, tier_slug=current_tier, qty=qty)

	# Optimistic local cap bump — the subscription.updated webhook will confirm
	# (or correct) shortly. Without this, the invite modal opened immediately
	# after a top-up would still see the stale ceiling.
	try:
		frappe.db.set_value(
			"Zivvy Tenant",
			tenant,
			"seat_limit",
			max(1, qty),
			update_modified=False,
		)
		frappe.db.commit()
	except Exception:
		# Local write failing is not fatal — the webhook will still land.
		frappe.log_error(frappe.get_traceback(), "Zivvy seat_limit local write")

	return {"mode": "direct", "updated": True, "seats": qty}


def _mint_seat_checkout(*, tenant: str, tier_slug: str, qty: int) -> dict:
	"""Build a Polar checkout URL for `qty` seats on `tier_slug` (monthly).

	Used by ``update_seat_quantity`` when the tenant has no live subscription
	(fresh Free tenant, or a lapsed subscription with no ``polar_subscription_id``).
	Falls back to the Desk billing route when Polar isn't fully configured.
	"""
	row = _load_tier_by_slug(tier_slug)
	product_id = ""
	price_id = ""
	if row:
		product_id = (getattr(row, "polar_product_id_monthly", "") or "").strip()
		price_id = (getattr(row, "polar_price_id_monthly", "") or "").strip()

	if not product_id:
		return {
			"mode": "placeholder",
			"checkout_url": f"/app/billing?tier={tier_slug}&seats={qty}",
			"polar_configured": False,
			"seats": qty,
		}

	try:
		from zivvy_brand.billing.polar_client import (
			PolarAPIError,
			PolarNotConfigured,
			create_checkout_session,
		)
	except Exception:
		return {
			"mode": "placeholder",
			"checkout_url": f"/app/billing?tier={tier_slug}&seats={qty}",
			"polar_configured": False,
			"seats": qty,
		}

	success_url = f"{SEATS_SUCCESS_URL_BASE}&seats={qty}&tier={tier_slug}"
	try:
		user_email = frappe.session.user if frappe.session.user != "Guest" else None
		session = create_checkout_session(
			product_id=product_id,
			seats=qty,
			customer_email=user_email,
			external_customer_id=tenant,
			success_url=success_url,
			return_url=CANCEL_URL,
			metadata={
				"zivvy_tenant": tenant,
				"tenant": tenant,
				"tier": tier_slug,
				"billing": "monthly",
				"polar_price_id": price_id,
				"zivvy_seats": str(qty),
				"intent": "seat_upgrade",
			},
		)
	except PolarNotConfigured:
		return {
			"mode": "placeholder",
			"checkout_url": f"/app/billing?tier={tier_slug}&seats={qty}",
			"polar_configured": False,
			"seats": qty,
		}
	except PolarAPIError:
		frappe.log_error(frappe.get_traceback(), "Zivvy seat upgrade checkout")
		return {
			"mode": "placeholder",
			"checkout_url": f"/app/billing?tier={tier_slug}&seats={qty}",
			"polar_configured": False,
			"seats": qty,
		}
	except Exception:
		frappe.log_error(frappe.get_traceback(), "Zivvy seat upgrade checkout (unknown)")
		return {
			"mode": "placeholder",
			"checkout_url": f"/app/billing?tier={tier_slug}&seats={qty}",
			"polar_configured": False,
			"seats": qty,
		}

	url = (session or {}).get("url") or ""
	if not url:
		return {
			"mode": "placeholder",
			"checkout_url": f"/app/billing?tier={tier_slug}&seats={qty}",
			"polar_configured": False,
			"seats": qty,
		}
	return {"mode": "checkout", "checkout_url": url, "seats": qty}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _require_auth() -> None:
	user = frappe.session.user
	if not user or user == "Guest":
		frappe.throw(_("Authentication required"), frappe.AuthenticationError)


def _current_tenant_name() -> str | None:
	try:
		from zivvy_brand.tenancy.context import get_user_tenant_name

		return get_user_tenant_name()
	except Exception:
		return None


def _load_tier_by_slug(slug: str) -> Any | None:
	if not frappe.db.exists("DocType", TIER_DOCTYPE):
		return None
	name = frappe.db.get_value(TIER_DOCTYPE, {"slug": slug}, "name")
	if not name:
		return None
	return frappe.get_cached_doc(TIER_DOCTYPE, name)


def _validate_currency_arg(currency: str | None) -> str | None:
	"""Normalize and validate the caller-supplied currency.

	Returns the lowercase ISO-4217 code or None. Raises a 400 for junk input
	so the FE learns fast; passes an empty / None arg through unchanged.
	"""
	if currency is None:
		return None
	code = str(currency).strip().lower()
	if not code:
		return None
	if len(code) != 3 or not code.isalpha():
		frappe.throw(_("Invalid currency: {0}").format(currency))
	if code not in LOCALISED_PRICE_CURRENCIES and code != "usd":
		# Not in our short list — accept USD silently, log the miss so we
		# can see which currencies users are actually asking for.
		try:
			frappe.log_error(
				title="tier_checkout_currency_unsupported",
				message=f"Requested currency={code!r} outside LOCALISED_PRICE_CURRENCIES",
			)
		except Exception:
			pass
		return None
	return code


def _pick_localised_price_id(
	*, row: Any, cadence: str, requested_currency: str | None,
) -> tuple[str, str | None]:
	"""Look up the per-currency Polar price ID for this tier + cadence.

	Resolution order:
	  1. Ops override on the Zivvy Tier row (``polar_price_id_{cadence}_{ccy}``)
	     — kept as a manual escape hatch even though the catalog now sources
	     price IDs dynamically.
	  2. Polar's per-currency catalog for this tier's product
	     (``polar_catalog.get_tier_prices``). This is the primary source in v2.
	  3. Fall back to USD, but still forward the requested currency to Polar so
	     it can present via its own FX conversion.

	Returns `(price_id, effective_currency)`:
	  * `price_id` is "" when we fall back to the USD product.
	  * `effective_currency` is the lowercase currency we'll forward to
	    Polar. May be non-None even when `price_id == ""` — that tells the
	    checkout call to ask Polar to present in that currency via FX.
	"""
	if not requested_currency or requested_currency == "usd":
		return "", None

	# --- 1. Manual override on the tier row --------------------------------
	fieldname = f"polar_price_id_{cadence}_{requested_currency}"
	override = (getattr(row, fieldname, "") or "").strip()
	if override:
		return override, requested_currency

	# --- 2. Polar per-currency catalog -------------------------------------
	slug = (getattr(row, "slug", "") or "").strip().lower()
	if slug:
		try:
			from zivvy_brand.pricing.polar_catalog import get_tier_prices

			catalog = get_tier_prices(slug)
		except Exception:
			catalog = {}
		bucket = catalog.get(requested_currency) if isinstance(catalog, dict) else None
		if isinstance(bucket, dict):
			cell = bucket.get(cadence)
			if isinstance(cell, dict):
				price_id = str(cell.get("price_id") or "").strip()
				if price_id:
					return price_id, requested_currency

	# --- 3. No per-currency price ID anywhere — log the miss and forward the
	# currency to Polar so it can present via its own FX.
	try:
		frappe.log_error(
			title="tier_checkout_localised_price_missing",
			message=(
				f"Tier {slug or '?'!r} has no {fieldname} override and no "
				f"catalog entry for {requested_currency!r}; falling back to "
				f"USD price with currency forwarded to Polar."
			),
		)
	except Exception:
		pass
	return "", requested_currency


def _safe_request_ip() -> str | None:
	"""Best-effort read of the caller's IP for Polar geo hinting.

	Frappe stashes this at `frappe.local.request_ip`. Fails soft: the
	checkout should still succeed even if we can't grab the IP.
	"""
	try:
		ip = getattr(frappe.local, "request_ip", None)
	except Exception:
		return None
	if not ip:
		return None
	ip = str(ip).strip()
	# Reject obviously-loopback / placeholder addresses — no value in
	# forwarding those to Polar and they'd just get echoed back to the log.
	if ip in ("", "127.0.0.1", "::1", "0.0.0.0"):
		return None
	return ip
