"""Website cache helpers for public marketing pages.

Guest traffic gets short CDN/browser caching.
Authenticated traffic stays private/no-store to avoid stale personalized state.
"""

from __future__ import annotations

import frappe


def apply_public_cache(
	context,
	*,
	max_age: int = 300,
	stale_while_revalidate: int = 60,
) -> None:
	"""Apply cache policy with a safe auth split for website pages."""
	user = frappe.session.user if getattr(frappe, "session", None) else "Guest"
	is_guest = user in (None, "Guest")
	if is_guest:
		context.no_cache = 0
		cache_control = (
			f"public, max-age={int(max_age)}, stale-while-revalidate={int(stale_while_revalidate)}"
		)
	else:
		# Avoid stale account/session UX for signed-in users.
		context.no_cache = 1
		cache_control = "private, no-store, max-age=0"

	response = getattr(frappe.local, "response", None)
	if isinstance(response, dict):
		headers = response.get("headers")
		if not isinstance(headers, dict):
			headers = {}
			response["headers"] = headers
		headers["Cache-Control"] = cache_control
