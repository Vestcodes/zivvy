from zivvy_brand.marketing.seo import apply_seo
from zivvy_brand.www.cache import apply_public_cache

no_cache = 0


def get_context(context):
	apply_public_cache(context, max_age=900, stale_while_revalidate=300)
	context.show_sidebar = False
	context.page_subtitle = "Last updated: 23 July 2026 · Cookie domain: .zivvy.xyz"
	apply_seo(
		context,
		"/cookies",
		title="Cookie Policy",
		description=(
			"Zivvy Cookie Policy — essential cookies, optional analytics consent (PostHog), "
			"and how to manage preferences. https://zivvy.xyz/cookies"
		),
	)
