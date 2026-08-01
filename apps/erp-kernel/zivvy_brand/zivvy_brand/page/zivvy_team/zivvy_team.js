// Copyright (c) 2026, Vestcodes — MIT
frappe.pages["zivvy-team"].on_page_load = function (wrapper) {
	const page = frappe.ui.make_app_page({
		parent: wrapper,
		title: __("Zivvy Team"),
		single_column: true,
	});
	wrapper.zivvy_team = new zivvy.ZivvyTeamWorkspace(page, wrapper);
};

frappe.pages["zivvy-team"].on_page_show = function (wrapper) {
	if (wrapper.zivvy_team) {
		wrapper.zivvy_team.refresh();
	}
};

frappe.provide("zivvy");

zivvy.ZivvyTeamWorkspace = class ZivvyTeamWorkspace {
	constructor(page, wrapper) {
		this.page = page;
		this.wrapper = $(wrapper).find(".layout-main-section");
		this.page.set_secondary_action(__("Refresh"), () => this.refresh());
		this.refresh();
	}

	refresh() {
		this.wrapper.html(
			`<div class="text-muted" style="padding:1.25rem;">${__("Loading team workspace…")}</div>`
		);
		frappe
			.call("zivvy_brand.billing.api.get_my_plan")
			.then((r) => this.render(r.message || {}))
			.catch(() => {
				this.wrapper.html(
					`<div class="text-danger" style="padding:1.25rem;">${__(
						"Could not load team workspace right now."
					)}</div>`
				);
			});
	}

	render(data) {
		const seatsUsed = Number(data.seats_used || 0);
		const seatsAllowed = Number(data.seats_allowed || 0);
		const capReached = seatsAllowed > 0 && seatsUsed >= seatsAllowed;
		const capWarning = capReached
			? `<div class="alert alert-warning" style="margin-bottom:0.8rem;">
				<strong>${__("Seat limit reached.")}</strong>
				${__(
					"Disable an existing user or upgrade seats in Billing before inviting another teammate."
				)}
			</div>`
			: "";

		this.wrapper.html(`
			<div class="zivvy-workspace">
				<div class="zivvy-workspace__intro">
					<div>
						<div class="zivvy-workspace__title">${__("Team & users")}</div>
						<div class="zivvy-workspace__subtitle">
							${__("Seats in use")}: <strong>${seatsUsed}/${seatsAllowed}</strong>
						</div>
					</div>
					<div class="zivvy-ws-actions">
						<a class="btn btn-default btn-sm" data-route="zivvy-home">${__("Overview")}</a>
						<a class="btn btn-default btn-sm" data-route="billing">${__("Billing")}</a>
					</div>
				</div>
				${capWarning}
				<div class="zivvy-workspace-grid">
					<section class="zivvy-ws-card">
						<h4>${__("Manage workspace users")}</h4>
						<p>${__(
							"Users are tenant-scoped. You only see and manage members in your own workspace."
						)}</p>
						<div class="zivvy-ws-actions">
							<a class="btn btn-primary btn-sm" data-open-list="User">${__(
								"Open user list"
							)}</a>
							<a class="btn btn-default btn-sm" data-new-user="1">${__(
								"Invite user"
							)}</a>
						</div>
					</section>
					<section class="zivvy-ws-card">
						<h4>${__("Seat policy")}</h4>
						<p>${__(
							"Administrator and ops users are excluded from tenant seat billing. Billable seats track enabled system users in your workspace."
						)}</p>
						<div class="zivvy-ws-actions">
							<a class="btn btn-default btn-sm" data-route="billing">${__(
								"Adjust seats"
							)}</a>
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
		this.wrapper.find("[data-open-list]").on("click", (e) => {
			e.preventDefault();
			const doctype = $(e.currentTarget).data("open-list");
			if (doctype) frappe.set_route("List", doctype);
		});
		this.wrapper.find("[data-new-user]").on("click", (e) => {
			e.preventDefault();
			frappe.new_doc("User");
		});
	}
};
