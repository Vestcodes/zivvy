"""
Strip api.zivvy.xyz to a pure backend surface.

zivvy.xyz on Vercel is the customer-facing product. api.zivvy.xyz on Railway
is the Frappe backend that the frontend calls. This module enforces that
split by 302-redirecting any request to api.zivvy.xyz that is NOT part of
the backend API/asset surface back to zivvy.xyz{path}.

Wired via `before_request` in zivvy_brand.hooks.

Why werkzeug HTTPException instead of `raise frappe.Redirect`:
Frappe's `Redirect` exception is only handled by the path_resolver / web
view layer, not by the outermost application handler. Raising it from
`before_request` bypasses Frappe's redirect builder and shows the error
page. A werkzeug HTTPException carrying a pre-built Response is short-
circuited correctly by werkzeug at every layer.
"""

import frappe
from werkzeug.exceptions import HTTPException
from werkzeug.utils import redirect as _wz_redirect

API_HOSTS = {"api.zivvy.xyz"}
FRONTEND_ORIGIN = "https://zivvy.xyz"

# api.zivvy.xyz is a PURE BACKEND surface. UI routes (/app, /desk) belong on
# the Vercel frontend at zivvy.xyz. They are NOT allow-listed here — they
# get short-circuited to /apps (the launcher). Admin access to the Frappe
# desk is via SSH + bench, not a public URL.
ALLOWED_PREFIXES = (
	"/api/",
	"/method/",
	"/assets/",
	"/files/",
	"/private/",
	"/socket.io/",
	"/webhook/",
)

# UI-only route stems on the Frappe backend. Any of these, or any subpath
# under them, gets sent to the launcher on the frontend — we don't try to
# preserve the tail because Frappe workspace slugs don't map 1:1 to Zivvy
# app routes.
UI_STEMS = ("/app", "/desk")


def guard_api_only() -> None:
	request = getattr(frappe.local, "request", None)
	if request is None:
		return

	host = (getattr(request, "host", "") or "").split(":")[0].lower()
	if host not in API_HOSTS:
		return

	path = getattr(request, "path", "") or "/"

	# UI stems — collapse to the launcher, ignore query string / tail.
	for stem in UI_STEMS:
		if path == stem or path.startswith(f"{stem}/"):
			raise HTTPException(response=_wz_redirect(f"{FRONTEND_ORIGIN}/apps", code=302))

	# Backend surface — pass through.
	for prefix in ALLOWED_PREFIXES:
		if path.startswith(prefix):
			return

	# Everything else — path-preserving bounce to the frontend so bookmarks survive.
	qs = request.query_string.decode("utf-8") if getattr(request, "query_string", None) else ""
	target = f"{FRONTEND_ORIGIN}{path}"
	if qs:
		target = f"{target}?{qs}"

	# werkzeug HTTPException carrying the redirect Response is caught
	# cleanly by the outermost handler — bypasses Frappe's error page.
	raise HTTPException(response=_wz_redirect(target, code=302))
