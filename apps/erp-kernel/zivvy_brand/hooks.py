app_name = "zivvy_brand"
app_title = "Zivvy"
app_publisher = "Vestcodes"
app_description = "Zivvy by Vestcodes — brand overlay, legal pages, marketing site, and Polar billing (https://zivvy.xyz)"
app_email = "contact@vestcodes.com"
app_license = "MIT"
app_icon = "octicon octicon-zap"
app_color = "#4F46E5"
app_logo_url = "/assets/zivvy_brand/images/zivvy-logo.svg"
app_home = "/app"

required_apps = ["erpnext"]

add_to_apps_screen = [
	{
		"name": "zivvy",
		"logo": "/assets/zivvy_brand/images/zivvy-logo.svg",
		"title": "Zivvy",
		"route": "/app/zivvy-home",
	}
]

website_context = {
	"favicon": "/assets/zivvy_brand/images/zivvy-favicon.svg",
	"splash_image": "/assets/zivvy_brand/images/zivvy-logo.svg",
	"app_name": "Zivvy",
}

# Marketing landing lives at /home (also set as Website Settings home_page on install)
website_route_rules = [
	{"from_route": "/blog/<slug>", "to_route": "blog_post"},
]

# Beat Frappe Blog Post web view (/blog) and /blog/<category> shadowing
website_path_resolver = [
	"zivvy_brand.www.path_resolver.resolve",
]

app_include_css = [
	"/assets/zivvy_brand/css/zivvy_desk_minimal.css",
	"/assets/zivvy_brand/css/zivvy_legal.css",
]
web_include_css = [
	"/assets/zivvy_brand/css/zivvy_legal.css",
	"/assets/zivvy_brand/css/zivvy_marketing.css",
]
app_include_js = [
	"/assets/zivvy_brand/js/zivvy_boot.js",
	"/assets/zivvy_brand/js/zivvy_gating.js",
	"/assets/zivvy_brand/js/zivvy_saas_shell.js",
	"/assets/zivvy_brand/js/zivvy_cookie_banner.js",
	"/assets/zivvy_brand/js/zivvy_posthog.js",
]
web_include_js = [
	"/assets/zivvy_brand/js/zivvy_cookie_banner.js",
	"/assets/zivvy_brand/js/zivvy_posthog.js",
]

email_brand_image = "assets/zivvy_brand/images/zivvy-logo.png"

default_mail_footer = """
	<span>
		Sent via
		<a class="text-muted" href="https://zivvy.xyz" target="_blank" rel="noopener">
			Zivvy
		</a>
		·
		<a class="text-muted" href="https://zivvy.xyz/terms" target="_blank" rel="noopener">Terms</a>
		·
		<a class="text-muted" href="https://zivvy.xyz/privacy" target="_blank" rel="noopener">Privacy</a>
		·
		<a class="text-muted" href="mailto:contact@vestcodes.com">contact@vestcodes.com</a>
	</span>
	<div style="font-size: 11px; margin-top: 4px; color: #aaa;">
		Powered by Zivvy
	</div>
"""

after_install = "zivvy_brand.setup.install.after_install"
after_migrate = "zivvy_brand.setup.install.after_migrate"

extend_bootinfo = "zivvy_brand.gating.boot.extend_bootinfo"
on_login = "zivvy_brand.auth.session.on_login"
before_request = [
	# Bounce non-API requests on api.zivvy.xyz to the frontend at zivvy.xyz.
	# Must run first so redirects short-circuit tenant/permission work.
	"zivvy_brand.api_gateway.guard_api_only",
	"zivvy_brand.api.cookies.ensure_secure_cookie_patch",
	"zivvy_brand.tenancy.context.set_request_tenant",
	"zivvy_brand.auth.not_permitted.before_request",
	"zivvy_brand.gating.permissions.guard_api_access",
]
after_request = [
	"zivvy_brand.api.sanitize.after_request",
]

# SaaS signup: never show "ask your administrator to verify your sign-up"
# Login email-link: fail fast with Resend HTTPS (Railway blocks SMTP 465/587)
override_whitelisted_methods = {
	"frappe.core.doctype.user.user.sign_up": "zivvy_brand.auth.signup.sign_up",
	"frappe.www.login.send_login_link": "zivvy_brand.email.resend_http.send_login_link",
}

# All frappe.sendmail / Email Queue delivery → Resend HTTP API (not SMTP)
override_email_send = ["zivvy_brand.email.resend_http.override_email_send"]

_webhook_emit = "zivvy_brand.api.webhooks.emit_event"
_stamp_tenant = "zivvy_brand.tenancy.binding.stamp_tenant_on_doc"
_prevent_tenant_mutation = "zivvy_brand.tenancy.binding.prevent_tenant_mutation"

doc_events = {
	# M2: wildcard validate handler. Defense-in-depth against a client that
	# patches `zivvy_tenant` on an existing doc via REST — the Custom Field's
	# read_only=1 is a Desk-only hint that REST ignores. The handler no-ops
	# on doctypes without the field, on new docs (before_insert covers those),
	# and on ops users; on tenant-user mutations it raises PermissionError.
	"*": {
		"validate": _prevent_tenant_mutation,
	},
	"User": {
		"validate": [
			"zivvy_brand.gating.seats.validate_user_seat",
		],
		"before_insert": "zivvy_brand.auth.signup.ensure_website_user_enabled",
		"on_update": "zivvy_brand.gating.seats.sync_user_tenant_seat_count",
		"on_trash": "zivvy_brand.gating.seats.sync_user_tenant_seat_count",
	},
	"Company": {
		"before_insert": "zivvy_brand.gating.seats.validate_company_multi",
	},
	# --- Tenant-stamped + webhook-emitting doctypes ---
	"Customer": {
		"before_insert": _stamp_tenant,
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Lead": {
		"before_insert": _stamp_tenant,
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Opportunity": {
		"before_insert": _stamp_tenant,
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Contact": {
		"before_insert": _stamp_tenant,
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Address": {
		"before_insert": _stamp_tenant,
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Supplier": {
		"before_insert": _stamp_tenant,
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Item": {
		"before_insert": _stamp_tenant,
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Item Price": {
		"before_insert": _stamp_tenant,
	},
	"Item Group": {
		"before_insert": _stamp_tenant,
	},
	"Blog Post": {
		"before_insert": _stamp_tenant,
	},
	"Comment": {
		"before_insert": _stamp_tenant,
	},
	"Note": {
		"before_insert": _stamp_tenant,
	},
	"ToDo": {
		"before_insert": _stamp_tenant,
	},
	"Communication": {
		"before_insert": _stamp_tenant,
	},
	"Zivvy Role Template": {
		"before_insert": _stamp_tenant,
	},
	# --- Submittable transactional doctypes ---
	"Quotation": {
		"before_validate": "zivvy_brand.selling.defaults.apply_selling_defaults",
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Sales Order": {
		"before_validate": "zivvy_brand.selling.defaults.apply_selling_defaults",
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Purchase Order": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Sales Invoice": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Purchase Invoice": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Payment Entry": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Journal Entry": {
		"after_insert": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Stock Entry": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Delivery Note": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Purchase Receipt": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Material Request": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	# --- Non-submittable Pro/Business resources ---
	"Employee": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Leave Application": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Expense Claim": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Project": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Task": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Timesheet": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"BOM": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Work Order": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Issue": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
	},
	"Asset": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Quality Inspection": {
		"after_insert": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Production Plan": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Subcontracting Order": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Attendance": {
		"after_insert": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Warehouse": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Account": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	# --- Banking ---
	"Bank": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Bank Account": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Bank Transaction": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Bank Clearance": {
		"after_insert": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Bank Statement Import": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Bank Transaction Rule": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Bank Guarantee": {
		"after_insert": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	# --- Payments ---
	"Mode of Payment": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Payment Terms Template": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Payment Request": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Payment Reconciliation": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Process Payment Reconciliation": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Payment Order": {
		"after_insert": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Payment Gateway Account": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Dunning": {
		"after_insert": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	# --- Accounts (extras) ---
	"Cost Center": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Fiscal Year": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Budget": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Period Closing Voucher": {
		"after_insert": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Accounting Period": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Tax Category": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Sales Taxes and Charges Template": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Purchase Taxes and Charges Template": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Accounting Dimension": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	# --- POS ---
	"POS Invoice": {
		"after_insert": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"POS Profile": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Loyalty Program": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	# --- Stock (extras) ---
	"Batch": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Stock Reconciliation": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Pick List": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Shipment": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Delivery Trip": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Packing Slip": {
		"after_insert": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Landed Cost Voucher": {
		"after_insert": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Putaway Rule": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Item Barcode": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Serial and Batch Bundle": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Serial No": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	# --- HR (extras) ---
	"Employee Grade": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Department": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Designation": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Leave Type": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Leave Allocation": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Leave Policy": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Attendance Request": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Employee Checkin": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Payroll Entry": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Salary Slip": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Salary Structure": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Salary Structure Assignment": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Appraisal": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Employee Advance": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Employee Onboarding": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Shift Assignment": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Holiday List": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Shift Type": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	# --- Talent / Recruitment ---
	"Job Opening": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Job Applicant": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Interview": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Interview Round": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Job Offer": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Appointment Letter": {
		"after_insert": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Goal": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Employee Performance Feedback": {
		"after_insert": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Training Event": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Training Program": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Training Result": {
		"after_insert": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Training Feedback": {
		"after_insert": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	# --- Projects (extras) ---
	"Project Template": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Activity Type": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	# --- Manufacturing (extras) ---
	"BOM Creator": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Job Card": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Routing": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Downtime Entry": {
		"after_insert": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	# --- Quality ---
	"Quality Inspection Template": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Quality Goal": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Quality Procedure": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Quality Feedback": {
		"after_insert": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Non Conformance": {
		"after_insert": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	# --- Assets ---
	"Asset Category": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Asset Capitalization": {
		"after_insert": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Asset Movement": {
		"after_insert": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Asset Repair": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Asset Value Adjustment": {
		"after_insert": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	# --- Subscription / Subcontracting (extras) ---
	"Subscription": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Subscription Plan": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Subcontracting Receipt": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	"Subcontracting Inward Order": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_submit": _webhook_emit,
		"on_cancel": _webhook_emit,
	},
	# --- Helpdesk (Frappe Helpdesk app) ---
	"HD Ticket": {
		"before_insert": _stamp_tenant,
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"HD Article": {
		"before_insert": _stamp_tenant,
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"HD Team": {
		"before_insert": _stamp_tenant,
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"HD Service Level Agreement": {
		"before_insert": _stamp_tenant,
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"HD Ticket Type": {
		"before_insert": _stamp_tenant,
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"HD Ticket Priority": {
		"before_insert": _stamp_tenant,
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	# --- Insights (analytics / BI) ---
	"Insights Dashboard": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Insights Query": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Insights Chart": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Insights Data Source": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	# --- Webshop ---
	"Website Item": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Product Bundle": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Webshop Slideshow": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	# --- Ecommerce integrations ---
	"Shopify Settings": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
	"Amazon SP Settings": {
		"after_insert": _webhook_emit,
		"on_update": _webhook_emit,
		"on_trash": _webhook_emit,
	},
}

# Gated DocTypes → permission + list query checks (Free cannot open Pro/Business features)
# Plus company-per-tenant isolation for Company / User / Zivvy Tenant
from zivvy_brand.gating.query import permission_query_conditions as _zivvy_pqc  # noqa: E402
from zivvy_brand.gating.tiers import permission_hooks  # noqa: E402
from zivvy_brand.tenancy.isolation import (  # noqa: E402
	isolation_permission_hooks,
	isolation_query_hooks,
)

has_permission = {**permission_hooks(), **isolation_permission_hooks()}
permission_query_conditions = {**_zivvy_pqc, **isolation_query_hooks()}
