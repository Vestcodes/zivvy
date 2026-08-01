# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""Prefer Zivvy seeded blog routes over Frappe Blog Post /blog shadowing."""

from __future__ import annotations


def resolve(path: str) -> str:
	"""website_path_resolver hook — must call default resolve_path for non-blog paths."""
	import frappe
	from frappe.website.path_resolver import resolve_path

	from zivvy_brand.blog.posts import get_post

	clean = (path or "").strip("/")
	parts = clean.split("/") if clean else []

	# Exact /blog → our marketing list (not DocType "Blog Post" web view)
	if clean == "blog":
		return "blog"

	# /blog/<slug> → seeded posts (not Frappe /blog/<category>)
	if len(parts) == 2 and parts[0] == "blog":
		slug = parts[1]
		frappe.local.form_dict["slug"] = slug
		frappe.form_dict["slug"] = slug
		frappe.local.no_cache = 1
		# Always hand off to our controller (404 inside get_context if unknown)
		if get_post(slug) or slug:
			return "blog_post"

	return resolve_path(path)
