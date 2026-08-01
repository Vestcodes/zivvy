# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""Resolve current Zivvy Tenant from session user or Host subdomain."""

from __future__ import annotations

from typing import Any

import frappe

from zivvy_brand.constants import PRODUCTION_HOST
from zivvy_brand.tenancy import TENANT_DOCTYPE, TENANT_FIELD

OPS_ROLES = frozenset({"Administrator", "System Manager"})

TENANT_ADMIN_ROLE = "Zivvy Tenant Admin"


def is_ops_user(user: str | None = None) -> bool:
	"""Global ops — only users who carry an ops role AND are NOT bound to any tenant.

	A tenanted user with System Manager is a tenant admin, not a global operator.
	This prevents tenant admins who were granted System Manager from bypassing
	every pqc and has_permission hook.
	"""
	user = user or frappe.session.user
	if not user or user == "Guest":
		return False
	if user == "Administrator":
		return True
	tenant = get_user_tenant_name(user)
	if tenant:
		return False
	roles = set(frappe.get_roles(user))
	return bool(roles.intersection(OPS_ROLES))


def ensure_tenant_user_field():
	"""Add User.zivvy_tenant Link if missing."""
	if frappe.db.exists("Custom Field", {"dt": "User", "fieldname": TENANT_FIELD}):
		return
	if not frappe.db.exists("DocType", TENANT_DOCTYPE):
		return
	doc = frappe.get_doc(
		{
			"doctype": "Custom Field",
			"dt": "User",
			"fieldname": TENANT_FIELD,
			"label": "Zivvy Tenant",
			"fieldtype": "Link",
			"options": TENANT_DOCTYPE,
			"insert_after": "user_type",
			"description": "Control-plane tenant for this user (company-per-tenant isolation).",
		}
	)
	doc.insert(ignore_permissions=True)
	frappe.clear_cache(doctype="User")


def get_user_tenant_name(user: str | None = None) -> str | None:
	user = user or frappe.session.user
	if not user or user in ("Guest", "Administrator"):
		return None
	if not frappe.db.has_column("User", TENANT_FIELD):
		return None
	return frappe.db.get_value("User", user, TENANT_FIELD) or None


def get_tenant_doc(name: str | None) -> Any | None:
	if not name or not frappe.db.exists("DocType", TENANT_DOCTYPE):
		return None
	if not frappe.db.exists(TENANT_DOCTYPE, name):
		return None
	return frappe.get_cached_doc(TENANT_DOCTYPE, name)


def parse_subdomain_slug(host: str | None = None) -> str | None:
	"""Extract tenant slug from Host header (e.g. acme.zivvy.xyz → acme).

	Works even when wildcard DNS is not live yet — callers fall back to
	session user tenant when no subdomain match.
	"""
	if host is None:
		try:
			host = (frappe.request.host if frappe.request else "") or ""
		except Exception:
			host = ""
	host = (host or "").split(":")[0].strip().lower()
	if not host or host in (PRODUCTION_HOST, f"www.{PRODUCTION_HOST}"):
		return None
	# Railway / preview hosts are not tenant subdomains
	if host.endswith(".railway.app") or host.endswith(".up.railway.app"):
		return None
	suffix = f".{PRODUCTION_HOST}"
	if host.endswith(suffix):
		sub = host[: -len(suffix)]
		if not sub or "." in sub or sub == "www":
			return None
		return sub
	return None


def resolve_tenant_name(
	*,
	user: str | None = None,
	host: str | None = None,
	prefer_subdomain: bool = True,
) -> str | None:
	"""Pick tenant: optional Host slug (if user belongs / Guest), else User link."""
	user = user or (frappe.session.user if hasattr(frappe, "session") else None)
	slug = parse_subdomain_slug(host) if prefer_subdomain else None

	if slug and frappe.db.exists("DocType", TENANT_DOCTYPE):
		by_slug = frappe.db.get_value(TENANT_DOCTYPE, {"slug": slug}, "name")
		if by_slug:
			# Logged-in non-ops must belong to this tenant
			if user and user not in ("Guest",) and not is_ops_user(user):
				linked = get_user_tenant_name(user)
				if linked and linked != by_slug:
					# Session wins over mismatched subdomain
					return linked
			return by_slug

	return get_user_tenant_name(user)


def get_current_tenant(*, user: str | None = None) -> Any | None:
	"""Return Zivvy Tenant doc for request context (cached on frappe.local)."""
	if getattr(frappe.local, "zivvy_tenant", None) is not None:
		cached = frappe.local.zivvy_tenant
		if cached is False:
			return None
		return cached

	name = resolve_tenant_name(user=user)
	doc = get_tenant_doc(name) if name else None
	frappe.local.zivvy_tenant = doc if doc else False
	return doc


def set_request_tenant():
	"""before_request: populate frappe.local.zivvy_tenant from Host / session."""
	try:
		name = resolve_tenant_name()
		doc = get_tenant_doc(name) if name else None
		frappe.local.zivvy_tenant = doc if doc else False
	except Exception:
		frappe.local.zivvy_tenant = False


def tenant_public_view(doc: Any | None) -> dict | None:
	"""Safe subset for bootinfo and non-admin API responses — no Polar IDs, no owner email."""
	if not doc:
		return None
	company = getattr(doc, "company", None)
	default_currency = None
	if company:
		default_currency = frappe.db.get_value("Company", company, "default_currency")

	return {
		"name": doc.name,
		"tenant_name": doc.tenant_name,
		"slug": doc.slug,
		"status": doc.status,
		"plan": doc.plan,
		"seat_limit": doc.seat_limit,
		"seats_used": doc.seats_used,
		"datacenter": doc.datacenter,
		"subscription_status": doc.subscription_status,
		"company": company,
		"default_currency": default_currency,
	}


def tenant_as_dict(doc: Any | None) -> dict | None:
	"""Full tenant dict — only for billing-manager-gated endpoints."""
	if not doc:
		return None
	return {
		"name": doc.name,
		"tenant_name": doc.tenant_name,
		"slug": doc.slug,
		"status": doc.status,
		"plan": doc.plan,
		"seat_limit": doc.seat_limit,
		"seats_used": doc.seats_used,
		"company": doc.company,
		"owner_user": doc.owner_user,
		"datacenter": doc.datacenter,
		"polar_customer_id": doc.polar_customer_id,
		"polar_subscription_id": doc.polar_subscription_id,
		"subscription_status": doc.subscription_status,
	}
