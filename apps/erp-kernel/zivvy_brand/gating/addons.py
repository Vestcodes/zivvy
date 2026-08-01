# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""Per-tenant addon lookup + doctype unlocking.

Every helper caches on ``frappe.local`` so a single request never hits the
database more than once for the same tenant. Cache is cleared on any
``Zivvy Tenant Addon`` write (see the doctype controller).
"""

from __future__ import annotations

import json
from typing import Iterable

import frappe

ADDON_DOCTYPE = "Zivvy Addon"
TENANT_ADDON_DOCTYPE = "Zivvy Tenant Addon"

ACTIVE_STATUSES: tuple[str, ...] = ("active", "trialing")


def _cache_slot(prefix: str, tenant: str) -> str:
	return f"{prefix}::{tenant}"


def _get_local(name: str, default):
	if not hasattr(frappe, "local"):
		return default
	return getattr(frappe.local, name, default)


def _set_local(name: str, value) -> None:
	if not hasattr(frappe, "local"):
		return
	try:
		setattr(frappe.local, name, value)
	except Exception:
		pass


def _addon_doctype_available() -> bool:
	try:
		if not frappe.db.exists("DocType", TENANT_ADDON_DOCTYPE):
			return False
		if not frappe.db.exists("DocType", ADDON_DOCTYPE):
			return False
	except Exception:
		return False
	return True


def get_tenant_addons(tenant: str | None) -> list[str]:
	"""Return list of active addon slugs for ``tenant``.

	``active`` covers both ``active`` and ``trialing`` statuses — anything
	the tenant is currently entitled to. ``cancelled`` / ``past_due`` rows
	are excluded.
	"""
	if not tenant:
		return []
	if not _addon_doctype_available():
		return []

	cache = _get_local("zivvy_tenant_addons", None)
	if cache is None:
		cache = {}
		_set_local("zivvy_tenant_addons", cache)

	slot = _cache_slot("slugs", tenant)
	if slot in cache:
		return list(cache[slot])

	rows: Iterable[dict] = frappe.get_all(
		TENANT_ADDON_DOCTYPE,
		filters={
			"tenant": tenant,
			"status": ("in", list(ACTIVE_STATUSES)),
		},
		fields=["addon"],
		ignore_permissions=True,
	)
	slugs = sorted({(row.get("addon") or "").strip().lower() for row in rows if row.get("addon")})
	cache[slot] = slugs
	return list(slugs)


def is_addon_enabled(tenant: str | None, addon_slug: str | None) -> bool:
	"""True when tenant currently holds an active/trialing row for ``addon_slug``."""
	if not tenant or not addon_slug:
		return False
	slug = str(addon_slug).strip().lower()
	if not slug:
		return False
	return slug in set(get_tenant_addons(tenant))


def get_addon_unlocked_doctypes(tenant: str | None) -> set[str]:
	"""Union of DocType names unlocked by all of ``tenant``'s active addons."""
	if not tenant:
		return set()
	if not _addon_doctype_available():
		return set()

	cache = _get_local("zivvy_tenant_addon_doctypes", None)
	if cache is None:
		cache = {}
		_set_local("zivvy_tenant_addon_doctypes", cache)

	slot = _cache_slot("doctypes", tenant)
	if slot in cache:
		return set(cache[slot])

	slugs = get_tenant_addons(tenant)
	if not slugs:
		cache[slot] = set()
		return set()

	rows: Iterable[dict] = frappe.get_all(
		ADDON_DOCTYPE,
		filters={"slug": ("in", list(slugs)), "enabled": 1},
		fields=["doctypes_unlocked"],
		ignore_permissions=True,
	)
	unlocked: set[str] = set()
	for row in rows:
		unlocked.update(_parse_json_list(row.get("doctypes_unlocked")))
	cache[slot] = unlocked
	return set(unlocked)


def _parse_json_list(raw: str | None) -> list[str]:
	if not raw:
		return []
	raw = raw.strip()
	if not raw:
		return []
	try:
		data = json.loads(raw)
	except Exception:
		return []
	if not isinstance(data, list):
		return []
	return [str(x) for x in data if isinstance(x, str)]
