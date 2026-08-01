// Copyright (c) 2026, Vestcodes — MIT
frappe.pages["zivvy-finance"].on_page_load = function (wrapper) {
	const page = frappe.ui.make_app_page({
		parent: wrapper,
		title: __("Zivvy Finance"),
		single_column: true,
	});
	wrapper.zivvy_finance = new zivvy.ZivvyFinanceWorkspace(page, wrapper);
};

frappe.pages["zivvy-finance"].on_page_show = function (wrapper) {
	if (wrapper.zivvy_finance) {
		wrapper.zivvy_finance.refresh();
	}
};

frappe.provide("zivvy");

zivvy.ZivvyFinanceWorkspace = class ZivvyFinanceWorkspace {
	constructor(page, wrapper) {
		this.page = page;
		this.wrapper = $(wrapper).find(".layout-main-section");
		this.page.set_secondary_action(__("Refresh"), () => this.refresh());
		this.refresh();
	}

	refresh() {
		this.wrapper.html(
			`<div class="text-muted" style="padding:1.25rem;">${__("Loading finance workspace…")}</div>`
		);
		frappe
			.call("zivvy_brand.billing.api.get_my_plan")
			.then((r) => this.render(r.message || {}))
			.catch(() => {
				this.wrapper.html(
					`<div class="text-danger" style="padding:1.25rem;">${__(
						"Could not load finance workspace right now."
					)}</div>`
				);
			});
	}

	render(data) {
		const esc = frappe.utils.escape_html;
		const tier = (data.tier || "free").toLowerCase();
		const canFinance = tier === "pro" || tier === "business";

		if (!canFinance) {
			this.wrapper.html(`
				<div class="zivvy-workspace">
					<div class="zivvy-ws-card">
						<h4>${__("Finance requires Pro or Business")}</h4>
						<p>${__(
							"Upgrade your plan to unlock accounting, invoicing, payments, and banking workflows."
						)}</p>
						<div class="zivvy-ws-actions">
							<a class="btn btn-primary btn-sm" data-route="billing">${__(
								"Upgrade in billing"
							)}</a>
							<a class="btn btn-default btn-sm" data-route="zivvy-home">${__(
								"Back to overview"
							)}</a>
						</div>
					</div>
				</div>
			`);
			this.wrapper.find("[data-route]").on("click", (e) => {
				e.preventDefault();
				frappe.set_route($(e.currentTarget).data("route"));
			});
			return;
		}

		const links = [
			["Sales Invoice", __("Sales Invoices")],
			["Purchase Invoice", __("Purchase Invoices")],
			["Payment Entry", __("Payments")],
			["Journal Entry", __("Journal Entries")],
			["Bank Transaction", __("Bank Transactions")],
		];

		this.wrapper.html(`
			<div class="zivvy-workspace">
				<div class="zivvy-workspace__intro">
					<div>
						<div class="zivvy-workspace__title">${__("Finance")}</div>
						<div class="zivvy-workspace__subtitle">
							${__("Plan")}: <strong>${esc(data.tier_label || tier)}</strong>
						</div>
					</div>
					<div class="zivvy-ws-actions">
						<a class="btn btn-default btn-sm" data-route="zivvy-home">${__("Overview")}</a>
						<a class="btn btn-default btn-sm" data-route="billing">${__("Billing")}</a>
					</div>
				</div>
				<div class="zivvy-workspace-grid">
					<section class="zivvy-ws-card">
						<h4>${__("Core finance workflows")}</h4>
						<p>${__("Open the most-used finance doctypes for daily operations.")}</p>
						<div class="zivvy-ws-actions">
							${links
								.map(
									([doctype, label]) =>
										`<a class="btn btn-default btn-sm" data-doctype="${doctype}">${esc(label)}</a>`
								)
								.join("")}
						</div>
					</section>
					<section class="zivvy-ws-card">
						<h4>${__("Need more scale?")}</h4>
						<p>${
							tier === "business"
								? __("Business plan is active with advanced operations features.")
								: __("Move to Business for advanced manufacturing, quality, and multi-company workflows.")
						}</p>
						<div class="zivvy-ws-actions">
							<a class="btn btn-default btn-sm" data-route="billing">${__("Review plans")}</a>
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
