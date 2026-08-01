# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""Soft-land Frappe Not Permitted UX for logged-in Desk users.

Stock ``NotPermittedPage`` always shows a Login button — even when
``frappe.session.user != Guest`` (e.g. Website User hitting ``/app``).
That matches the contradictory "avatar logged in + Login" screenshot.

Also auto-promotes residual Website Users to Free-tier Desk on ``/app`` hits.
"""

from __future__ import annotations

from urllib.parse import quote_plus

import frappe
from frappe import _

from zivvy_brand.auth.roles import DEFAULT_DESK_REDIRECT, ensure_saas_user_desk_access

_PATCHED = False


def _downgrade_invalid_session_user(user: str | None) -> str:
	"""Normalize missing/disabled session users to Guest to avoid 500 loops."""
	if not user or user in ("Guest",):
		return "Guest"
	if user == "Administrator":
		return user

	try:
		enabled = frappe.db.get_value("User", user, "enabled")
	except Exception:
		enabled = None

	if enabled:
		return user

	# A stale sid can reference a removed/disabled user. Render as Guest instead
	# of crashing inside website boot context.
	try:
		frappe.set_user("Guest")
	except Exception:
		pass
	try:
		if getattr(frappe.local, "session", None):
			frappe.local.session.user = "Guest"
	except Exception:
		pass
	return "Guest"


def _is_desk_user(user: str | None = None) -> bool:
	user = user or frappe.session.user
	if not user or user in ("Guest",):
		return False
	if user == "Administrator":
		return True
	return frappe.db.get_value("User", user, "user_type") == "System User"


def soft_land_not_permitted_render(self):
	"""Replacement for ``NotPermittedPage.render``."""
	from frappe.website.page_renderers.template_page import TemplatePage

	path = (frappe.request.path if frappe.request else "") or "/"
	user = _downgrade_invalid_session_user(frappe.session.user)

	def _finish(*, action: str, label: str, color: str = "red", message: str | None = None):
		frappe.local.message_title = _("Not Permitted")
		if message:
			frappe.local.message = message
		frappe.local.response["context"] = dict(
			indicator_color=color,
			primary_action=action,
			primary_label=label,
			fullpage=True,
		)
		self.set_standard_path("message")
		return TemplatePage.render(self)

	# Guest → stock Login CTA
	if not user or user == "Guest":
		action = f"/login?redirect-to={quote_plus(path)}"
		if path.startswith("/app/") or path == "/app":
			action = "/login"
		return _finish(action=action, label=_("Login"), color="red")

	# Logged-in Desk user → never offer Login; go Desk
	if _is_desk_user(user):
		# Avoid tight loops on /app itself: show CTA instead of redirect
		if path.startswith("/app"):
			return _finish(
				action=DEFAULT_DESK_REDIRECT,
				label=_("Go to Desk"),
				color="orange",
				message=_("You do not have access to this page. Open Desk home instead."),
			)
		frappe.local.flags.redirect_location = DEFAULT_DESK_REDIRECT
		raise frappe.Redirect

	# Logged-in Website User → Go to Desk (before_request may promote on /app)
	return _finish(
		action=DEFAULT_DESK_REDIRECT,
		label=_("Go to Desk"),
		color="orange",
		message=_("This page needs Desk access. Open Desk to continue."),
	)

def patch_not_permitted_page() -> None:
	"""Idempotent monkeypatch of Frappe's NotPermittedPage.render."""
	global _PATCHED
	if _PATCHED:
		return
	try:
		from frappe.website.page_renderers.not_permitted_page import NotPermittedPage
	except ImportError:
		return
	NotPermittedPage.render = soft_land_not_permitted_render  # type: ignore[method-assign]
	_PATCHED = True


def before_request() -> None:
	"""Promote residual Website Users when they open Desk; patch Not Permitted."""
	patch_not_permitted_page()

	if not frappe.request:
		return
	path = frappe.request.path or ""
	user = frappe.session.user
	if not path.startswith("/app") or not user or user == "Guest":
		return

	user_type = frappe.db.get_value("User", user, "user_type")
	if user_type == "Website User":
		# SaaS self-serve: unlock Free Desk so /app stops throwing Not Permitted
		try:
			ensure_saas_user_desk_access(user)
		except Exception:
			frappe.log_error(title="zivvy_brand auto-promote Desk failed")
