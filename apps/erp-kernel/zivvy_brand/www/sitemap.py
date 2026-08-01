# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

"""Dynamic sitemap for marketing + seeded blog posts.

Controller is ``sitemap.py`` (not ``sitemap.xml.py``) because Frappe strips the
``.xml`` extension when resolving the colocated Python module for ``sitemap.xml``.
"""

from zivvy_brand.constants import PRODUCTION_ORIGIN
from zivvy_brand.www.cache import apply_public_cache

no_cache = 0

_PATHS = (
	"/home",
	"/features",
	"/pricing",
	"/contact",
	"/blog",
	"/terms",
	"/privacy",
	"/cookies",
	"/acceptable-use",
)


def get_context(context):
	from zivvy_brand.blog.posts import list_posts

	apply_public_cache(context, max_age=900, stale_while_revalidate=300)
	# Ensure XML content-type when served as a website page
	context.update({"content_type": "application/xml; charset=utf-8"})
	urls = [PRODUCTION_ORIGIN + p for p in _PATHS]
	for post in list_posts():
		urls.append(f"{PRODUCTION_ORIGIN}/blog/{post['slug']}")
	context.sitemap_urls = urls
