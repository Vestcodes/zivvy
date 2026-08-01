# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""PostHog public config for website / desk (project API key is frontend-safe)."""

from __future__ import annotations

import os

import frappe
from frappe.utils import cint


REGION_HOSTS = {
	"US": "https://us.i.posthog.com",
	"EU": "https://eu.i.posthog.com",
}


def _settings():
	"""Prefer Zivvy Settings; fall back to Zivvy Analytics Settings if present."""
	for name in ("Zivvy Settings", "Zivvy Analytics Settings"):
		try:
			if frappe.db.exists("DocType", name):
				return frappe.get_cached_doc(name)
		except Exception:
			continue
	return None


def _get(settings, *names, default=None):
	if not settings:
		return default
	for name in names:
		if hasattr(settings, name):
			val = getattr(settings, name)
			if val not in (None, ""):
				return val
	return default


def resolve_host(settings=None) -> str:
	env_host = (os.environ.get("POSTHOG_HOST") or "").strip()
	if env_host:
		return env_host.rstrip("/")

	settings = settings or _settings()
	custom = _get(settings, "posthog_host_custom", "api_host", default="")
	region = (_get(settings, "posthog_host", "host_region", default="US") or "US").strip()

	if region == "Custom" and custom:
		return str(custom).strip().rstrip("/")
	if custom and region not in REGION_HOSTS:
		return str(custom).strip().rstrip("/")
	return REGION_HOSTS.get(region, REGION_HOSTS["US"])


def resolve_api_key(settings=None) -> str:
	env_key = (os.environ.get("POSTHOG_PROJECT_API_KEY") or "").strip()
	if env_key:
		return env_key
	settings = settings or _settings()
	key = _get(settings, "posthog_project_api_key", "project_api_key", default="")
	if not key:
		return ""
	# Password fields may need get_password
	if hasattr(settings, "get_password"):
		try:
			if getattr(settings, "meta", None) and settings.meta.get_field("posthog_project_api_key"):
				field = settings.meta.get_field("posthog_project_api_key")
				if field and field.fieldtype == "Password":
					return settings.get_password("posthog_project_api_key") or ""
		except Exception:
			pass
	return str(key).strip()


def is_enabled(settings=None) -> bool:
	settings = settings or _settings()
	return bool(cint(_get(settings, "enable_posthog", "enabled", default=0)))


def enable_on_desk(settings=None) -> bool:
	settings = settings or _settings()
	return bool(cint(_get(settings, "enable_posthog_on_desk", "enable_on_desk", default=0)))


@frappe.whitelist(allow_guest=True)
def get_public_config():
	"""Return PostHog config safe for the browser (no private secrets)."""
	settings = _settings()
	enabled = is_enabled(settings)
	api_key = resolve_api_key(settings) if enabled else ""
	if not enabled or not api_key:
		return {
			"enabled": False,
			"api_key": "",
			"host": "",
			"enable_on_desk": False,
		}
	return {
		"enabled": True,
		"api_key": api_key,
		"host": resolve_host(settings),
		"enable_on_desk": enable_on_desk(settings),
	}
