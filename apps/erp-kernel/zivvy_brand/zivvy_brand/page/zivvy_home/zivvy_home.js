// Copyright (c) 2026, Vestcodes — MIT
frappe.pages["zivvy-home"].on_page_load = function (wrapper) {
	const page = frappe.ui.make_app_page({
		parent: wrapper,
		title: __("Zivvy Home"),
		single_column: true,
	});
	wrapper.zivvy_home = new zivvy.ZivvyHomeWorkspace(page, wrapper);
};

frappe.pages["zivvy-home"].on_page_show = function (wrapper) {
	if (wrapper.zivvy_home) {
		wrapper.zivvy_home.refresh();
	}
};

frappe.provide("zivvy");

zivvy.ZivvyHomeWorkspace = class ZivvyHomeWorkspace {
	constructor(page, wrapper) {
		this.page = page;
		this.wrapper = $(wrapper).find(".layout-main-section");
		this.page.set_secondary_action(__("Refresh"), () => this.refresh());
		this.refresh();
	}

	refresh() {
		this.wrapper.html(
			`<div class="text-muted" style="padding:1.25rem;">${__("Loading workspace…")}</div>`
		);
		frappe
			.call("zivvy_brand.billing.api.get_my_plan")
			.then((r) => this.render(r.message || {}))
			.catch(() => {
				this.wrapper.html(
					`<div class="text-danger" style="padding:1.25rem;">${__(
						"Could not load your Zivvy workspace right now."
					)}</div>`
				);
			});
	}

	render(data) {
		const esc = frappe.utils.escape_html;
		const tenant = data.tenant || {};
		const tier = (data.tier || "free").toLowerCase();
		const canFinance = tier === "pro" || tier === "business";
		const seatsUsed = Number(data.seats_used || 0);
		const seatsAllowed = Number(data.seats_allowed || 0);
		const seatTight = seatsAllowed > 0 && seatsUsed >= seatsAllowed;
		const tenantLabel =
			tenant.tenant_name || tenant.name || tenant.slug || data.tenant_id || __("Your workspace");

		const financeCard = canFinance
			? `<a class="btn btn-primary btn-sm" data-route="zivvy-finance">${__("Open finance")}</a>`
			: `<a class="btn btn-default btn-sm" data-route="billing">${__("Upgrade to unlock")}</a>`;

		const upgradeBanner =
			tier === "free"
				? `<div class="zivvy-upgrade-banner">
					<strong>${__("Free plan active.")}</strong>
					${__(
						"Upgrade to Pro to unlock finance, stock workflows, and paid inventory barcode features."
					)}
				</div>`
				: "";

		this.wrapper.html(`
			<div class="zivvy-workspace">
				<div class="zivvy-workspace__intro">
					<div>
						<div class="zivvy-workspace__title">${esc(tenantLabel)}</div>
						<div class="zivvy-workspace__subtitle">
							${__("Plan")}: <strong>${esc(data.tier_label || tier)}</strong> ·
							${__("Seats")}: <strong>${seatsUsed}/${seatsAllowed}</strong>
						</div>
					</div>
					<div class="zivvy-ws-actions">
						<a class="btn btn-default btn-sm" data-route="zivvy-team">${__("Team")}</a>
						<a class="btn btn-default btn-sm" data-route="billing">${__("Billing")}</a>
						<a class="btn btn-default btn-sm" data-route="my-settings">${__("Settings")}</a>
					</div>
				</div>
				${upgradeBanner}
				<div class="zivvy-workspace-grid">
					<section class="zivvy-ws-card">
						<h4>${__("Get started checklist")}</h4>
						<ol class="zivvy-checklist">
							<li>${__("Review company profile and default workspace settings.")}</li>
							<li>${__("Invite teammates and confirm seat usage.")}</li>
							<li>${__("Connect billing before enabling Pro or Business workflows.")}</li>
						</ol>
						<div class="zivvy-ws-actions" style="margin-top:0.6rem;">
							<a class="btn btn-default btn-sm" data-route="zivvy-team">${__("Invite team")}</a>
							<a class="btn btn-default btn-sm" data-route="billing">${__("Manage billing")}</a>
						</div>
					</section>
					<section class="zivvy-ws-card">
						<h4>${__("Sales CRM")}</h4>
						<p>${__("Leads, pipeline, customers, and day-to-day selling workflows.")}</p>
						<div class="zivvy-ws-actions">
							<a class="btn btn-primary btn-sm" data-route="zivvy-sales">${__("Open sales")}</a>
						</div>
					</section>
					<section class="zivvy-ws-card">
						<h4>${__("Finance")}</h4>
						<p>${
							canFinance
								? __("Accounting, invoicing, payments, and banking workflows.")
								: __("Available on Pro and Business plans.")
						}</p>
						<div class="zivvy-ws-actions">${financeCard}</div>
					</section>
					<section class="zivvy-ws-card">
						<h4>${__("Team & seats")}</h4>
						<p>${
							seatTight
								? __("Seat cap reached. Disable a user or upgrade to add more seats.")
								: __("Manage tenant-scoped users and seat usage.")
						}</p>
						<div class="zivvy-ws-actions">
							<a class="btn btn-default btn-sm" data-route="zivvy-team">${__("Open team workspace")}</a>
						</div>
					</section>
				</div>
			</div>
		`);

		this.wrapper.find("[data-route]").on("click", (e) => {
			e.preventDefault();
			const route = $(e.currentTarget).data("route");
			if (route) {
				frappe.set_route(route);
			}
		});
	}
};
