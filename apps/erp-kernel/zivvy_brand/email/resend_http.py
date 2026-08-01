# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""Resend HTTP API outbound mail — Railway blocks SMTP :465/:587."""

from __future__ import annotations

import json
import urllib.error
import urllib.request
from email import policy
from email.parser import BytesParser
from typing import Any

import frappe
from frappe import _

from zivvy_brand.constants import FALLBACK_RESEND_FROM_EMAIL
from zivvy_brand.email.resend import get_resend_config, parse_from_email

RESEND_API_URL = "https://api.resend.com/emails"
# Fail fast so login/signup UI never spins on SMTP's 120s timeout
HTTP_TIMEOUT_SEC = 8


def override_email_send(queue_doc, sender: str, recipient: str, message: bytes | str) -> None:
	"""Frappe hook: send via Resend HTTPS instead of SMTP.

	Wired as ``override_email_send`` in hooks.py. ``EmailQueue.send`` still builds
	the MIME message, but never opens an SMTP session when this hook is present.
	"""
	cfg = get_resend_config()
	if not cfg["configured"]:
		frappe.throw(
			_("Email is not configured (missing RESEND_API_KEY)."),
			exc=frappe.OutgoingEmailError,
		)

	raw = message if isinstance(message, (bytes, bytearray)) else str(message or "").encode("utf-8")
	parsed = BytesParser(policy=policy.default).parsebytes(raw)

	subject = str(parsed.get("Subject") or queue_doc.subject or PRODUCT_SAFE_SUBJECT)
	html = parsed.get_body(preferencelist=("html",))
	text = parsed.get_body(preferencelist=("plain",))
	html_body = html.get_content() if html is not None else None
	text_body = text.get_content() if text is not None else None
	if not html_body and not text_body:
		# Fallback: whole payload as text
		text_body = raw.decode("utf-8", errors="replace")

	from_candidates = _from_candidates(cfg["from_email"], sender)
	last_err: Exception | None = None
	for from_header in from_candidates:
		payload: dict[str, Any] = {
			"from": from_header,
			"to": [recipient],
			"subject": subject,
		}
		if html_body:
			payload["html"] = html_body
		if text_body:
			payload["text"] = text_body
		try:
			_post_resend(cfg["api_key"], payload)
			return
		except frappe.OutgoingEmailError as e:
			last_err = e
			continue
	if last_err:
		raise last_err
	frappe.throw(_("Could not send email via Resend."), exc=frappe.OutgoingEmailError)


def _from_candidates(configured_from: str, sender: str | None) -> list[str]:
	"""Ordered From headers: configured → queue sender → Vestcodes fallback → Resend onboarding."""
	seen: set[str] = set()
	out: list[str] = []

	def add(raw: str | None):
		if not raw or "@" not in raw:
			return
		raw = str(raw).strip()
		key = raw.lower()
		if key in seen:
			return
		seen.add(key)
		if "<" not in raw:
			name, email = parse_from_email(raw)
			raw = f"{name} <{email}>"
		out.append(raw)

	add(configured_from)
	add(sender)
	add(FALLBACK_RESEND_FROM_EMAIL)
	add("Zivvy <onboarding@resend.dev>")
	return out


@frappe.whitelist(allow_guest=True)
def send_login_link(email: str):
	"""Guest login-link — same contract as frappe.www.login.send_login_link.

	Uses normal frappe.sendmail → Email Queue → override_email_send (HTTPS).
	Surfaces a clear error within HTTP_TIMEOUT_SEC instead of spinning forever.
	"""
	from frappe.rate_limiter import rate_limit
	from frappe.www.login import get_login_with_email_link_ratelimit

	@rate_limit(limit=get_login_with_email_link_ratelimit, seconds=60 * 60)
	def _guarded(email: str):
		_send_login_link_impl(email)

	return _guarded(email)


def _send_login_link_impl(email: str):
	if not frappe.get_system_settings("login_with_email_link"):
		return

	from frappe.www.login import _generate_temporary_login_link

	try:
		expiry = frappe.get_system_settings("login_with_email_link_expiry") or 10
		link = _generate_temporary_login_link(email, expiry)
		app_name = (
			frappe.get_website_settings("app_name")
			or frappe.get_system_settings("app_name")
			or _("Zivvy")
		)
		subject = _("Login To {0}").format(app_name)
		frappe.sendmail(
			subject=subject,
			recipients=email,
			template="login_with_email_link",
			args={"link": link, "minutes": expiry, "app_name": app_name},
			now=True,
		)
	except frappe.DoesNotExistError:
		frappe.clear_messages()
	except frappe.OutgoingEmailError:
		frappe.clear_messages()
		frappe.log_error(title="Login link email could not be sent", message=frappe.get_traceback())
		frappe.throw(
			_("We could not send the login email right now. Please use Login with password, or try again shortly."),
			title=_("Email unavailable"),
		)
	except Exception:
		frappe.clear_messages()
		frappe.log_error(title="Login link generation failed unexpectedly", message=frappe.get_traceback())
		frappe.throw(
			_("We could not send the login email right now. Please use Login with password."),
			title=_("Email unavailable"),
		)


PRODUCT_SAFE_SUBJECT = "Message from Zivvy"


def _post_resend(api_key: str, payload: dict[str, Any]) -> dict[str, Any]:
	body = json.dumps(payload).encode("utf-8")
	req = urllib.request.Request(
		RESEND_API_URL,
		data=body,
		method="POST",
		headers={
			"Authorization": f"Bearer {api_key}",
			"Content-Type": "application/json",
			"User-Agent": "zivvy-brand/1.0",
		},
	)
	try:
		with urllib.request.urlopen(req, timeout=HTTP_TIMEOUT_SEC) as resp:
			raw = resp.read().decode("utf-8", errors="replace")
			return json.loads(raw) if raw else {}
	except urllib.error.HTTPError as e:
		detail = e.read().decode("utf-8", errors="replace")[:800]
		frappe.log_error(
			title="Resend HTTP send failed",
			message=f"status={e.code}\n{detail}",
		)
		frappe.throw(
			_("Email provider rejected the message (HTTP {0}).").format(e.code),
			exc=frappe.OutgoingEmailError,
		)
	except Exception as e:
		frappe.log_error(title="Resend HTTP send failed", message=frappe.get_traceback())
		frappe.throw(
			_("Could not reach the email provider: {0}").format(str(e)[:200]),
			exc=frappe.OutgoingEmailError,
		)
