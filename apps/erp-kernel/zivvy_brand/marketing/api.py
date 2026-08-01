# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

import frappe
from frappe import _


@frappe.whitelist(allow_guest=True)
def send_contact_message(full_name: str | None = None, email: str | None = None, message: str | None = None):
	"""Contact form handler — emails contact@vestcodes.com when mail is configured."""
	full_name = (full_name or "").strip()
	email = (email or "").strip()
	message = (message or "").strip()

	if not full_name or not email or not message:
		frappe.throw(_("Please fill in name, email, and message."))
	if "@" not in email or "." not in email.split("@")[-1]:
		frappe.throw(_("Please enter a valid email address."))
	if len(message) > 5000:
		frappe.throw(_("Message is too long."))

	import html

	safe_message = html.escape(message).replace("\n", "<br>")
	try:
		frappe.sendmail(
			recipients=["contact@vestcodes.com"],
			reply_to=email,
			subject=f"[Zivvy Contact] {full_name}",
			message=f"From: {html.escape(full_name)} &lt;{html.escape(email)}&gt;<br><br>{safe_message}",
			delayed=True,
		)
	except Exception:
		frappe.log_error(frappe.get_traceback(), "Zivvy Contact Form")
		# Still succeed UX-wise — mailto remains available on the page
		frappe.throw(
			_(
				"We could not send email from this site right now. "
				"Please email contact@vestcodes.com directly."
			)
		)

	return {"ok": True}
