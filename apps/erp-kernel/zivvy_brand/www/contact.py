from zivvy_brand.marketing.seo import apply_seo, organization_ld

no_cache = 1


def get_context(context):
	context.no_cache = 1
	context.show_sidebar = False
	context.active_nav = "contact"
	context.contact_email = "contact@vestcodes.com"
	apply_seo(
		context,
		"/contact",
		title="Contact",
		description=(
			"Contact Vestcodes Co about Zivvy — sales, support, and partnerships. "
			"contact@vestcodes.com · https://zivvy.xyz/contact"
		),
		json_ld=organization_ld(),
	)
