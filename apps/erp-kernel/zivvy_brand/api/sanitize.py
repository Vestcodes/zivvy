# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""Production response hygiene: strip exception traces from API JSON.

Defense-in-depth: traces are stripped in any environment that looks like
production (Railway, Docker, ``ZIVVY_ENV=production``, etc.) **regardless
of Frappe's ``developer_mode`` flag**, which is a DB-stored setting that
could be accidentally left on after debugging.  Only a genuinely local dev
setup (``developer_mode`` ON *and* no production indicators) keeps traces.
"""

from __future__ import annotations

import json
import os

import frappe

# Fields that can leak internal Python class names or full tracebacks.
_TRACE_FIELDS = ("exc", "exc_type")


def _is_production() -> bool:
	"""Return True when the process is running in a production-like env.

	Checks, in order:
	1. Explicit ``ZIVVY_ENV=production`` (or ``development`` to opt out).
	2. Railway indicator env vars (``RAILWAY_ENVIRONMENT``, ``RAILWAY_SERVICE_NAME``).
	3. Running inside Docker (``/.dockerenv`` exists).

	When any of these signal production, traces are stripped even if
	``developer_mode`` is on.
	"""
	zivvy_env = os.environ.get("ZIVVY_ENV", "").lower()
	if zivvy_env == "production":
		return True
	if zivvy_env == "development":
		return False

	# Railway always sets at least one of these.
	if os.environ.get("RAILWAY_ENVIRONMENT") or os.environ.get("RAILWAY_SERVICE_NAME"):
		return True

	# Docker container marker.
	if os.path.isfile("/.dockerenv"):
		return True

	return False


def _should_strip() -> bool:
	"""Decide whether to strip traces from the current response."""
	# Production indicators override everything.
	if _is_production():
		return True
	# Local dev: honour Frappe's developer_mode.
	if frappe.conf.get("developer_mode"):
		return False
	return True


def after_request(response=None, request=None):
	"""Sanitize error JSON.

	Frappe invokes this as ``frappe.call(..., response=response, request=request)``.
	Note: Secure cookies are handled in ``api.cookies`` (flush runs after this hook).
	"""
	if response is None:
		return response
	try:
		_strip_exc_payload(response)
	except Exception:
		pass
	return response


def _strip_exc_payload(response) -> None:
	if not _should_strip():
		return
	ctype = (response.headers.get("Content-Type") or "").lower()
	if "json" not in ctype:
		return
	raw = response.get_data(as_text=True)
	if not raw:
		return
	# Quick check: skip the JSON parse when no trace fields are present.
	if not any(f'"{field}"' in raw for field in _TRACE_FIELDS):
		return
	try:
		payload = json.loads(raw)
	except Exception:
		return
	if not isinstance(payload, dict):
		return
	changed = False
	for field in _TRACE_FIELDS:
		if field in payload:
			payload.pop(field)
			changed = True
	if not changed:
		return
	body = json.dumps(payload)
	response.set_data(body)
	response.headers["Content-Length"] = str(len(body.encode("utf-8")))
