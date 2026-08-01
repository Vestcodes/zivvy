import frappe

from zivvy_brand.marketing.seo import apply_seo, software_application_ld
from zivvy_brand.www.cache import apply_public_cache

no_cache = 0


def get_context(context):
	from zivvy_brand.gating.tiers import feature_matrix

	apply_public_cache(context, max_age=300, stale_while_revalidate=120)
	context.show_sidebar = False
	context.active_nav = "pricing"
	context.plans = feature_matrix()
	context.is_logged_in = frappe.session.user not in (None, "Guest")
	apply_seo(
		context,
		"/pricing",
		title="Pricing",
		description=(
			"Zivvy pricing — Free, Pro at $18/user/month, Business at $30/user/month. "
			"Barcode inventory capability is paid (Pro/Business). Per-seat billing via Polar. "
			"https://zivvy.xyz/pricing"
		),
		json_ld=software_application_ld(),
	)
