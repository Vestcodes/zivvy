from zivvy_brand.marketing.seo import apply_seo
from zivvy_brand.www.cache import apply_public_cache

no_cache = 0


def get_context(context):
	apply_public_cache(context, max_age=900, stale_while_revalidate=300)
	context.show_sidebar = False
	context.page_subtitle = "Last updated: 23 July 2026 · Governing law: India"
	apply_seo(
		context,
		"/terms",
		title="Terms of Service",
		description=(
			"Zivvy Terms of Service — Vestcodes Co. Accounts, subscriptions, acceptable use, "
			"and governing law (India). https://zivvy.xyz/terms"
		),
	)
