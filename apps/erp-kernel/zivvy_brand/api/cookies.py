# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""Force Secure + HttpOnly on session/identity cookies.

Frappe sets identity cookies (``user_id``, ``full_name``, ``system_user``,
``user_image``) as JS-readable so the Desk SPA can show the avatar dropdown
without an extra API call.  Zivvy's customer-facing UI is a separate Next.js
app that never reads these cookies via ``document.cookie``; making them
HttpOnly removes a class of XSS data-exfiltration vectors at no functional
cost.

The ``sid`` (session) cookie is already HttpOnly in Frappe v15+.
"""

from __future__ import annotations

import re

import frappe

_patched = False

# Frappe identity cookies that should be HttpOnly when the frontend is
# external (Next.js).  ``sid`` is already HttpOnly upstream.
_HTTPONLY_COOKIE_NAMES = frozenset({
	"user_id",
	"full_name",
	"system_user",
	"user_image",
})


def _force_secure() -> bool:
	host = str(frappe.conf.get("host_name") or "")
	return bool(frappe.conf.get("cookie_secure")) or host.lower().startswith("https://")


def _force_httponly() -> bool:
	"""Return True when identity cookies should be forced HttpOnly.

	Controlled by ``cookie_httponly`` in site_config.json (default: True).
	Set ``"cookie_httponly": 0`` only for local dev where you need JS access.
	"""
	val = frappe.conf.get("cookie_httponly")
	if val is None:
		return True  # secure by default
	return bool(val)


# ---------------------------------------------------------------------------
# Set-Cookie header rewriters
# ---------------------------------------------------------------------------

def _rewrite_set_cookie_secure(response) -> None:
	"""Append Secure to every Set-Cookie header that lacks it."""
	if response is None or not _force_secure():
		return
	_rewrite_set_cookie_headers(response, _add_secure_flag)


def _rewrite_set_cookie_httponly(response) -> None:
	"""Append HttpOnly to identity-cookie Set-Cookie headers that lack it."""
	if response is None or not _force_httponly():
		return
	_rewrite_set_cookie_headers(response, _add_httponly_flag)


def _rewrite_set_cookie_headers(response, rewriter) -> None:
	"""Generic helper: read all Set-Cookie headers, apply *rewriter*, write back."""
	headers = response.headers
	try:
		values = list(headers.getlist("Set-Cookie") or [])
	except Exception:
		single = headers.get("Set-Cookie")
		values = [single] if single else []
	if not values:
		return

	updated = []
	changed = False
	for value in values:
		if not value:
			continue
		new_value = rewriter(value)
		if new_value != value:
			changed = True
		updated.append(new_value)
	if not changed:
		return

	try:
		while headers.get("Set-Cookie"):
			del headers["Set-Cookie"]
	except Exception:
		try:
			del headers["Set-Cookie"]
		except Exception:
			pass
	for value in updated:
		try:
			headers.add("Set-Cookie", value)
		except Exception:
			headers["Set-Cookie"] = value


# Cookie name is always the first token before "=".
_COOKIE_NAME_RE = re.compile(r"^([^=]+)=")


def _add_secure_flag(header_value: str) -> str:
	if "secure" in header_value.lower():
		return header_value
	return f"{header_value}; Secure"


def _add_httponly_flag(header_value: str) -> str:
	"""Add HttpOnly to identity cookies that lack it."""
	if "httponly" in header_value.lower():
		return header_value
	m = _COOKIE_NAME_RE.match(header_value)
	if not m:
		return header_value
	name = m.group(1).strip()
	if name not in _HTTPONLY_COOKIE_NAMES:
		return header_value
	return f"{header_value}; HttpOnly"


# ---------------------------------------------------------------------------
# Monkey-patch entry point (before_request, runs once per worker)
# ---------------------------------------------------------------------------

def ensure_secure_cookie_patch():
	"""before_request: patch CookieManager + process_response once per process.

	Railway terminates TLS in front of gunicorn, so ``request.scheme`` is often
	``http`` and Frappe omits Secure. ``after_request`` hooks run *before*
	``flush_cookies``, so we also wrap ``process_response`` to rewrite headers
	after cookies are written.

	Identity cookies (``user_id``, ``full_name``, ``system_user``,
	``user_image``) are forced HttpOnly so they cannot be read by
	``document.cookie`` in an XSS scenario.
	"""
	global _patched
	if _patched:
		return
	_patched = True

	from frappe.auth import CookieManager
	import frappe.app as frappe_app

	_orig_set = CookieManager.set_cookie
	_orig_flush = CookieManager.flush_cookies
	_orig_process = frappe_app.process_response

	def set_cookie(
		self,
		key,
		value,
		expires=None,
		secure=False,
		httponly=False,
		samesite="Lax",
		max_age=None,
		*args,
		**kwargs,
	):
		if _force_secure():
			secure = True
		# Force HttpOnly on identity cookies at set-time (belt).
		if _force_httponly() and key in _HTTPONLY_COOKIE_NAMES:
			httponly = True
		# Prefer explicit kwargs so older/newer Frappe signatures both work.
		call_kwargs = {
			"expires": expires,
			"secure": secure,
			"httponly": httponly,
			"samesite": samesite,
			"max_age": max_age,
			**kwargs,
		}
		try:
			return _orig_set(self, key, value, *args, **call_kwargs)
		except TypeError:
			# Older Frappe without deduplicate / samesite / max_age
			call_kwargs.pop("deduplicate", None)
			try:
				return _orig_set(self, key, value, **call_kwargs)
			except TypeError:
				return _orig_set(
					self,
					key,
					value,
					expires=expires,
					secure=secure,
					httponly=httponly,
					samesite=samesite,
					max_age=max_age,
				)

	def flush_cookies(self, response):
		if _force_secure():
			for opts in getattr(self, "cookies", {}).values():
				if isinstance(opts, dict):
					opts["secure"] = True
		# Force HttpOnly on identity cookies at flush-time (suspenders).
		if _force_httponly():
			for key, opts in getattr(self, "cookies", {}).items():
				if isinstance(opts, dict) and key in _HTTPONLY_COOKIE_NAMES:
					opts["httponly"] = True
		result = _orig_flush(self, response=response)
		_rewrite_set_cookie_secure(response)
		_rewrite_set_cookie_httponly(response)
		return result

	def process_response(response):
		_orig_process(response)
		_rewrite_set_cookie_secure(response)
		_rewrite_set_cookie_httponly(response)

	CookieManager.set_cookie = set_cookie  # type: ignore[method-assign]
	CookieManager.flush_cookies = flush_cookies  # type: ignore[method-assign]
	frappe_app.process_response = process_response
