import frappe

from zivvy_brand.marketing.seo import (
	apply_seo,
	organization_ld,
	software_application_ld,
	website_ld,
)
from zivvy_brand.www.cache import apply_public_cache

no_cache = 0


def get_context(context):
	from zivvy_brand.gating.tiers import feature_matrix

	apply_public_cache(context, max_age=300, stale_while_revalidate=120)
	context.show_sidebar = False
	context.active_nav = "home"
	context.plans = feature_matrix()
	apply_seo(
		context,
		"/home",
		title="Business software that stays out of the way",
		description=(
			"Zivvy — CRM, operations, accounting, and HR for growing teams. "
			"Start free. Upgrade with Polar when you need more."
		),
		json_ld=[organization_ld(), website_ld(), software_application_ld()],
	)
