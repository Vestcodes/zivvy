import frappe

from zivvy_brand.marketing.seo import apply_seo, blog_posting_ld, organization_ld
from zivvy_brand.www.cache import apply_public_cache

no_cache = 0


def get_context(context):
	from zivvy_brand.blog.posts import get_post, list_posts

	slug = frappe.form_dict.get("slug") or ""
	# Path fallback: /blog/<slug>
	if not slug:
		path = (frappe.request.path or "").rstrip("/")
		parts = path.split("/")
		if len(parts) >= 3 and parts[-2] == "blog":
			slug = parts[-1]
		elif len(parts) >= 2 and parts[-2] != "blog":
			slug = parts[-1]

	post = get_post(slug)
	if not post:
		raise frappe.DoesNotExistError(f"Blog post not found: {slug}")

	apply_public_cache(context, max_age=300, stale_while_revalidate=120)
	context.show_sidebar = False
	context.active_nav = "blog"
	context.post = post
	context.more_posts = [p for p in list_posts() if p["slug"] != post["slug"]][:3]
	apply_seo(
		context,
		f"/blog/{post['slug']}",
		title=post["title"],
		description=post["excerpt"],
		og_type="article",
		published_time=post.get("date"),
		json_ld=[organization_ld(), blog_posting_ld(post)],
	)
