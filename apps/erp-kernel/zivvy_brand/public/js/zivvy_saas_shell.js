/**
 * Zivvy SaaS shell: focused desk navigation + onboarding + ERP clutter reduction.
 */
(() => {
	const getZivvy = () => (window.frappe && frappe.boot && frappe.boot.zivvy) || {};

	const routeKey = () => {
		if (!window.frappe || !frappe.get_route) return "";
		const route = frappe.get_route() || [];
		return (route[0] || "").toString().trim().toLowerCase();
	};

	const currentUser = () => {
		return (frappe.boot && frappe.boot.user && frappe.boot.user.name) || "";
	};

	const currentRoles = () => {
		return (frappe.boot && frappe.boot.user && frappe.boot.user.roles) || [];
	};

	const isOps = () => {
		const roles = currentRoles();
		return roles.includes("System Manager") || roles.includes("Administrator");
	};

	const isTierAtLeast = (tier, required) => {
		const rank = { free: 0, pro: 1, business: 2 };
		const a = rank[(tier || "free").toLowerCase()] || 0;
		const b = rank[(required || "free").toLowerCase()] || 0;
		return a >= b;
	};

	const allowedRoutes = () => {
		const tier = (getZivvy().tier || "free").toLowerCase();
		const base = new Set([
			"zivvy-home",
			"zivvy-sales",
			"zivvy-team",
			"billing",
			"my-settings",
			"help",
		]);
		if (isTierAtLeast(tier, "pro")) {
			base.add("zivvy-finance");
		}
		return base;
	};

	const allowedRoutePrefixes = () => {
		const tier = (getZivvy().tier || "free").toLowerCase();
		const prefixes = [
			"lead",
			"opportunity",
			"customer",
			"contact",
			"quotation",
			"sales-order",
			"sales-invoice",
			"item",
			"user",
		];
		if (isTierAtLeast(tier, "pro")) {
			prefixes.push(
				"purchase-invoice",
				"payment-entry",
				"journal-entry",
				"bank-transaction",
				"account"
			);
		}
		return prefixes;
	};

	const INTERNAL_ROUTE_BLOCKLIST = new Set([
		"doctype",
		"module-def",
		"workspace",
		"installed-applications",
		"server-script",
		"custom-field",
		"property-setter",
		"scheduled-job-type",
		"access-log",
		"error-log",
	]);

	const shouldKeepRoute = (route) => {
		if (!route) return false;
		const keep = allowedRoutes();
		if (keep.has(route)) return true;
		return allowedRoutePrefixes().some((prefix) => route.startsWith(prefix));
	};

	const hideItem = (el) => {
		if (!el || el.classList.contains("zivvy-shell-nav")) return;
		el.classList.add("zivvy-shell-hide");
	};

	const showItem = (el) => {
		if (!el) return;
		el.classList.remove("zivvy-shell-hide");
	};

	const routeFromHref = (href) => {
		if (!href) return "";
		try {
			const u = new URL(href, window.location.origin);
			if (!u.pathname.startsWith("/app")) return "";
			const seg = (u.pathname.split("/")[2] || "").toLowerCase();
			return seg;
		} catch (_) {
			return "";
		}
	};

	const navItems = () => {
		const z = getZivvy();
		const canFinance = isTierAtLeast(z.tier || "free", "pro");
		const items = [
			{ route: "zivvy-home", label: __("Overview") },
			{ route: "zivvy-sales", label: __("Sales") },
		];
		if (canFinance) {
			items.push({ route: "zivvy-finance", label: __("Finance") });
		}
		items.push(
			{ route: "zivvy-team", label: __("Team") },
			{ route: "billing", label: __("Billing") },
			{ route: "my-settings", label: __("Settings") },
			{ route: "help", label: __("Help") }
		);
		return items;
	};

	const renderShellNav = () => {
		const holder =
			document.querySelector(".layout-side-section .desk-sidebar") ||
			document.querySelector(".layout-side-section");
		if (!holder) return;
		let nav = holder.querySelector(".zivvy-shell-nav");
		if (!nav) {
			nav = document.createElement("div");
			nav.className = "zivvy-shell-nav";
			holder.prepend(nav);
		}
		const active = routeKey();
		nav.innerHTML = `
			<div class="zivvy-shell-nav__label">Zivvy</div>
			${navItems()
				.map((item) => {
					const isActive = active === item.route;
					return `<a class="zivvy-shell-link ${
						isActive ? "is-active" : ""
					}" href="/app/${item.route}" data-route="${item.route}">
						<span>${frappe.utils.escape_html(item.label)}</span>
					</a>`;
				})
				.join("")}
		`;
	};

	const filterSidebar = () => {
		const anchors = document.querySelectorAll(
			".layout-side-section a[href^='/app/'], .desk-sidebar a[href^='/app/']"
		);
		anchors.forEach((a) => {
			const route = routeFromHref(a.getAttribute("href"));
			const row =
				a.closest(
					".standard-sidebar-item, .sidebar-item-container, .desk-sidebar-item, li"
				) || a;
			if (!route || shouldKeepRoute(route)) showItem(row);
			else hideItem(row);
		});
	};

	const filterAppSwitcher = () => {
		document
			.querySelectorAll(
				".apps-list .app-item, .app-switcher .app-item, .app-switcher-dropdown .app-item"
			)
			.forEach((el) => {
				const t = (el.textContent || "").toLowerCase();
				if (t.includes("zivvy")) showItem(el);
				else hideItem(el);
			});
	};

	const scrubSearchResults = () => {
		const blockedTerms = [
			"frappe cloud",
			"frappe crm",
			"frappe helpdesk",
			"erpnext",
			"module def",
			"installed application",
			"server script",
		];
		document
			.querySelectorAll(".search-dialog .search-result, .awesomplete ul li")
			.forEach((el) => {
				const txt = (el.textContent || "").toLowerCase();
				if (blockedTerms.some((term) => txt.includes(term))) {
					hideItem(el);
				}
			});
	};

	let _routeGuardBusy = false;
	const guardRoutes = () => {
		if (_routeGuardBusy || !window.frappe || !frappe.get_route) return;
		if (window.location.pathname === "/app" || window.location.pathname === "/app/home") {
			_routeGuardBusy = true;
			frappe.set_route("zivvy-home");
			setTimeout(() => (_routeGuardBusy = false), 100);
			return;
		}
		const route = frappe.get_route() || [];
		const key = (route[0] || "").toString().toLowerCase();
		if (!key) return;

		if ((key === "app" || key === "home") && window.location.pathname === "/app") {
			_routeGuardBusy = true;
			frappe.set_route("zivvy-home");
			setTimeout(() => (_routeGuardBusy = false), 100);
			return;
		}

		if (!isOps() && INTERNAL_ROUTE_BLOCKLIST.has(key)) {
			_routeGuardBusy = true;
			frappe.show_alert(
				{
					message: __("This area is not part of the Zivvy SaaS workspace."),
					indicator: "orange",
				},
				6
			);
			frappe.set_route("zivvy-home");
			setTimeout(() => (_routeGuardBusy = false), 100);
			return;
		}

		if (key === "zivvy-finance" && !isTierAtLeast(getZivvy().tier, "pro")) {
			_routeGuardBusy = true;
			if (window.zivvyShowUpgradeModal) {
				window.zivvyShowUpgradeModal("pro", __("Finance workspace"));
			}
			frappe.set_route("billing");
			setTimeout(() => (_routeGuardBusy = false), 100);
		}
	};

	const maybeShowOnboarding = () => {
		if (!window.frappe || !frappe.ui || !frappe.ui.Dialog) return;
		if (isOps()) return;
		const z = getZivvy();
		const tenant = (z.tenant && z.tenant.name) || "";
		const user = currentUser();
		if (!tenant || !user) return;
		const key = `zivvy_onboarding_seen_${tenant}_${user}`;
		if (localStorage.getItem(key) === "1") return;

		const d = new frappe.ui.Dialog({
			title: __("Welcome to Zivvy"),
			fields: [
				{
					fieldtype: "HTML",
					options: `
						<div style="line-height:1.6;">
							<p>${__(
								"Finish these steps to set up your workspace:"
							)}</p>
							<ol style="padding-left: 1.2rem; margin-bottom: 0;">
								<li>${__("Review your workspace profile and company details.")}</li>
								<li>${__("Invite teammates and confirm seats.")}</li>
								<li>${__("Connect billing when you need Pro or Business features.")}</li>
							</ol>
						</div>
					`,
				},
			],
			primary_action_label: __("Open Zivvy Home"),
			primary_action: () => {
				localStorage.setItem(key, "1");
				d.hide();
				frappe.set_route("zivvy-home");
			},
			secondary_action_label: __("Later"),
			secondary_action: () => {
				localStorage.setItem(key, "1");
				d.hide();
			},
		});
		d.show();
	};

	const refreshShell = () => {
		renderShellNav();
		filterSidebar();
		filterAppSwitcher();
		scrubSearchResults();
		guardRoutes();
	};

	let _refreshTimer = null;
	const scheduleRefresh = (delay = 40) => {
		if (_refreshTimer) window.clearTimeout(_refreshTimer);
		_refreshTimer = window.setTimeout(() => {
			_refreshTimer = null;
			refreshShell();
		}, delay);
	};

	const forceDeskLanding = () => {
		const path = window.location.pathname || "";
		if (path === "/app" || path === "/app/home") {
			window.location.replace("/app/zivvy-home");
			return true;
		}
		return false;
	};

	const boot = () => {
		if (forceDeskLanding()) return;
		refreshShell();
		setTimeout(refreshShell, 100);
		setTimeout(refreshShell, 600);
		// Home workspace already contains a persistent checklist; avoid intrusive startup modal.
		if (window.frappe && frappe.router && frappe.router.on) {
			frappe.router.on("change", () => scheduleRefresh(80));
		}
		try {
			const obs = new MutationObserver(() => scheduleRefresh(100));
			obs.observe(document.documentElement, { childList: true, subtree: true });
		} catch (_) {
			/* ignore */
		}
	};

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", boot);
	} else {
		boot();
	}
})();
