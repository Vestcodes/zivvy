/**
 * Desk route / doctype guards + upgrade modal for plan-gated features.
 */
(() => {
	const getZivvy = () => (window.frappe && frappe.boot && frappe.boot.zivvy) || null;

	const showUpgradeModal = (requiredTier, featureLabel) => {
		const z = getZivvy();
		const label = (requiredTier || "pro").replace(/^\w/, (c) => c.toUpperCase());
		const feature = featureLabel || __("This feature");
		const d = new frappe.ui.Dialog({
			title: __("Upgrade required"),
			fields: [
				{
					fieldtype: "HTML",
					options: `
						<div style="line-height:1.55;">
							<p><strong>${frappe.utils.escape_html(feature)}</strong>
							${__("requires the")} <strong>${frappe.utils.escape_html(label)}</strong> ${__("plan.")}</p>
							<p class="text-muted">${__(
								"You are currently on {0}."
							).replace("{0}", (z && z.tier_label) || __("Free"))}</p>
						</div>
					`,
				},
			],
			primary_action_label: __("View plans"),
			primary_action: () => {
				d.hide();
				frappe.set_route("billing");
			},
			secondary_action_label: __("Pricing page"),
			secondary_action: () => {
				window.open("/pricing", "_blank", "noopener");
			},
		});
		d.show();
	};

	const isDoctypeBlocked = (doctype) => {
		const z = getZivvy();
		if (!z || !doctype) return false;
		return (z.blocked_doctypes || []).includes(doctype);
	};

	const isModuleBlocked = (module) => {
		const z = getZivvy();
		if (!z || !module) return false;
		return (z.blocked_modules || []).includes(module);
	};

	const guardRoute = () => {
		const z = getZivvy();
		if (!z || !frappe.get_route) return;
		const route = frappe.get_route();
		if (!route || !route.length) return;

		// Form / List: ["Form", "Sales Invoice", ...] or ["List", "Employee"]
		if ((route[0] === "Form" || route[0] === "List" || route[0] === "Tree") && route[1]) {
			if (isDoctypeBlocked(route[1])) {
				frappe.set_route("billing");
				showUpgradeModal(
					(z.doctype_min_tier && z.doctype_min_tier[route[1]]) || "pro",
					route[1]
				);
			}
		}
	};

	const patchNewDoc = () => {
		if (!window.frappe || !frappe.new_doc || frappe.new_doc.__zivvy_patched) return;
		const original = frappe.new_doc;
		frappe.new_doc = function (doctype, ...rest) {
			if (isDoctypeBlocked(doctype)) {
				const z = getZivvy();
				showUpgradeModal(
					(z && z.doctype_min_tier && z.doctype_min_tier[doctype]) || "pro",
					doctype
				);
				return;
			}
			return original.call(this, doctype, ...rest);
		};
		frappe.new_doc.__zivvy_patched = true;
	};

	const injectPriorityBadge = () => {
		const z = getZivvy();
		if (!z || !z.priority_support) return;
		const brand = document.querySelector(".navbar .navbar-brand, .navbar-brand");
		if (!brand || brand.querySelector(".zivvy-priority-badge")) return;
		const badge = document.createElement("span");
		badge.className = "zivvy-priority-badge";
		badge.textContent = __("Priority support");
		brand.appendChild(badge);
	};

	const showSeatBanner = () => {
		const z = getZivvy();
		if (!z || z.seats_used < z.seats_allowed) return;
		if (sessionStorage.getItem("zivvy_seat_banner")) return;
		frappe.show_alert(
			{
				message: __(
					"You have reached your seat limit ({0}/{1}). Upgrade or manage users in Billing."
				)
					.replace("{0}", z.seats_used)
					.replace("{1}", z.seats_allowed),
				indicator: "orange",
			},
			8
		);
		sessionStorage.setItem("zivvy_seat_banner", "1");
	};

	const boot = () => {
		if (!window.frappe) return;
		patchNewDoc();
		injectPriorityBadge();
		showSeatBanner();
		guardRoute();
		if (frappe.router && frappe.router.on) {
			frappe.router.on("change", () => setTimeout(guardRoute, 30));
		}
	};

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", boot);
	} else {
		boot();
	}

	window.zivvyShowUpgradeModal = showUpgradeModal;
})();
