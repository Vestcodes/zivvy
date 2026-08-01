# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""PostHog config for website context + desk bootinfo (no hardcoded secrets)."""

from __future__ import annotations

import os
from typing import Any

import frappe

HOST_US = "https://us.i.posthog.com"
HOST_EU = "https://eu.i.posthog.com"


def get_posthog_config(*, for_desk: bool = False) -> dict[str, Any]:
	cfg = {
		"enabled": False,
		"api_key": "",
		"host": HOST_US,
		"for_desk": False,
	}

	env_key = (os.environ.get("POSTHOG_PROJECT_API_KEY") or "").strip()
	env_host = (os.environ.get("POSTHOG_HOST") or "").strip()
	env_enable = (os.environ.get("POSTHOG_ENABLE") or "").strip().lower() in (
		"1",
		"true",
		"yes",
		"on",
	)
	env_desk = (os.environ.get("POSTHOG_ENABLE_DESK") or "").strip().lower() in (
		"1",
		"true",
		"yes",
		"on",
	)

	doc_enabled = False
	doc_desk = False
	doc_key = ""
	doc_host_choice = "US"
	doc_custom = ""

	if frappe.db.exists("DocType", "Zivvy Settings"):
		try:
			doc = frappe.get_single("Zivvy Settings")
			doc_enabled = bool(doc.enable_posthog)
			doc_desk = bool(doc.enable_posthog_on_desk)
			doc_host_choice = doc.posthog_host or "US"
			doc_custom = (doc.posthog_host_custom or "").strip()
			if doc.posthog_project_api_key:
				try:
					doc_key = doc.get_password("posthog_project_api_key") or ""
				except Exception:
					doc_key = ""
		except Exception:
			pass

	enabled = env_enable or doc_enabled
	api_key = env_key or doc_key
	if env_host:
		host = env_host.rstrip("/")
	elif doc_host_choice == "EU":
		host = HOST_EU
	elif doc_host_choice == "Custom" and doc_custom:
		host = doc_custom.rstrip("/")
	else:
		host = HOST_US

	desk_ok = env_desk or doc_desk
	if for_desk and not desk_ok:
		enabled = False

	cfg.update(
		{
			"enabled": bool(enabled and api_key),
			"api_key": api_key if (enabled and api_key) else "",
			"host": host,
			"for_desk": bool(desk_ok),
		}
	)
	# Never expose full key accidentally in HTML if disabled
	if not cfg["enabled"]:
		cfg["api_key"] = ""
	return cfg


def update_website_context(context: dict):
	"""Inject public PostHog flags into all website pages."""
	ph = get_posthog_config(for_desk=False)
	context["zivvy_posthog"] = {
		"enabled": ph["enabled"],
		"api_key": ph["api_key"],
		"host": ph["host"],
	}


def extend_bootinfo(bootinfo):
	"""Desk: optional PostHog (gated by enable_posthog_on_desk + consent in JS)."""
	ph = get_posthog_config(for_desk=True)
	if not hasattr(bootinfo, "zivvy") or bootinfo.zivvy is None:
		bootinfo.zivvy = {}
	# bootinfo.zivvy may already be a dict from gating.boot
	z = bootinfo.zivvy if isinstance(bootinfo.zivvy, dict) else {}
	z["posthog"] = {
		"enabled": ph["enabled"],
		"api_key": ph["api_key"],
		"host": ph["host"],
	}
	bootinfo.zivvy = z
