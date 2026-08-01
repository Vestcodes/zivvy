import frappe
from frappe.utils import cint

from zivvy_brand.constants import (
	COMPANY_SITE,
	CONTACT_EMAIL,
	POLAR_CANCEL_URL,
	POLAR_SUCCESS_URL,
	POLAR_WEBHOOK_URL,
	PRODUCTION_HOST,
	PRODUCTION_ORIGIN,
	PRODUCT_LOCKUP,
	PRODUCT_NAME,
)

ZIVVY_LOGO = "/assets/zivvy_brand/images/zivvy-logo.svg"
ZIVVY_FAVICON = "/assets/zivvy_brand/images/zivvy-favicon.svg"

# Help routes that should not surface ERPNext / Frappe branding
_REMOVED_HELP_ROUTE_FRAGMENTS = (
	"docs.erpnext.com",
	"discuss.frappe.io",
	"frappe.io",
	"frappeframework.com",
	"frappe.cloud",
	"github.com/frappe",
	"erpnext.com",
	"frappetech",
)

_ZIVVY_HELP_ITEMS = (
	{
		"item_label": "Billing",
		"item_type": "Route",
		"route": "/app/billing",
		"is_standard": 1,
	},
	{
		"item_label": "Marketing site",
		"item_type": "Route",
		"route": "/home",
		"is_standard": 1,
	},
	{
		"item_label": "Pricing",
		"item_type": "Route",
		"route": "/pricing",
		"is_standard": 1,
	},
	{
		"item_label": "Blog",
		"item_type": "Route",
		"route": "/blog",
		"is_standard": 1,
	},
	{
		"item_label": "About Zivvy",
		"item_type": "Route",
		"route": PRODUCTION_ORIGIN,
		"is_standard": 1,
	},
	{
		"item_label": "Vestcodes",
		"item_type": "Route",
		"route": COMPANY_SITE,
		"is_standard": 1,
	},
)

_DESK_BRAND_LABEL_OVERRIDES = {
	"ERPNext Integrations": "Zivvy Integrations",
	"ERPNext Settings": "Workspace Settings",
	"About ERPNext": "About Zivvy",
	"ERPNext": "Zivvy",
	"Frappe": "Zivvy",
	"Frappe Framework": "Zivvy Platform",
}


def after_install():
	# ERPNext masters (Salutation/Gender/UOM/Item Group/Customer Group/
	# Supplier Group/Territory/Price List/Mode of Payment) must be present
	# BEFORE tenancy seeding creates the first tenant Company so link fields
	# resolve to real rows.
	_seed_erpnext_masters()
	seed_brand_settings()
	seed_subscription()
	seed_zivvy_settings()
	seed_polar_settings()
	seed_resend_email()
	seed_email_branding()
	seed_demo_plan_field()
	seed_datacenter_field()
	seed_tenancy()
	seed_setup_complete()
	frappe.db.commit()


def after_migrate():
	_remove_stale_apps()
	# Backfill missing ERPNext masters on sites first provisioned by
	# zivvy_brand's tenant flow (which bypasses ERPNext's setup wizard).
	_seed_erpnext_masters()
	seed_brand_settings()
	seed_subscription()
	seed_zivvy_settings()
	seed_polar_settings()
	seed_resend_email()
	seed_email_branding()
	seed_demo_plan_field()
	seed_datacenter_field()
	ensure_hrms_custom_fields()
	seed_tenancy()
	seed_setup_complete()
	_backfill_wiki_approver_role()
	_backfill_tenant_admin_roles()
	_backfill_company_user_permissions()
	_seed_default_addons()
	_seed_default_tiers()
	frappe.db.commit()


def _remove_stale_apps():
	"""Remove apps that were accidentally added to installed_apps."""
	for app in ("raven",):
		if frappe.db.exists("Installed Application", {"app_name": app}):
			frappe.db.delete("Installed Application", {"app_name": app})
			frappe.db.commit()


def _seed_erpnext_masters():
	"""Backfill baseline ERPNext masters (idempotent; never re-raises)."""
	try:
		from zivvy_brand.setup.masters_seed import seed_erpnext_masters

		seed_erpnext_masters()
	except Exception:
		try:
			frappe.log_error(frappe.get_traceback(), "Zivvy ERPNext masters seed")
		except Exception:
			pass


def _seed_default_addons():
	try:
		from zivvy_brand.setup.addons_seed import seed_default_addons

		seed_default_addons()
	except Exception:
		try:
			frappe.log_error(frappe.get_traceback(), "Zivvy default addons seed")
		except Exception:
			pass


def _seed_default_tiers():
	try:
		from zivvy_brand.setup.tiers_seed import seed_default_tiers

		seed_default_tiers()
	except Exception:
		try:
			frappe.log_error(frappe.get_traceback(), "Zivvy default tiers seed")
		except Exception:
			pass


def ensure_hrms_custom_fields():
	"""HRMS Employee leave/expense approver fields — required so User.save hooks don't abort login."""
	if "hrms" not in frappe.get_installed_apps():
		return
	try:
		if frappe.db.has_column("Employee", "expense_approver") and frappe.db.has_column(
			"Employee", "leave_approver"
		):
			return
		from frappe.custom.doctype.custom_field.custom_field import create_custom_fields
		from hrms.setup import get_custom_fields

		create_custom_fields(get_custom_fields(), ignore_validate=True)
		frappe.db.commit()
	except Exception:
		try:
			frappe.db.rollback()
		except Exception:
			pass
		try:
			frappe.log_error(frappe.get_traceback(), "Zivvy ensure_hrms_custom_fields")
		except Exception:
			pass


def seed_setup_complete():
	"""Mark System Settings + Installed Application setup complete so Desk skips /app/setup-wizard."""
	try:
		from zivvy_brand.setup.setup_state import ensure_saas_setup_complete

		ensure_saas_setup_complete()
	except Exception:
		frappe.log_error(frappe.get_traceback(), "Zivvy seed_setup_complete")


def _backfill_tenant_admin_roles():
	"""Grant the tenant-admin role set to every tenant's owner_user.

	Signup used to only grant Free-tier Sales/Purchase User roles, so pre-existing
	tenant admins couldn't delete a Customer/Lead or open HR/Accounts docs even on
	paid tiers. Access to *tier-gated* features stays bounded by the gating layer,
	so granting these roles to Free tenant admins is safe."""
	try:
		from zivvy_brand.setup.roles_backfill import backfill_tenant_admin_roles

		backfill_tenant_admin_roles()
	except Exception:
		try:
			frappe.log_error(frappe.get_traceback(), "Zivvy tenant admin roles backfill")
		except Exception:
			pass


def _backfill_company_user_permissions():
	"""Narrow Company User Permissions that used apply_to_all_doctypes=1.

	That flag made Frappe reject Customer rows with represents_company=NULL.
	"""
	try:
		from zivvy_brand.setup.user_perm_backfill import backfill_company_user_permissions

		backfill_company_user_permissions()
	except Exception:
		try:
			frappe.log_error(frappe.get_traceback(), "Zivvy company user permission backfill")
		except Exception:
			pass


def _backfill_wiki_approver_role():
	"""Grant Wiki Approver to all System Users who lack it so wiki is accessible on Free."""
	try:
		if not frappe.db.exists("Role", "Wiki Approver"):
			return
		users_without = frappe.db.sql("""
			SELECT u.name FROM `tabUser` u
			WHERE u.user_type = 'System User' AND u.enabled = 1
			  AND u.name NOT IN ('Administrator', 'Guest')
			  AND u.name NOT IN (
				SELECT parent FROM `tabHas Role` WHERE role = 'Wiki Approver'
			  )
		""", pluck="name")
		for email in users_without:
			user = frappe.get_doc("User", email)
			user.flags.ignore_permissions = True
			user.append("roles", {"role": "Wiki Approver"})
			user.save(ignore_permissions=True)
	except Exception:
		try:
			frappe.log_error(frappe.get_traceback(), "Zivvy backfill Wiki Approver")
		except Exception:
			pass


def _ensure_tenant_admin_role():
	"""Create the Zivvy Tenant Admin role if it doesn't exist, and migrate
	tenanted users who currently hold System Manager to Tenant Admin instead."""
	from zivvy_brand.tenancy.context import TENANT_ADMIN_ROLE
	from zivvy_brand.tenancy import TENANT_FIELD

	if not frappe.db.exists("Role", TENANT_ADMIN_ROLE):
		doc = frappe.get_doc({
			"doctype": "Role",
			"role_name": TENANT_ADMIN_ROLE,
			"desk_access": 1,
			"is_custom": 1,
		})
		doc.flags.ignore_permissions = True
		doc.insert(ignore_permissions=True)
		frappe.db.commit()

	if not frappe.db.has_column("User", TENANT_FIELD):
		return

	tenanted_sysmanagers = frappe.db.sql(
		f"""
		SELECT u.name
		FROM tabUser u
		JOIN `tabHas Role` hr ON hr.parent = u.name AND hr.parenttype = 'User'
		WHERE hr.role = 'System Manager'
		  AND u.name NOT IN ('Administrator', 'Guest')
		  AND IFNULL(u.`{TENANT_FIELD}`, '') != ''
		""",
		as_dict=True,
	)
	for row in tenanted_sysmanagers:
		try:
			user_doc = frappe.get_doc("User", row.name)
			has_tenant_admin = any(r.role == TENANT_ADMIN_ROLE for r in user_doc.roles)
			if not has_tenant_admin:
				user_doc.append("roles", {"role": TENANT_ADMIN_ROLE})
			user_doc.set(
				"roles",
				[r for r in user_doc.roles if r.role != "System Manager"],
			)
			user_doc.flags.ignore_permissions = True
			user_doc.save(ignore_permissions=True)
		except Exception:
			frappe.log_error(
				frappe.get_traceback(),
				f"Zivvy: failed to demote {row.name} from System Manager to Tenant Admin",
			)
	if tenanted_sysmanagers:
		frappe.db.commit()


def seed_tenancy():
	"""Ensure User.zivvy_tenant + migrate founder/demos into isolated tenants."""

	def _safe_log(title: str):
		try:
			frappe.db.rollback()
		except Exception:
			pass
		try:
			frappe.log_error(frappe.get_traceback(), title)
		except Exception:
			pass

	try:
		_ensure_tenant_admin_role()
	except Exception:
		_safe_log("Zivvy Tenant Admin role seed")

	try:
		from zivvy_brand.tenancy.context import ensure_tenant_user_field

		ensure_tenant_user_field()
	except Exception:
		_safe_log("Zivvy tenant field seed")
	try:
		from zivvy_brand.tenancy.binding import backfill_all_scoped, ensure_tenant_link_fields

		ensure_tenant_link_fields()
		backfill_all_scoped()
	except Exception:
		_safe_log("Zivvy tenant-scoped field seed")
	try:
		from zivvy_brand.tenancy.migrate_existing import (
			migrate_existing_tenants,
			scrub_shared_default_company_pollution,
		)

		if frappe.db.exists("DocType", "Zivvy Tenant"):
			migrate_existing_tenants()
			scrub_shared_default_company_pollution()
	except Exception:
		_safe_log("Zivvy tenant migrate seed")


def seed_email_branding():
	"""Scrub ERPNext from Email Templates / Account footers; set Zivvy mail chrome."""
	try:
		from zivvy_brand.email.branding import scrub_email_branding

		scrub_email_branding()
	except Exception:
		frappe.log_error(frappe.get_traceback(), "Zivvy email branding seed")


def seed_demo_plan_field():
	"""Ensure User.zivvy_demo_plan exists for per-user gating overrides."""
	try:
		from zivvy_brand.setup.seed_demo_accounts import ensure_demo_plan_custom_field

		ensure_demo_plan_custom_field()
	except Exception:
		frappe.log_error(frappe.get_traceback(), "Zivvy demo plan field seed")


def seed_datacenter_field():
	"""Ensure User.zivvy_datacenter exists for data-residency preference."""
	try:
		from zivvy_brand.auth.datacenter import ensure_datacenter_custom_field

		ensure_datacenter_custom_field()
	except Exception:
		frappe.log_error(frappe.get_traceback(), "Zivvy datacenter field seed")

def seed_brand_settings():
	"""Apply Zivvy brand ownership across System / Website / Navbar settings."""
	_set_system_app_name()
	_set_website_brand()
	_set_navbar_help_links()
	_scrub_desk_brand_labels()


def seed_zivvy_settings():
	"""Ensure Zivvy Settings single exists (PostHog fields stay empty until configured)."""
	if not frappe.db.exists("DocType", "Zivvy Settings"):
		return
	try:
		frappe.get_single("Zivvy Settings")
	except Exception:
		doc = frappe.new_doc("Zivvy Settings")
		doc.enable_posthog = 0
		doc.insert(ignore_permissions=True)


def seed_polar_settings():
	"""Seed Polar Settings checkout URL defaults for https://zivvy.xyz (never overwrite secrets)."""
	if not frappe.db.exists("DocType", "Polar Settings"):
		return
	try:
		doc = frappe.get_single("Polar Settings")
	except Exception:
		doc = frappe.new_doc("Polar Settings")

	changed = False
	if not (doc.success_url or "").strip():
		doc.success_url = POLAR_SUCCESS_URL
		changed = True
	if not (doc.cancel_url or "").strip():
		doc.cancel_url = POLAR_CANCEL_URL
		changed = True

	if doc.is_new():
		doc.insert(ignore_permissions=True)
	elif changed:
		doc.save(ignore_permissions=True)


def seed_subscription():
	try:
		from zivvy_brand.billing.subscription import ensure_subscription_defaults

		ensure_subscription_defaults()
	except Exception:
		frappe.log_error(frappe.get_traceback(), "Zivvy Subscription seed")


def seed_resend_email():
	"""Configure Resend Email Account when RESEND_API_KEY is present; enable pending users."""
	try:
		from zivvy_brand.email.resend import enable_saas_website_users, ensure_resend_email_account

		ensure_resend_email_account()
		enable_saas_website_users()
	except Exception:
		frappe.log_error(frappe.get_traceback(), "Zivvy Resend email seed")


def _set_system_app_name():
	frappe.db.set_single_value("System Settings", "app_name", PRODUCT_NAME)


def _set_website_brand():
	if not frappe.db.exists("DocType", "Website Settings"):
		return

	ws = frappe.get_single("Website Settings")
	ws.app_name = PRODUCT_NAME
	ws.app_logo = ZIVVY_LOGO
	ws.favicon = ZIVVY_FAVICON
	ws.splash_image = ZIVVY_LOGO
	ws.banner_image = ZIVVY_LOGO
	ws.footer_logo = ZIVVY_LOGO
	ws.brand_html = PRODUCT_NAME
	ws.home_page = "home"
	ws.title_prefix = PRODUCT_NAME
	# SaaS: keep public email/password signup enabled (do not re-disable on migrate)
	ws.disable_signup = 0
	# Cookie / session domain note for production (apex preferred; www redirects to apex)
	if hasattr(ws, "subdomain"):
		pass
	ws.footer_powered = (
		f'Powered by <a href="{PRODUCTION_ORIGIN}" target="_blank" rel="noopener">{PRODUCT_LOCKUP}</a>'
		f' · <a href="{PRODUCTION_ORIGIN}/home">Home</a>'
		f' · <a href="{PRODUCTION_ORIGIN}/blog">Blog</a>'
		f' · <a href="{PRODUCTION_ORIGIN}/terms">Terms</a>'
		f' · <a href="{PRODUCTION_ORIGIN}/privacy">Privacy</a>'
		f' · <a href="{PRODUCTION_ORIGIN}/cookies">Cookies</a>'
		f' · <a href="{PRODUCTION_ORIGIN}/pricing">Pricing</a>'
		f' · <a href="mailto:{CONTACT_EMAIL}">Contact</a>'
		f' · <span class="text-muted">Cookies &amp; sessions: .{PRODUCTION_HOST}</span>'
	)
	ws.flags.ignore_mandatory = True
	ws.save(ignore_permissions=True)


def _set_navbar_help_links():
	if not frappe.db.exists("DocType", "Navbar Settings"):
		return

	navbar = frappe.get_single("Navbar Settings")

	# Hide (do not delete) standard Frappe/ERPNext help items
	for item in navbar.help_dropdown or []:
		route = item.route or ""
		label = item.item_label or ""
		action = item.action or ""
		if _is_erpnext_or_frappe_help(route, label, action) or (
			label
			and (
				"frappe" in label.strip().lower()
				or "erpnext" in label.strip().lower()
			)
		):
			item.hidden = 1
		elif label and label.strip().lower() == "about zivvy" and "zivvy.xyz" not in (route or ""):
			item.route = PRODUCTION_ORIGIN
			item.hidden = 0

	existing_labels = {
		(item.item_label or "").strip()
		for item in (navbar.help_dropdown or [])
		if not cint(item.hidden)
	}
	for item in _ZIVVY_HELP_ITEMS:
		if item["item_label"] in existing_labels:
			continue
		navbar.append("help_dropdown", dict(item))

	if hasattr(navbar, "settings_dropdown"):
		for item in navbar.settings_dropdown or []:
			route = item.route or ""
			label = item.item_label or ""
			action = item.action or ""
			if _is_erpnext_or_frappe_help(route, label, action) or (
				label
				and (
					"frappe" in label.strip().lower()
					or "erpnext" in label.strip().lower()
				)
			):
				item.hidden = 1

	if hasattr(navbar, "app_logo") and not (navbar.app_logo or "").startswith("/assets/zivvy_brand"):
		navbar.app_logo = ZIVVY_LOGO

	navbar.flags.ignore_permissions = True
	navbar.save(ignore_permissions=True)


def _is_erpnext_or_frappe_help(route: str, label: str, action: str = "") -> bool:
	haystack = f"{route} {label} {action}".lower()
	if any(fragment in haystack for fragment in _REMOVED_HELP_ROUTE_FRAGMENTS):
		return True
	blocked_labels = (
		"frappe school",
		"user forum",
		"documentation",
		"report an issue",
		"frappe framework",
		"about frappe",
		"frappe cloud",
	)
	if label and label.strip().lower() in blocked_labels:
		return True
	return False


def _scrub_desk_brand_labels():
	"""Keep ERPNext technical keys but scrub user-facing labels in Desk."""
	changed = False
	changed = _update_workspace_labels() or changed
	changed = _upsert_desk_translations() or changed

	if changed:
		frappe.clear_cache()


def _update_workspace_labels() -> bool:
	if not frappe.db.exists("DocType", "Workspace"):
		return False

	changed = False
	for source, target in _DESK_BRAND_LABEL_OVERRIDES.items():
		if not frappe.db.exists("Workspace", source):
			continue

		doc = frappe.get_doc("Workspace", source)
		doc_changed = False

		if (doc.label or "").strip() != target:
			doc.label = target
			doc_changed = True

		if (doc.title or "").strip() != target:
			doc.title = target
			doc_changed = True

		if doc_changed:
			doc.flags.ignore_permissions = True
			doc.save(ignore_permissions=True)
			changed = True

	for name in frappe.get_all("Workspace", pluck="name"):
		doc = frappe.get_doc("Workspace", name)
		doc_changed = False
		for field in ("label", "title"):
			current = (getattr(doc, field, None) or "").strip()
			if not current:
				continue
			rewritten = _rewrite_brand_label(current)
			if rewritten != current:
				setattr(doc, field, rewritten)
				doc_changed = True
		if doc_changed:
			doc.flags.ignore_permissions = True
			doc.save(ignore_permissions=True)
			changed = True

	return changed


def _upsert_desk_translations() -> bool:
	if not frappe.db.exists("DocType", "Translation"):
		return False

	changed = False
	for source, target in _DESK_BRAND_LABEL_OVERRIDES.items():
		existing = frappe.db.get_value(
			"Translation", {"language": "en", "source_text": source}, ["name", "translated_text"], as_dict=True
		)
		if existing:
			if (existing.translated_text or "").strip() == target:
				continue
			doc = frappe.get_doc("Translation", existing.name)
			doc.translated_text = target
			doc.contributed = 0
			doc.save(ignore_permissions=True)
			changed = True
			continue

		doc = frappe.new_doc("Translation")
		doc.language = "en"
		doc.source_text = source
		doc.translated_text = target
		doc.contributed = 0
		doc.insert(ignore_permissions=True)
		changed = True

	return changed


def _rewrite_brand_label(value: str) -> str:
	text = (value or "").strip()
	if not text:
		return text
	lower = text.lower()
	if lower == "erpnext settings":
		return "Workspace Settings"
	if lower == "erpnext integrations":
		return "Zivvy Integrations"
	if lower in {"about erpnext", "about frappe"}:
		return "About Zivvy"
	if lower in {"erpnext", "frappe"}:
		return "Zivvy"
	if lower == "frappe framework":
		return "Zivvy Platform"
	if "erpnext" in lower:
		return text.replace("ERPNext", "Zivvy").replace("erpnext", "Zivvy")
	if "frappe" in lower:
		return text.replace("Frappe", "Zivvy").replace("frappe", "Zivvy")
	return text


# Documented for ops / DEPLOY.md
PRODUCTION_WEBHOOK_URL = POLAR_WEBHOOK_URL
