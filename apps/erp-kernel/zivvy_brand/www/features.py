import frappe

from zivvy_brand.marketing.seo import apply_seo, software_application_ld
from zivvy_brand.www.cache import apply_public_cache

no_cache = 0


def get_context(context):
	from zivvy_brand.gating.tiers import feature_matrix

	apply_public_cache(context, max_age=300, stale_while_revalidate=120)
	context.show_sidebar = False
	context.active_nav = "features"
	context.plans = feature_matrix()
	context.narrative = [
		{
			"code": "free",
			"title": "Start focused",
			"body": "Ideal for founders validating CRM and light order flow without paying for seats you do not need yet.",
		},
		{
			"code": "pro",
			"title": "Run the company",
			"body": "Accounting, inventory, HRMS, projects, and banking when daily ops need depth — no Free seat ceiling.",
		},
		{
			"code": "business",
			"title": "Scale the system",
			"body": "Ecommerce channel sync, advanced manufacturing, quality, assets, and multi-company for teams at volume.",
		},
	]
	apply_seo(
		context,
		"/features",
		title="Features by plan",
		description=(
			"Zivvy features by plan — Free CRM, Pro accounting & inventory & HRMS, Business ecommerce "
			"and multi-company. https://zivvy.xyz/features"
		),
		json_ld=software_application_ld(),
	)
