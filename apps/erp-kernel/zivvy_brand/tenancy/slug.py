# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""Slug helpers for Zivvy Tenant (subdomain-safe)."""

from __future__ import annotations

import re

import frappe

_SLUG_RE = re.compile(r"[^a-z0-9]+")
_RESERVED = frozenset(
	{
		"www",
		"app",
		"api",
		"admin",
		"mail",
		"smtp",
		"ftp",
		"static",
		"assets",
		"cdn",
		"status",
		"docs",
		"blog",
		"login",
		"signup",
		"billing",
		"pricing",
		"support",
		"help",
		"zivvy",
		"vestcodes",
		"demo",
		"test",
		"staging",
		"web",
	}
)


def slugify(raw: str | None, *, fallback: str = "tenant") -> str:
	"""Normalize to a DNS-label-ish slug (lowercase alnum + hyphen)."""
	text = (raw or "").strip().lower()
	text = _SLUG_RE.sub("-", text).strip("-")
	if not text:
		text = fallback
	# Max label length; keep room for uniqueness suffix
	text = text[:40].strip("-") or fallback
	if text in _RESERVED or text.isdigit():
		text = f"{text}-co"
	return text


def unique_slug(base: str, *, exclude: str | None = None) -> str:
	"""Return a slug not used by another Zivvy Tenant."""
	candidate = slugify(base)
	if not frappe.db.exists("DocType", "Zivvy Tenant"):
		return candidate
	n = 0
	while True:
		slug = candidate if n == 0 else f"{candidate}-{n}"
		exists = frappe.db.exists("Zivvy Tenant", {"slug": slug})
		if not exists or (exclude and exists == exclude):
			return slug
		n += 1
		if n > 500:
			frappe.throw(frappe._("Could not allocate a unique tenant slug"))


def slug_from_company_or_email(company_name: str | None, email: str | None) -> str:
	"""Prefer company name; else local-part of email."""
	if company_name and company_name.strip():
		return unique_slug(company_name)
	local = (email or "").split("@", 1)[0]
	return unique_slug(local or "tenant")
