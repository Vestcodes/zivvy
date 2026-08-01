# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""Canonical URL, Open Graph, Twitter, robots, and JSON-LD helpers for marketing pages."""

from __future__ import annotations

import json

from zivvy_brand.constants import (
	COMPANY_SITE,
	CONTACT_EMAIL,
	LEGAL_ENTITY,
	PRODUCTION_ORIGIN,
	PRODUCT_NAME,
)

DEFAULT_DESCRIPTION = (
	"Zivvy — modern CRM, operations, and accounting for growing teams in India and beyond. "
	"Start free at zivvy.xyz."
)
OG_IMAGE = f"{PRODUCTION_ORIGIN}/assets/zivvy_brand/images/zivvy-logo.png"


def absolute_url(path: str) -> str:
	path = (path or "").strip() or "/"
	if not path.startswith("/"):
		path = "/" + path
	if path == "/":
		path = "/home"
	return PRODUCTION_ORIGIN.rstrip("/") + path


def organization_ld() -> dict:
	return {
		"@context": "https://schema.org",
		"@type": "Organization",
		"name": PRODUCT_NAME,
		"legalName": LEGAL_ENTITY,
		"url": PRODUCTION_ORIGIN,
		"logo": OG_IMAGE,
		"email": CONTACT_EMAIL,
		"sameAs": [COMPANY_SITE],
		"address": {
			"@type": "PostalAddress",
			"addressCountry": "IN",
		},
	}


def website_ld() -> dict:
	return {
		"@context": "https://schema.org",
		"@type": "WebSite",
		"name": PRODUCT_NAME,
		"url": PRODUCTION_ORIGIN,
		"publisher": {"@type": "Organization", "name": PRODUCT_NAME, "url": PRODUCTION_ORIGIN},
		"potentialAction": {
			"@type": "SearchAction",
			"target": f"{PRODUCTION_ORIGIN}/blog?q={{search_term_string}}",
			"query-input": "required name=search_term_string",
		},
	}


def software_application_ld() -> dict:
	return {
		"@context": "https://schema.org",
		"@type": "SoftwareApplication",
		"name": PRODUCT_NAME,
		"applicationCategory": "BusinessApplication",
		"operatingSystem": "Web",
		"url": PRODUCTION_ORIGIN,
		"image": OG_IMAGE,
		"description": DEFAULT_DESCRIPTION,
		"offers": [
			{
				"@type": "Offer",
				"name": "Free",
				"price": "0",
				"priceCurrency": "USD",
				"url": f"{PRODUCTION_ORIGIN}/pricing",
			},
			{
				"@type": "Offer",
				"name": "Pro",
				"price": "15",
				"priceCurrency": "USD",
				"unitText": "seat / month",
				"url": f"{PRODUCTION_ORIGIN}/pricing",
			},
			{
				"@type": "Offer",
				"name": "Business",
				"price": "25",
				"priceCurrency": "USD",
				"unitText": "seat / month",
				"url": f"{PRODUCTION_ORIGIN}/pricing",
			},
		],
		"provider": {"@type": "Organization", "name": LEGAL_ENTITY, "url": COMPANY_SITE},
	}


def blog_posting_ld(post: dict) -> dict:
	url = absolute_url(f"/blog/{post['slug']}")
	return {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		"headline": post["title"],
		"description": post.get("excerpt") or "",
		"datePublished": post.get("date"),
		"dateModified": post.get("date"),
		"mainEntityOfPage": url,
		"url": url,
		"author": {"@type": "Organization", "name": PRODUCT_NAME, "url": PRODUCTION_ORIGIN},
		"publisher": {
			"@type": "Organization",
			"name": PRODUCT_NAME,
			"logo": {"@type": "ImageObject", "url": OG_IMAGE},
		},
		"image": OG_IMAGE,
	}


def apply_seo(
	context,
	path: str,
	*,
	title: str | None = None,
	description: str | None = None,
	og_type: str = "website",
	robots: str | None = None,
	json_ld: list | dict | None = None,
	published_time: str | None = None,
):
	"""Attach canonical, social, robots, Frappe metatags, and JSON-LD to page context."""
	canonical = absolute_url(path)
	desc = (description or DEFAULT_DESCRIPTION).strip()
	page_title = (title or PRODUCT_NAME).strip()

	context.canonical_url = canonical
	context.og_image = OG_IMAGE
	context.og_type = og_type
	context.page_title = page_title
	context.meta_description = desc
	if robots:
		context.robots_meta = robots

	# Drive Frappe's meta_block so default "Home"/"List" tags do not win.
	metatags = {
		"title": f"{page_title} · {PRODUCT_NAME}" if page_title != PRODUCT_NAME else PRODUCT_NAME,
		"description": desc,
		"image": OG_IMAGE,
		"og:type": og_type,
		"og:url": canonical,
		"og:site_name": PRODUCT_NAME,
		"twitter:card": "summary",
		"twitter:image": OG_IMAGE,
	}
	if published_time:
		metatags["published_on"] = published_time
	if robots:
		metatags["robots"] = robots
	context.metatags = metatags

	blocks: list = []
	if json_ld is None:
		blocks = []
	elif isinstance(json_ld, dict):
		blocks = [json_ld]
	else:
		blocks = list(json_ld)
	context.json_ld_blocks = [json.dumps(b, ensure_ascii=False, separators=(",", ":")) for b in blocks]
