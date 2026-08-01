// Copyright (c) 2026, Vestcodes — MIT
frappe.pages["billing"].on_page_load = function (wrapper) {
	const page = frappe.ui.make_app_page({
		parent: wrapper,
		title: __("Billing"),
		single_column: true,
	});

	wrapper.billing = new zivvy.BillingPage(page, wrapper);
};

frappe.pages["billing"].on_page_show = function (wrapper) {
	if (wrapper.billing) {
		wrapper.billing.refresh();
	}
};

frappe.provide("zivvy");

zivvy.BillingPage = class BillingPage {
	constructor(page, wrapper) {
		this.page = page;
		this.wrapper = $(wrapper).find(".layout-main-section");
		this.page.set_secondary_action(__("Refresh"), () => this.refresh());
		this.refresh();
	}

	refresh() {
		this.wrapper.empty().html(`
			<div class="zivvy-billing-loading text-muted">
				${__("Loading your billing workspace…")}
			</div>
		`);
		frappe
			.call("zivvy_brand.billing.api.get_billing_status")
			.then((r) => this.render(r.message || {}))
			.catch(() => {
				this.wrapper.html(
					`<div class="zivvy-billing-error-state">
						<h3>${__("Billing data unavailable right now")}</h3>
						<p>${__(
							"We could not load billing details. Your subscription has not changed. Please retry in a few seconds."
						)}</p>
						<button class="btn btn-primary btn-sm" id="zivvy-billing-retry">${__("Retry")}</button>
					</div>`
				);
				this.wrapper.find("#zivvy-billing-retry").on("click", () => this.refresh());
			});
	}

	render(data) {
		const polar = data.polar || {};
		const pricing = data.pricing || {};
		const tier = (data.tier || "free").toLowerCase();
		const status = (data.status || "none").toLowerCase();
		const statusLabel = frappe.utils.escape_html(data.status || __("none"));
		const seatsUsed = Number(data.seats_used || 0);
		const seatsAllowed = Number(data.seats_allowed || 0);
		const seatPct =
			seatsAllowed > 0
				? Math.max(0, Math.min(100, Math.round((seatsUsed / seatsAllowed) * 100)))
				: 0;
		const periodEnd = this._formatDate(data.current_period_end);
		const lastSynced = this._formatDateTime(data.last_synced_at);
		const datacenter = frappe.utils.escape_html(
			data.datacenter_label || data.datacenter || __("Not set")
		);
		const tenantId = frappe.utils.escape_html(data.tenant_id || __("Unknown"));
		const canCheckout = !!polar.configured;
		const hasPortalLink = !!data.polar_customer_id;
		const hasPaidTier = tier === "pro" || tier === "business";
		const planHint =
			tier === "free"
				? __(
						"Free plan active. Upgrade to Pro or Business when you need paid inventory/barcode or deeper finance workflows."
				  )
				: __(
						"Paid plan active. Manage seats, invoices, and payment method from this workspace."
				  );
		const setupWarn = !polar.configured
			? `<div class="zivvy-billing-alert alert alert-warning">
				<strong>${__("Checkout temporarily unavailable")}</strong>
				${__(
					"Billing provider configuration is incomplete. Your current plan remains active; upgrades will work once setup is restored."
				)}
			</div>`
			: "";
		const portalState = !polar.configured
			? __(
					"Portal is unavailable until billing provider setup is complete. Existing access remains unchanged."
			  )
			: hasPortalLink
				? __(
						"Portal is ready. Use Manage billing for invoices, payment methods, and subscription updates."
				  )
				: __(
						"Portal becomes available after your first successful Pro or Business checkout."
				  );
		const renewalMeta = periodEnd
			? status === "canceled" || status === "cancelled" || data.cancel_at_period_end
				? __("Access ends on {0}").replace("{0}", frappe.utils.escape_html(periodEnd))
				: __("Renews on {0}").replace("{0}", frappe.utils.escape_html(periodEnd))
			: __("Renewal date will appear after subscription sync.");

		const cards = ["free", "pro", "business"]
			.map((code) => {
				const p = pricing[code] || {};
				const current = data.tier === code;
				const price =
					code === "free"
						? __("$0")
						: __("${0} / user / month").replace("${0}", p.price_usd);
				const features = (p.features || [])
					.map((f) => `<li>${frappe.utils.escape_html(f)}</li>`)
					.join("");
				const barcodeCopy =
					code === "free"
						? __("Barcode workflows blocked")
						: __("Barcode workflows included");
				let actions = "";
				if (code === "pro" || code === "business") {
					actions = `<button class="btn btn-primary btn-sm zivvy-upgrade-btn" data-plan="${code}" ${
						!canCheckout ? "disabled" : ""
					}>${
						current
							? __("Manage seats / renewal")
							: __("Upgrade to {0}").replace("{0}", p.label || code)
					}</button>`;
				} else {
					actions = current
						? `<span class="indicator-pill green">${__("Current plan")}</span>`
						: `<a class="btn btn-default btn-sm" href="/login#signup">${__("Create free workspace")}</a>`;
				}
				return `
				<div class="zivvy-plan-card ${current ? "is-current" : ""}">
					<div class="zivvy-plan-card__head">
						<h3>${frappe.utils.escape_html(p.label || code)}</h3>
						${current ? `<span class="indicator-pill blue">${__("Active")}</span>` : ""}
					</div>
					<p class="zivvy-plan-price">${price}</p>
					<p class="zivvy-plan-gate">${frappe.utils.escape_html(barcodeCopy)}</p>
					<ul class="zivvy-plan-features">${features}</ul>
					<div class="zivvy-plan-actions">${actions}</div>
				</div>`;
			})
			.join("");
		const currencyNote = frappe.utils.escape_html(
			data.pricing_currency_note ||
				__("Displayed pricing is USD reference. Final currency appears in checkout.")
		);

		this.wrapper.html(`
			<div class="zivvy-billing-shell">
				${setupWarn}
				<section class="zivvy-billing-top">
					<div class="zivvy-billing-top__main">
						<p class="zivvy-billing-top__eyebrow">${__("Billing workspace")}</p>
						<h2>${__("Manage plan, seats, and upgrades safely")}</h2>
						<p>${frappe.utils.escape_html(planHint)}</p>
					</div>
					<div class="zivvy-billing-actions">
						<button class="btn btn-default btn-sm" id="zivvy-manage-billing" ${
							!canCheckout ? "disabled" : ""
						}>
							${__("Manage billing")}
						</button>
						<a class="btn btn-default btn-sm" href="/pricing" target="_blank">${__("Public pricing")}</a>
						${
							data.can_manage_polar
								? `<a class="btn btn-default btn-sm" href="/app/polar-settings">${__("Polar Settings")}</a>`
								: ""
						}
					</div>
				</section>
				<section class="zivvy-billing-summary">
					<div class="zivvy-billing-summary__item">
						<div class="zivvy-billing-summary__label">${__("Current plan")}</div>
						<div class="zivvy-billing-tier">${frappe.utils.escape_html(data.tier_label || data.tier)}</div>
						<div class="zivvy-billing-summary__meta">${__("Status")}: ${statusLabel}</div>
					</div>
					<div class="zivvy-billing-summary__item">
						<div class="zivvy-billing-summary__label">${__("Subscription lifecycle")}</div>
						<div class="zivvy-billing-summary__value">${frappe.utils.escape_html(renewalMeta)}</div>
						<div class="zivvy-billing-summary__meta">${__(
							"Dates are updated from checkout/webhook sync."
						)}</div>
					</div>
					<div class="zivvy-billing-summary__item">
						<div class="zivvy-billing-summary__label">${__("Workspace")}</div>
						<div class="zivvy-billing-summary__value">${tenantId}</div>
						<div class="zivvy-billing-summary__meta">${__("Datacenter preference")}: ${datacenter}</div>
					</div>
				</section>
				<section class="zivvy-billing-seatbar">
					<div class="zivvy-billing-seatbar__head">
						<strong>${__("Seat usage")}</strong>
						<span>${seatsUsed} / ${seatsAllowed}</span>
					</div>
					<div class="zivvy-billing-seatbar__track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${seatPct}">
						<div class="zivvy-billing-seatbar__fill" style="width:${seatPct}%;"></div>
					</div>
					<p class="zivvy-billing-seatbar__meta">${__(
						"Billable system users versus seat allowance for this tenant."
					)}</p>
				</section>
				<section class="zivvy-billing-state-grid">
					<article class="zivvy-billing-state-card">
						<h4>${__("Portal status")}</h4>
						<p>${frappe.utils.escape_html(portalState)}</p>
					</article>
					<article class="zivvy-billing-state-card">
						<h4>${__("Sync status")}</h4>
						<p>${
							lastSynced
								? __("Last synced: {0}").replace(
										"{0}",
										frappe.utils.escape_html(lastSynced)
								  )
								: __("Waiting for latest billing sync event.")
						}</p>
					</article>
				</section>
				<section class="zivvy-plan-grid">${cards}</section>
				<p class="text-muted" style="margin: 0.2rem 0 0.9rem;">${currencyNote}</p>
				${
					data.can_manage_polar
						? `<section class="zivvy-billing-meta">
					<h4>${__("Polar sync diagnostics")}</h4>
					<code class="zivvy-webhook-url">${frappe.utils.escape_html(polar.webhook_url || "")}</code>
					<p class="text-muted" style="margin-top:0.75rem;">
						${__("Sandbox")}: ${polar.use_sandbox ? __("Yes") : __("No")} ·
						${__("Pro product")}: ${polar.has_pro_product ? __("set") : __("missing")} ·
						${__("Business product")}: ${polar.has_business_product ? __("set") : __("missing")} ·
						${__("Webhook secret")}: ${polar.has_webhook_secret ? __("set") : __("missing")}
					</p>
				</section>`
						: ""
				}
			</div>
		`);

		this.wrapper.find(".zivvy-upgrade-btn").on("click", (e) => {
			const plan = $(e.currentTarget).data("plan");
			this.promptCheckout(plan);
		});
		this.wrapper.find("#zivvy-manage-billing").on("click", () => this.openPortal());
	}

	promptCheckout(plan) {
		const fields = [
			{
				fieldname: "billing",
				fieldtype: "Select",
				label: __("Billing period"),
				options: ["monthly", "annual"].join("\n"),
				default: "monthly",
				reqd: 1,
			},
			{
				fieldname: "discount_code",
				fieldtype: "Data",
				label: __("Promo code (optional)"),
				description: __(
					"Partner codes such as ActimiXYZ. Leave blank to enter Polar codes (e.g. ActimiTrial) on checkout."
				),
			},
		];
		frappe.prompt(
			fields,
			(values) => {
				this.startCheckout(plan, values.billing, values.discount_code);
			},
			__("Start {0} checkout").replace("{0}", String(plan || "").toUpperCase()),
			__("Continue")
		);
	}

	startCheckout(plan, billing, discount_code) {
		const args = { plan, billing: billing || "monthly" };
		if (discount_code) {
			args.discount_code = discount_code;
		}
		frappe.call({
			method: "zivvy_brand.billing.api.create_checkout",
			args,
			freeze: true,
			freeze_message: __("Creating Polar checkout…"),
			callback: (r) => {
				const url = r.message && r.message.url;
				if (url) {
					window.location.href = url;
				} else {
					frappe.msgprint(__("No checkout URL returned."));
				}
			},
			error: (err) => {
				frappe.msgprint({
					title: __("Checkout unavailable"),
					indicator: "orange",
					message:
						this._errorMessage(err) ||
						__(
							"Could not create checkout right now. Please retry in a minute."
						),
				});
			},
		});
	}

	openPortal() {
		frappe.call({
			method: "zivvy_brand.billing.api.create_portal_session",
			freeze: true,
			freeze_message: __("Opening Polar portal…"),
			callback: (r) => {
				const payload = r.message || {};
				const url = payload.url;
				if (url) {
					window.open(url, "_blank", "noopener");
					return;
				}
				if (payload.requires_checkout) {
					frappe.msgprint({
						title: __("Complete first checkout"),
						indicator: "orange",
						message:
							payload.message ||
							__(
								"Complete one Pro or Business checkout, then return to Manage billing."
							),
					});
					return;
				}
				frappe.msgprint({
					title: __("Portal unavailable"),
					indicator: "orange",
					message: __(
						"Billing portal is temporarily unavailable. Your subscription remains unchanged; please retry shortly."
					),
				});
			},
			error: (err) => {
				frappe.msgprint({
					title: __("Portal unavailable"),
					indicator: "orange",
					message:
						this._errorMessage(err) ||
						__(
							"Billing portal is temporarily unavailable. Your subscription remains unchanged; please retry shortly."
						),
				});
			},
		});
	}

	_formatDate(value) {
		if (!value) return "";
		try {
			if (frappe.datetime && frappe.datetime.str_to_user) {
				return frappe.datetime.str_to_user(value);
			}
		} catch (e) {}
		return String(value);
	}

	_formatDateTime(value) {
		if (!value) return "";
		const asDate = this._formatDate(value);
		return asDate;
	}

	_errorMessage(err) {
		if (!err) return "";
		const msg = err.message || err._server_messages || "";
		if (typeof msg === "string" && msg.trim()) {
			// Hide noisy JSON-like payloads from end users.
			if (msg.includes("{") && msg.includes("}")) return "";
			return msg;
		}
		return "";
	}
};
