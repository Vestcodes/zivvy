# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

from __future__ import annotations

import frappe
from frappe import _

from zivvy_brand.billing.polar_client import (
	PolarAPIError,
	PolarNotConfigured,
	create_checkout_session,
	create_customer_portal_session,
	get_polar_config,
)
from zivvy_brand.billing.subscription import get_subscription_state
from zivvy_brand.constants import POLAR_WEBHOOK_URL, PRODUCTION_ORIGIN
from zivvy_brand.gating.seats import count_billable_users, get_seat_allowance
from zivvy_brand.gating.tiers import (
	TIER_BUSINESS,
	TIER_PRO,
	TIER_LABELS,
	feature_matrix,
	normalize_tier,
)


def _require_login():
	if frappe.session.user == "Guest":
		frappe.throw(_("Login required"), frappe.AuthenticationError)


def _require_desk_user():
	"""Any Desk (System User) may view billing / start checkout — Free plan included."""
	_require_login()
	if frappe.session.user == "Administrator":
		return
	user_type = frappe.db.get_value("User", frappe.session.user, "user_type")
	if user_type != "System User":
		frappe.throw(_("Desk access required for Billing."), frappe.PermissionError)


def _require_billing_manager(*, allow_demo: bool = False):
	"""Polar admin / ops — System Manager only (setup products, etc.)."""
	_require_login()
	roles = set(frappe.get_roles())
	if allow_demo:
		from zivvy_brand.gating.effective import is_demo_account

		if is_demo_account():
			return
	if not roles.intersection({"System Manager", "Administrator"}):
		frappe.throw(_("Only System Managers can manage billing."), frappe.PermissionError)


def _tenant_billing_overlay(*, include_polar_ids: bool = False) -> dict:
	"""Plan/seats from the current user's Zivvy Tenant.

	Polar IDs are only included when include_polar_ids=True (admin views).
	"""
	from zivvy_brand.tenancy.context import get_current_tenant, get_user_tenant_name, tenant_public_view

	tenant_name = get_user_tenant_name()
	tenant = None
	if tenant_name:
		try:
			tenant = frappe.get_cached_doc("Zivvy Tenant", tenant_name)
		except Exception:
			tenant = get_current_tenant()
	info = tenant_public_view(tenant) or {}
	if not info:
		return {"tenant": None, "tenant_id": None}
	result = {
		"tenant": info,
		"tenant_id": info.get("name"),
		"status": info.get("subscription_status") or None,
		"current_period_end": None,
		"cancel_at_period_end": None,
	}
	if include_polar_ids:
		from zivvy_brand.tenancy.context import tenant_as_dict
		full = tenant_as_dict(tenant) or {}
		result["polar_subscription_id"] = full.get("polar_subscription_id")
		result["polar_customer_id"] = full.get("polar_customer_id")
	return result


def _portal_checkout_required_payload() -> dict:
	return {
		"ok": False,
		"requires_checkout": True,
		"message": _(
			"No billing profile exists yet for this workspace. Start a Pro or Business checkout once, "
			"then return here to manage billing details."
		),
	}


def _is_missing_portal_customer_error(err: Exception) -> bool:
	code = getattr(err, "status_code", None)
	if code in (404, 422):
		return True
	text = (str(err) or "").lower()
	return ("customer" in text and "not found" in text) or "complete a checkout first" in text


@frappe.whitelist()
def get_my_plan():
	"""Customer-facing plan status for the logged-in user's tenant (no Polar secrets)."""
	_require_login()
	from zivvy_brand.gating.effective import get_effective_tier, get_user_demo_plan
	from zivvy_brand.gating.seats import count_billable_users, get_seat_allowance

	state = get_subscription_state()
	tier = get_effective_tier()
	demo = get_user_demo_plan()
	from zivvy_brand.auth.datacenter import DATACENTER_LABELS, get_user_datacenter
	from zivvy_brand.tenancy.context import get_user_tenant_name

	datacenter = get_user_datacenter()
	overlay = _tenant_billing_overlay()
	tenant_name = get_user_tenant_name()
	period_end = state.get("current_period_end")
	cancel = state.get("cancel_at_period_end")
	status = overlay.get("status") or state.get("status")
	if tenant_name and frappe.db.exists("Zivvy Tenant", tenant_name):
		row = frappe.db.get_value(
			"Zivvy Tenant",
			tenant_name,
			["current_period_end", "cancel_at_period_end", "subscription_status"],
			as_dict=True,
		)
		if row:
			period_end = row.get("current_period_end") or period_end
			cancel = row.get("cancel_at_period_end") if row.get("cancel_at_period_end") is not None else cancel
			status = row.get("subscription_status") or status

	return {
		"tier": tier,
		"tier_label": TIER_LABELS.get(tier, tier.title()),
		"demo_plan": demo,
		"site_tier": normalize_tier(state.get("tier")),
		"status": status,
		"seats_used": count_billable_users(),
		"seats_allowed": get_seat_allowance(),
		"current_period_end": period_end,
		"cancel_at_period_end": cancel,
		"pricing": feature_matrix(),
		"billing_route": "/app/billing",
		"pricing_route": "/pricing",
		"datacenter": datacenter,
		"datacenter_label": DATACENTER_LABELS.get(datacenter or "", datacenter or ""),
		"tenant": overlay.get("tenant"),
		"tenant_id": overlay.get("tenant_id"),
		"tenancy_mode": "company_per_tenant",
	}


@frappe.whitelist()
def get_billing_status():
	"""Current tenant plan, seats, Polar configuration readiness (no secrets)."""
	_require_desk_user()
	state = get_subscription_state()
	cfg = get_polar_config()
	tier = normalize_tier(state.get("tier"))
	from zivvy_brand.gating.effective import get_effective_tier, get_user_demo_plan

	effective = get_effective_tier()
	from zivvy_brand.auth.datacenter import DATACENTER_LABELS, get_user_datacenter
	from zivvy_brand.tenancy.context import get_user_tenant_name

	datacenter = get_user_datacenter()
	roles = set(frappe.get_roles())
	is_admin = bool(roles.intersection({"System Manager", "Administrator"}))
	overlay = _tenant_billing_overlay(include_polar_ids=is_admin)
	tenant_name = get_user_tenant_name()
	polar_sub = state.get("polar_subscription_id")
	polar_cust = state.get("polar_customer_id")
	product_id = state.get("product_id")
	period_end = state.get("current_period_end")
	cancel = state.get("cancel_at_period_end")
	last_synced = state.get("last_synced_at")
	status = overlay.get("status") or state.get("status")
	if tenant_name and frappe.db.exists("Zivvy Tenant", tenant_name):
		row = frappe.db.get_value(
			"Zivvy Tenant",
			tenant_name,
			[
				"polar_subscription_id",
				"polar_customer_id",
				"product_id",
				"current_period_end",
				"cancel_at_period_end",
				"last_synced_at",
				"subscription_status",
			],
			as_dict=True,
		)
		if row:
			polar_sub = row.get("polar_subscription_id") or polar_sub
			polar_cust = row.get("polar_customer_id") or polar_cust
			product_id = row.get("product_id") or product_id
			period_end = row.get("current_period_end") or period_end
			cancel = (
				row.get("cancel_at_period_end")
				if row.get("cancel_at_period_end") is not None
				else cancel
			)
			last_synced = row.get("last_synced_at") or last_synced
			status = row.get("subscription_status") or status

	payload = {
		"tier": effective,
		"tier_label": TIER_LABELS.get(effective, effective.title()),
		"demo_plan": get_user_demo_plan(),
		"site_tier": tier,
		"status": status,
		"seats_used": count_billable_users(),
		"seats_allowed": get_seat_allowance(),
		"polar_subscription_id": polar_sub,
		"polar_customer_id": polar_cust,
		"product_id": product_id,
		"current_period_end": period_end,
		"cancel_at_period_end": cancel,
		"last_synced_at": last_synced,
		"tenant": overlay.get("tenant"),
		"tenant_id": overlay.get("tenant_id") or tenant_name,
		"tenancy_mode": "company_per_tenant",
		"datacenter": datacenter,
		"datacenter_label": DATACENTER_LABELS.get(datacenter or "", datacenter or ""),
		"can_manage_polar": is_admin,
		"polar": {
			"configured": cfg["configured"],
			"use_sandbox": cfg["use_sandbox"],
			"has_pro_product": bool(cfg.get("pro_product_id")),
			"has_business_product": bool(cfg.get("business_product_id")),
			"has_pro_annual_product": bool(cfg.get("pro_annual_product_id")),
			"has_business_annual_product": bool(cfg.get("business_annual_product_id")),
			"has_webhook_secret": bool(cfg.get("webhook_secret")),
			"organization_id": cfg.get("organization_id") or "",
			"organization_slug": cfg.get("organization_slug") or "",
			"success_url": cfg.get("success_url") or "",
			"cancel_url": cfg.get("cancel_url") or "",
			# Prefer production absolute URL for dashboard copy-paste; fall back to site URL
			"webhook_url": POLAR_WEBHOOK_URL,
			"webhook_url_site": frappe.utils.get_url(
				"/api/method/zivvy_brand.billing.webhooks.polar_webhook"
			),
			"production_origin": PRODUCTION_ORIGIN,
		},
		"pricing": feature_matrix(),
		"pricing_currency": "USD",
		"pricing_currency_note": _(
			"Displayed pricing is USD reference. Final taxes and presentment currency appear in Polar checkout."
		),
		"portal_ready": bool(cfg["configured"]),
	}
	# Hide Polar ops details from non-admin Desk users
	if not is_admin:
		payload["polar"] = {
			"configured": cfg["configured"],
			"use_sandbox": cfg["use_sandbox"],
			"has_pro_product": bool(cfg.get("pro_product_id")),
			"has_business_product": bool(cfg.get("business_product_id")),
			"has_pro_annual_product": bool(cfg.get("pro_annual_product_id")),
			"has_business_annual_product": bool(cfg.get("business_annual_product_id")),
			"has_webhook_secret": False,
			"organization_id": "",
			"organization_slug": "",
			"success_url": "",
			"cancel_url": "",
			"webhook_url": "",
			"webhook_url_site": "",
			"production_origin": PRODUCTION_ORIGIN,
		}
		for key in ("polar_subscription_id", "polar_customer_id", "product_id"):
			payload.pop(key, None)
	return payload


@frappe.whitelist()
def setup_polar_products(force: int | bool = 0):
	"""Desk / API entrypoint — see zivvy_brand.billing.setup_polar.setup_polar_products."""
	_require_billing_manager()
	from zivvy_brand.billing.setup_polar import setup_polar_products as _setup

	return _setup(force=force)


def _resolve_partner_discount_id(*, plan: str, billing_period: str, discount_code: str | None) -> str | None:
	"""Map partner promo strings to Polar discount IDs.

	Polar requires unique discount codes org-wide, so ActimiXYZ can only live on the
	monthly fixed discount. Annual 10% uses the same string via this checkout mapping.

	ActimiTrial is a real Polar promo code (100% once on Business monthly) — do not map
	here; customers enter it on the Polar checkout promo field.
	"""
	from zivvy_brand.constants import (
		ACTIMI_BUSINESS_ANNUAL_DISCOUNT_ID,
		ACTIMI_BUSINESS_MONTHLY_DISCOUNT_ID,
		ACTIMI_COUPON_CODE,
	)

	code = (discount_code or "").strip()
	if not code:
		return None
	if code.casefold() != ACTIMI_COUPON_CODE.casefold():
		# Unknown codes (ActimiTrial, ZIVVY100*, etc.): leave for Polar checkout promo field.
		return None
	if plan != TIER_BUSINESS:
		frappe.throw(_("Coupon {0} applies to Business only.").format(ACTIMI_COUPON_CODE))
	if billing_period == "annual":
		return ACTIMI_BUSINESS_ANNUAL_DISCOUNT_ID
	return ACTIMI_BUSINESS_MONTHLY_DISCOUNT_ID


@frappe.whitelist()
def create_checkout(
	plan: str,
	seats: int | None = None,
	billing: str | None = None,
	discount_code: str | None = None,
):
	"""Start Polar checkout for Pro or Business (seat qty = billable users by default).

	`billing` is ``monthly`` (default) or ``annual`` (20% off yearly seat products).
	Optional `discount_code` (e.g. ActimiXYZ) pre-applies the matching Polar discount.
	Polar-native codes such as ActimiTrial are entered on the Polar checkout promo field.
	"""
	_require_desk_user()
	plan = normalize_tier(plan)
	if plan not in (TIER_PRO, TIER_BUSINESS):
		frappe.throw(_("Checkout is only available for Pro or Business."))

	billing_period = (billing or "monthly").strip().lower()
	if billing_period not in ("monthly", "annual"):
		frappe.throw(_("Billing period must be monthly or annual."))

	cfg = get_polar_config()
	if billing_period == "annual":
		product_id = (
			cfg.get("pro_annual_product_id") if plan == TIER_PRO else cfg.get("business_annual_product_id")
		)
		env_hint = f"POLAR_{plan.upper()}_ANNUAL_PRODUCT_ID"
	else:
		product_id = cfg["pro_product_id"] if plan == TIER_PRO else cfg["business_product_id"]
		env_hint = f"POLAR_{plan.upper()}_PRODUCT_ID"
	product_id = (product_id or "").strip()
	if not product_id:
		frappe.throw(
			_("Set the {0} {1} product ID in Polar Settings (or {2}).").format(
				plan.title(), billing_period, env_hint
			)
		)

	qty = int(seats) if seats else max(count_billable_users(), 1)
	email = frappe.db.get_value("User", frappe.session.user, "email")
	site_key = frappe.local.site
	from zivvy_brand.tenancy.context import get_user_tenant_name

	tenant_id = get_user_tenant_name() or ""
	# Prefer tenant id as Polar external customer key (multi-tenant SaaS)
	external_id = tenant_id or site_key
	resolved_discount_id = _resolve_partner_discount_id(
		plan=plan, billing_period=billing_period, discount_code=discount_code
	)

	try:
		session = create_checkout_session(
			product_id=product_id,
			seats=qty,
			customer_email=email,
			external_customer_id=external_id,
			discount_id=resolved_discount_id,
			metadata={
				"zivvy_site": site_key,
				"zivvy_tenant": tenant_id,
				"zivvy_plan": plan,
				"zivvy_billing": billing_period,
				"zivvy_seats": str(qty),
				"requested_by": frappe.session.user,
				**({"zivvy_discount_code": (discount_code or "").strip()} if (discount_code or "").strip() else {}),
			},
		)
	except PolarNotConfigured as e:
		frappe.throw(str(e), title=_("Polar not configured"))
	except PolarAPIError as e:
		frappe.throw(str(e), title=_("Polar checkout failed"))

	url = session.get("url")
	if not url:
		frappe.throw(_("Polar did not return a checkout URL. Check product seat pricing."))

	return {
		"checkout_id": session.get("id"),
		"url": url,
		"seats": qty,
		"plan": plan,
		"billing": billing_period,
		"discount_applied": bool(resolved_discount_id),
	}


@frappe.whitelist()
def create_portal_session():
	"""Open Polar customer portal for this tenant's subscription."""
	_require_desk_user()
	state = get_subscription_state()
	from zivvy_brand.tenancy.context import get_user_tenant_name

	tenant_id = get_user_tenant_name()
	customer_id = state.get("polar_customer_id")
	if tenant_id and frappe.db.exists("Zivvy Tenant", tenant_id):
		customer_id = (
			frappe.db.get_value("Zivvy Tenant", tenant_id, "polar_customer_id") or customer_id
		)
	external_id = tenant_id or frappe.local.site

	attempts: list[tuple[str, str]] = []
	if customer_id:
		attempts.append(("customer_id", customer_id))
	if external_id and external_id != customer_id:
		attempts.append(("external_customer_id", external_id))
	if not attempts:
		return _portal_checkout_required_payload()

	last_error: Exception | None = None
	for mode, value in attempts:
		try:
			if mode == "customer_id":
				session = create_customer_portal_session(customer_id=value)
			else:
				session = create_customer_portal_session(external_customer_id=value)
			url = session.get("customer_portal_url") or session.get("url")
			if url:
				resolved_customer = session.get("customer_id") or (
					(session.get("customer") or {}).get("id")
					if isinstance(session.get("customer"), dict)
					else None
				)
				if (
					resolved_customer
					and tenant_id
					and frappe.db.exists("Zivvy Tenant", tenant_id)
					and not frappe.db.get_value("Zivvy Tenant", tenant_id, "polar_customer_id")
				):
					frappe.db.set_value(
						"Zivvy Tenant",
						tenant_id,
						"polar_customer_id",
						resolved_customer,
						update_modified=False,
					)
				return {"ok": True, "url": url}
			last_error = PolarAPIError(_("Polar did not return a customer portal URL."))
		except PolarNotConfigured as e:
			frappe.throw(str(e), title=_("Polar not configured"))
		except PolarAPIError as e:
			last_error = e
			if _is_missing_portal_customer_error(e):
				continue
			break

	if last_error and _is_missing_portal_customer_error(last_error):
		return _portal_checkout_required_payload()

	if last_error:
		frappe.throw(
			_(
				"Billing portal is temporarily unavailable. Please retry in a minute, or contact support if this persists."
			),
			title=_("Portal temporarily unavailable"),
		)

	frappe.throw(_("Could not open billing portal right now."), title=_("Portal unavailable"))


@frappe.whitelist()
def sync_my_roles():
	"""Re-apply admin roles for the current user.

	Called by the frontend after checkout completes so roles are up-to-date
	even if the Polar webhook hasn't fired yet. Works for the workspace
	owner and any user with the Tenant Admin role. Idempotent; safe to
	call repeatedly (only adds roles, never removes).
	"""
	_require_login()
	from zivvy_brand.tenancy.context import TENANT_ADMIN_ROLE, get_user_tenant_name

	tenant_name = get_user_tenant_name()
	if not tenant_name or not frappe.db.exists("Zivvy Tenant", tenant_name):
		return {"ok": False, "error": "no_tenant"}
	owner = frappe.db.get_value("Zivvy Tenant", tenant_name, "owner_user")
	is_admin = owner == frappe.session.user or TENANT_ADMIN_ROLE in set(frappe.get_roles())
	if not is_admin:
		return {"ok": False, "error": "not_admin"}
	from zivvy_brand.auth.roles import apply_tenant_admin_roles

	result = apply_tenant_admin_roles(frappe.session.user)
	return {**result, "synced": True}


@frappe.whitelist(allow_guest=True)
def get_public_pricing():
	"""Unauthenticated pricing matrix for /pricing page and public clients."""
	return feature_matrix()
