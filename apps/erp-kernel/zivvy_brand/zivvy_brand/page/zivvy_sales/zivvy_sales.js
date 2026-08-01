// Copyright (c) 2026, Vestcodes — MIT
frappe.pages["zivvy-sales"].on_page_load = function (wrapper) {
	const page = frappe.ui.make_app_page({
		parent: wrapper,
		title: __("Zivvy Sales CRM"),
		single_column: true,
	});
	wrapper.zivvy_sales = new zivvy.ZivvySalesWorkspace(page, wrapper);
};

frappe.pages["zivvy-sales"].on_page_show = function (wrapper) {
	if (wrapper.zivvy_sales) {
		wrapper.zivvy_sales.refresh();
	}
};

frappe.provide("zivvy");

zivvy.ZivvySalesWorkspace = class ZivvySalesWorkspace {
	constructor(page, wrapper) {
		this.page = page;
		this.wrapper = $(wrapper).find(".layout-main-section");
		this.page.set_secondary_action(__("Refresh"), () => this.refresh());
		this.refresh();
	}

	refresh() {
		this.wrapper.html(
			`<div class="text-muted" style="padding:1.25rem;">${__("Loading sales workspace…")}</div>`
		);
		frappe
			.call("zivvy_brand.billing.api.get_my_plan")
			.then((r) => this.render(r.message || {}))
			.catch(() => {
				this.wrapper.html(
					`<div class="text-danger" style="padding:1.25rem;">${__(
						"Could not load sales workspace right now."
					)}</div>`
				);
			});
	}

	render(data) {
		const esc = frappe.utils.escape_html;
		const tier = (data.tier || "free").toLowerCase();
		const canFinance = tier === "pro" || tier === "business";

		const quickLinks = [
			["Lead", __("Leads")],
			["Opportunity", __("Opportunities")],
			["Customer", __("Customers")],
			["Quotation", __("Quotations")],
			["Sales Order", __("Sales Orders")],
		];

		this.wrapper.html(`
			<div class="zivvy-workspace">
				<div class="zivvy-workspace__intro">
					<div>
						<div class="zivvy-workspace__title">${__("Sales CRM")}</div>
						<div class="zivvy-workspace__subtitle">
							${__("Plan")}: <strong>${esc(data.tier_label || tier)}</strong>
						</div>
					</div>
					<div class="zivvy-ws-actions">
						<a class="btn btn-default btn-sm" data-route="zivvy-home">${__("Overview")}</a>
						<a class="btn btn-default btn-sm" data-route="zivvy-team">${__("Team")}</a>
						<a class="btn btn-default btn-sm" data-route="billing">${__("Billing")}</a>
					</div>
				</div>
				<div class="zivvy-workspace-grid">
					<section class="zivvy-ws-card">
						<h4>${__("Pipeline workflows")}</h4>
						<p>${__("Run lead capture, qualification, and conversion in one place.")}</p>
						<div class="zivvy-ws-actions">
							${quickLinks
								.map(
									([doctype, label]) =>
										`<a class="btn btn-default btn-sm" data-doctype="${doctype}">${esc(label)}</a>`
								)
								.join("")}
						</div>
					</section>
					<section class="zivvy-ws-card">
						<h4>${__("Next step: finance")}</h4>
						<p>${
							canFinance
								? __(
										"Your plan includes invoicing and payments. Open Finance for accounting workflows."
								  )
								: __(
										"Upgrade to Pro when you need invoicing, payments, and accounting automation."
								  )
						}</p>
						<div class="zivvy-ws-actions">
							${
								canFinance
									? `<a class="btn btn-primary btn-sm" data-route="zivvy-finance">${__(
											"Open finance"
									  )}</a>`
									: `<a class="btn btn-default btn-sm" data-route="billing">${__(
											"Upgrade in billing"
									  )}</a>`
							}
						</div>
					</section>
				</div>
			</div>
		`);

		this.wrapper.find("[data-route]").on("click", (e) => {
			e.preventDefault();
			const route = $(e.currentTarget).data("route");
			if (route) frappe.set_route(route);
		});
		this.wrapper.find("[data-doctype]").on("click", (e) => {
			e.preventDefault();
			const doctype = $(e.currentTarget).data("doctype");
			if (doctype) frappe.set_route("List", doctype);
		});
	}
};
