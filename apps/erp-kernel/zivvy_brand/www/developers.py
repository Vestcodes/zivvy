# Copyright (c) 2026, Vestcodes and contributors
# License: MIT

import frappe

no_cache = 1


def get_context(context):
	frappe.local.flags.redirect_location = "/"
	raise frappe.Redirect


def _customer_endpoints():
	"""Intentional customer-facing allowlist only (no admin Polar setup / webhooks)."""
	return [
		{
			"group": "Guest",
			"auth": "None (Guest)",
			"plan": "Any",
			# Key must NOT be "items" — Jinja resolves dict.items to the builtin method
			"routes": [
				{
					"method": "GET",
					"path": "/api/method/ping",
					"summary": "Health check",
					"body": None,
					"response": '{"message": "pong"}',
				},
				{
					"method": "GET",
					"path": "/api/method/zivvy_brand.billing.api.get_public_pricing",
					"summary": "Public pricing matrix (Free / Pro / Business)",
					"body": None,
					"response": '{"message": {"free": {...}, "pro": {...}, "business": {...}}}',
				},
				{
					"method": "POST",
					"path": "/api/method/zivvy_brand.analytics.contact.submit_contact",
					"summary": "Contact form (rate-limited)",
					"body": '{"full_name": "Ada", "email": "ada@example.com", "message": "Hello"}',
					"response": '{"message": {"ok": true}}',
				},
				{
					"method": "POST",
					"path": "/api/method/zivvy_brand.marketing.api.send_contact_message",
					"summary": "Alternate contact form handler",
					"body": '{"full_name": "Ada", "email": "ada@example.com", "message": "Hello"}',
					"response": '{"message": {"ok": true}}',
				},
				{
					"method": "POST",
					"path": "/api/method/zivvy_brand.auth.signup.sign_up",
					"summary": "Website signup — creates Tenant + Company + Desk user",
					"body": '{"email": "you@example.com", "full_name": "You", "company_name": "Acme", "zivvy_datacenter": "india", "redirect_to": "/app"}',
					"response": '[1, "Please check your email for verification"]',
					"notes": (
						"zivvy_datacenter required: india | eu | us. "
						"company_name optional. Provisions Zivvy Tenant (Phase 1 company-per-tenant). "
						"See TENANCY.md."
					),
				},
			],
		},
		{
			"group": "Logged-in customer",
			"auth": "Session cookie or API key (token)",
			"plan": "Any logged-in user",
			"routes": [
				{
					"method": "GET",
					"path": "/api/method/zivvy_brand.billing.api.get_my_plan",
					"summary": "Effective plan for the current user's tenant (seats are per-tenant)",
					"body": None,
					"response": '{"message": {"tier": "free", "tenant_id": "acme", "tenancy_mode": "company_per_tenant", ...}}',
				},
				{
					"method": "GET / POST",
					"path": "/api/resource/{Doctype}",
					"summary": "Resource CRUD — only DocTypes your roles + plan allow",
					"body": "Standard REST resource API; gated DocTypes return PermissionError on Free/Pro as applicable",
					"response": "Standard resource JSON payload",
				},
				{
					"method": "POST",
					"path": "/api/method/erpnext.stock.utils.scan_barcode",
					"summary": "Scan a barcode into item / serial / batch context",
					"body": '{"search_value": "YOUR_BARCODE"}',
					"response": '{"message": {"item_code": "...", "barcode": "...", "uom": "..."}}',
					"plan_req": "Pro or Business (inventory barcode capability)",
				},
			],
		},
		{
			"group": "Billing (Desk)",
			"auth": "Logged-in Desk (System User). Tenant admins can checkout; Polar ops details are System Manager only.",
			"plan": "Tenant subscription; checkout for Pro/Business",
			"routes": [
				{
					"method": "GET",
					"path": "/api/method/zivvy_brand.billing.api.get_billing_status",
					"summary": "Tenant plan + Polar readiness (no secrets). Demo accounts may call this.",
					"body": None,
					"response": '{"message": {"tier": "pro", "tenant_id": "acme", "polar": {"configured": true}, ...}}',
				},
				{
					"method": "POST",
					"path": "/api/method/zivvy_brand.billing.api.create_checkout",
					"summary": "Start Polar checkout with seat qty + zivvy_tenant metadata (optional billing=monthly|annual, discount_code e.g. ActimiXYZ)",
					"body": '{"plan": "business", "seats": 3, "billing": "monthly", "discount_code": "ActimiXYZ"}',
					"response": '{"message": {"url": "https://polar.sh/...", "plan": "business", "billing": "monthly", "discount_applied": true}}',
					"plan_req": "Pro or Business product IDs configured",
				},
				{
					"method": "POST",
					"path": "/api/method/zivvy_brand.billing.api.create_portal_session",
					"summary": "Open Polar customer portal for this tenant",
					"body": None,
					"response": '{"message": {"url": "https://polar.sh/..."}}',
				},
			],
		},
	]
