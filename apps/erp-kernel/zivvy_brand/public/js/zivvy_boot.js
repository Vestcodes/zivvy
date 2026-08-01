/**
 * Desk branding scrub: Zivvy About dialog, strip Frappe/ERPNext chrome links,
 * kill Frappe product ads in list sidebars. Soft-land away from User list
 * when the user lacks System Manager.
 */
(() => {
	const FRAPPE_HREF =
		'a[href*="frappe.io"], a[href*="frappeframework.com"], a[href*="discuss.frappe.io"], a[href*="docs.erpnext.com"], a[href*="erpnext.com"], a[href*="frappe.cloud"], a[href*="github.com/frappe"], a[href*="frappetech"], a[href*="linkedin.com/company/frappe"]';

	const hideEl = (el) => {
		if (!el || el.dataset.zivvyBrandHidden === "1") return;
		el.dataset.zivvyBrandHidden = "1";
		el.style.setProperty("display", "none", "important");
	};

	const stripFrappeLinks = () => {
		document.querySelectorAll(FRAPPE_HREF).forEach((el) => {
			const item =
				el.closest(
					".dropdown-item, li, .menu-item-label, .sidebar-action, .form-sidebar .sidebar-menu, .list-sidebar .sidebar-action, .banner, .alert"
				) || el;
			hideEl(item);
		});

		// Frappe Insights / CRM / Helpdesk promo banners
		document
			.querySelectorAll(
				".list-sidebar .sidebar-action, .list-sidebar .frappe-banner, .workspace-sidebar .sidebar-action"
			)
			.forEach((el) => {
				const t = (el.textContent || "").toLowerCase();
				if (
					t.includes("frappe insights") ||
					t.includes("frappe crm") ||
					t.includes("frappe helpdesk") ||
					t.includes("switch to frappe") ||
					t.includes("upgrade your support")
				) {
					hideEl(el);
				}
			});

		// Apps switcher: hide raw Frappe / ERPNext tiles (keep Zivvy)
		document
			.querySelectorAll(".apps-list .app-item, .app-switcher .app-item, .app-switcher-dropdown .app-item")
			.forEach((el) => {
				const t = (el.textContent || "").toLowerCase();
				if (
					(t.includes("erpnext") || t.includes("frappe")) &&
					!t.includes("zivvy")
				) {
					hideEl(el);
				}
			});
	};

	const rewriteBrandLabel = (raw) => {
		const text = String(raw || "").trim();
		const lower = text.toLowerCase();
		if (!text) return text;
		if (lower === "erpnext settings") return "Workspace Settings";
		if (lower === "erpnext integrations") return "Zivvy Integrations";
		if (lower === "about erpnext" || lower === "about frappe") return "About Zivvy";
		if (lower === "erpnext" || lower === "frappe") return "Zivvy";
		if (lower === "frappe framework") return "Zivvy Platform";
		if (lower.includes("erpnext")) return text.replace(/erpnext/gi, "Zivvy");
		if (lower.includes("frappe")) return text.replace(/frappe/gi, "Zivvy");
		return text;
	};

	const softLandFromUsers = () => {
		if (typeof frappe === "undefined" || !frappe.get_route) return;
		const route = frappe.get_route();
		if (!route || !route.length) return;
		const isUserList =
			(route[0] === "List" && route[1] === "User") ||
			(route[0] === "Form" && route[1] === "User") ||
			(route[0] === "users" && !route[1]);
		if (!isUserList) return;
		const roles = (frappe.boot && frappe.boot.user && frappe.boot.user.roles) || [];
		const userType =
			(frappe.boot && frappe.boot.user && frappe.boot.user.user_type) || "System User";
		const isDeskUser =
			userType === "System User" ||
			roles.includes("System Manager") ||
			roles.includes("Administrator");
		// Tenant admins can manage scoped users from Team workspace.
		if (isDeskUser) return;
		frappe.set_route("zivvy-home");
	};

	const zivvyAbout = () => {
		if (frappe.ui.misc.about_dialog) {
			frappe.ui.misc.about_dialog.show();
			return;
		}

		const dialog = new frappe.ui.Dialog({ title: __("About Zivvy") });
		$(dialog.body).html(
			`<div class="zivvy-about">
				<p>${__("CRM and operations for growing teams — by Vestcodes Co.")}</p>
				<p>
					<i class="fa fa-globe fa-fw"></i>
					${__("Website")}:
					<a href="https://zivvy.xyz" target="_blank" rel="noopener">https://zivvy.xyz</a>
				</p>
				<p>
					<i class="fa fa-building fa-fw"></i>
					${__("Company")}:
					<a href="https://vestcodes.com" target="_blank" rel="noopener">Vestcodes Co</a>
				</p>
				<p>
					<i class="fa fa-envelope fa-fw"></i>
					${__("Contact")}:
					<a href="mailto:contact@vestcodes.com">contact@vestcodes.com</a>
				</p>
				<p>
					<i class="fa fa-credit-card fa-fw"></i>
					${__("Billing")}:
					<a href="/app/billing">/app/billing</a>
				</p>
				<hr>
				<p class="text-muted">${__("© Vestcodes Co")}</p>
			</div>`
		);

		frappe.ui.misc.about_dialog = dialog;
		dialog.show();
	};

	const patchAbout = () => {
		if (typeof frappe === "undefined") return;
		frappe.provide("frappe.ui.misc");
		frappe.provide("frappe.ui.toolbar");
		frappe.ui.misc.about = zivvyAbout;
		frappe.ui.toolbar.show_about = function () {
			try {
				zivvyAbout();
			} catch (e) {
				console.log(e);
			}
			return false;
		};
	};

	const patchSidebarAds = () => {
		if (typeof frappe === "undefined" || !frappe.views || !frappe.views.ListSidebar) return;
		const proto = frappe.views.ListSidebar.prototype;
		["add_insights_banner", "add_crm_banner", "add_helpdesk_banner"].forEach((fn) => {
			if (typeof proto[fn] === "function") {
				proto[fn] = function () {};
			}
		});
	};

	const scrubBrandText = () => {
		document
			.querySelectorAll(
				".module-link, .module-item, .standard-sidebar-item, .sidebar-item-label, .app-item, .menu-item-label, .title-text, .page-title, .dropdown-item, .breadcrumb-item, .awesomplete ul li, .search-result"
			)
			.forEach((el) => {
				const raw = (el.textContent || "").trim();
				if (!raw || raw.length > 64) return;
				const replaced = rewriteBrandLabel(raw);
				if (replaced !== raw) {
					el.textContent = replaced;
				}
			});
	};

	const boot = () => {
		patchAbout();
		patchSidebarAds();
		stripFrappeLinks();
		scrubBrandText();
		softLandFromUsers();
	};

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", boot);
	} else {
		boot();
	}

	// Desk loads async — re-patch after frappe is ready
	const waitFrappe = () => {
		if (typeof frappe !== "undefined" && frappe.ready) {
			frappe.ready(boot);
		} else {
			setTimeout(waitFrappe, 50);
		}
	};
	waitFrappe();

	if (typeof frappe !== "undefined" && frappe.router && frappe.router.on) {
		frappe.router.on("change", () => setTimeout(boot, 50));
	}

	// Catch late-injected help / banner nodes
	try {
		const obs = new MutationObserver(() => {
			stripFrappeLinks();
			scrubBrandText();
		});
		obs.observe(document.documentElement, { childList: true, subtree: true });
	} catch (e) {
		/* ignore */
	}
})();
