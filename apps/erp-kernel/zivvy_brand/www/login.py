# Copyright (c) 2026, Vestcodes and contributors
# License: MIT. See LICENSE

"""Login page controller for the zivvy_brand overlay.

Frappe resolves www controllers from the *same app* that owns the winning
``login.html``. Overriding the template without this module skipped
``frappe.www.login.get_context``, so ``signup_form_template`` was undefined
and Jinja ``DebugUndefined`` printed the literal ``{{ signup_form_template }}``.
"""

from frappe import _
from frappe.www.login import get_context as _frappe_get_context

from zivvy_brand.auth.datacenter import DATACENTER_HELP, DATACENTER_LABELS
from zivvy_brand.marketing.seo import apply_seo

no_cache = True

_COMPANY_FIELD_HTML = """
		<div class="form-group zivvy-company-field">
			<label class="form-label" for="signup_company">{label}</label>
			<input type="text" id="signup_company" name="company_name" class="form-control"
				placeholder="{placeholder}" autocomplete="organization">
			<p class="text-muted" style="font-size:12px;margin-top:4px;">{help}</p>
		</div>
"""

_DATACENTER_FIELD_HTML = """
		<div class="form-group zivvy-datacenter-field">
			<label class="form-label" for="signup_datacenter">{label}</label>
			<div class="zivvy-datacenter-options" role="radiogroup" aria-required="true" aria-label="{label}">
				<label class="zivvy-datacenter-option">
					<input type="radio" name="zivvy_datacenter" value="india" checked required>
					<span>{india}</span>
				</label>
				<label class="zivvy-datacenter-option">
					<input type="radio" name="zivvy_datacenter" value="eu" required>
					<span>{eu}</span>
				</label>
				<label class="zivvy-datacenter-option">
					<input type="radio" name="zivvy_datacenter" value="us" required>
					<span>{us}</span>
				</label>
			</div>
			<p class="zivvy-datacenter-help text-muted">{help}</p>
		</div>
"""


def _inject_signup_fields(html: str) -> str:
	"""Insert company + required datacenter fields before signup actions."""
	if not html:
		return html
	blocks = []
	if "zivvy-company-field" not in html:
		blocks.append(
			_COMPANY_FIELD_HTML.format(
				label=_("Company"),
				placeholder=_("Your company name"),
				help=_("Creates your private workspace. Optional — defaults from your name."),
			)
		)
	if "zivvy-datacenter-field" not in html:
		blocks.append(
			_DATACENTER_FIELD_HTML.format(
				label=_("Datacenter"),
				india=_(DATACENTER_LABELS["india"]),
				eu=_(DATACENTER_LABELS["eu"]),
				us=_(DATACENTER_LABELS["us"]),
				help=_("Pick your preferred data region. This preference is saved to your workspace profile and can be updated with support."),
			)
		)
	if not blocks:
		return html
	block = "\n".join(blocks)
	marker = '<div class="page-card-actions">'
	if marker in html:
		return html.replace(marker, block + "\n    " + marker, 1)
	btn = 'class="btn btn-sm btn-primary btn-block btn-signup"'
	if btn in html:
		return html.replace(btn, block + "\n        " + btn, 1)
	return html + block


def get_context(context):
	ctx = _frappe_get_context(context)
	template = ctx.get("signup_form_template") or ""
	ctx["signup_form_template"] = _inject_signup_fields(str(template))
	apply_seo(
		ctx,
		"/login",
		title="Sign In",
		description="Sign in or create a Zivvy account — CRM and operations for growing teams.",
		robots="noindex, nofollow",
	)
	return ctx
