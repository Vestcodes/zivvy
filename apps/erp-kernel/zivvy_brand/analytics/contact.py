# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

from __future__ import annotations

import frappe
from frappe.utils import validate_email_address


@frappe.whitelist(allow_guest=True)
def submit_contact(full_name: str | None = None, email: str | None = None, message: str | None = None):
	"""Guest-facing contact form → email to contact@vestcodes.com."""
	full_name = (full_name or "").strip()
	email = (email or "").strip()
	message = (message or "").strip()

	if not full_name or len(full_name) > 140:
		frappe.throw(frappe._("Please enter your name."))
	if not email or not validate_email_address(email):
		frappe.throw(frappe._("Please enter a valid email."))
	if not message or len(message) < 5:
		frappe.throw(frappe._("Please enter a short message."))
	if len(message) > 4000:
		frappe.throw(frappe._("Message is too long."))

	# Simple guest rate limit: one submission per IP per 10 minutes
	ip = getattr(frappe.local, "request_ip", None) or "unknown"
	cache_key = f"zivvy_contact::{ip}"
	if frappe.cache.get_value(cache_key):
		frappe.throw(frappe._("Please wait a few minutes before sending again."))
	frappe.cache.set_value(cache_key, 1, expires_in_sec=600)

	subject = f"Zivvy contact: {full_name}"
	body = f"""New message from the Zivvy contact form

Name: {full_name}
Email: {email}

Message:
{message}
"""
	try:
		frappe.sendmail(
			recipients=["contact@vestcodes.com"],
			reply_to=email,
			subject=subject,
			message=body,
			now=True,
		)
	except Exception:
		frappe.log_error(frappe.get_traceback(), "Zivvy contact form")
		# Still acknowledge — many sites lack outbound mail in dev
		frappe.logger("zivvy_brand").info(f"Contact form stored in error log: {email}")

	return {"ok": True}
