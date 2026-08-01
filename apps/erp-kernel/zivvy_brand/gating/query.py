# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""Block list/report queries for DocTypes above the site plan."""

from __future__ import annotations

from zivvy_brand.gating.tiers import DOCTYPE_MIN_TIER, normalize_tier, tier_at_least


def _conditions_for(doctype: str | None, user: str | None) -> str | None:
	import frappe

	if not doctype or doctype not in DOCTYPE_MIN_TIER:
		return None
	if (user or frappe.session.user) == "Administrator":
		return None

	required = DOCTYPE_MIN_TIER[doctype]
	try:
		from zivvy_brand.gating.effective import get_effective_tier

		current = normalize_tier(get_effective_tier(user or frappe.session.user))
	except Exception:
		current = "free"

	if tier_at_least(current, required):
		return None
	return "1=0"


def _scrub(name: str) -> str:
	return "".join(ch if ch.isalnum() else "_" for ch in name).strip("_").lower()


def _build_permission_query_hooks() -> dict[str, str]:
	"""Register one module-level callable per gated DocType (Frappe only passes user)."""
	hooks: dict[str, str] = {}
	for doctype in DOCTYPE_MIN_TIER:
		fn_name = f"pqc_{_scrub(doctype)}"

		def _make(dt: str):
			def _fn(user=None):
				return _conditions_for(dt, user)

			_fn.__name__ = fn_name
			_fn.__qualname__ = fn_name
			_fn.__doc__ = f"Permission query conditions for {dt}"
			return _fn

		globals()[fn_name] = _make(doctype)
		hooks[doctype] = f"zivvy_brand.gating.query.{fn_name}"
	return hooks


permission_query_conditions = _build_permission_query_hooks()
