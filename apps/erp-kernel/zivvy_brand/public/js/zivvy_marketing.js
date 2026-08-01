/**
 * Marketing shell helpers: mobile nav + contact form + CTA bridge to PostHog.
 */
(() => {
	function initNav() {
		const toggle = document.querySelector("[data-zivvy-nav-toggle]");
		const drawer = document.getElementById("zivvy-nav-drawer");
		if (!toggle || !drawer) return;
		toggle.addEventListener("click", () => {
			const open = toggle.getAttribute("aria-expanded") === "true";
			toggle.setAttribute("aria-expanded", open ? "false" : "true");
			if (open) drawer.setAttribute("hidden", "");
			else drawer.removeAttribute("hidden");
		});
	}

	function track(event, props) {
		document.body.dispatchEvent(
			new CustomEvent("zivvy-track", { detail: { event: event, props: props || {} } })
		);
		if (window.posthog && typeof window.posthog.capture === "function") {
			window.posthog.capture(event, props || {});
		}
	}

	function initCtas() {
		document.addEventListener("click", (e) => {
			const el = e.target.closest("[data-zivvy-event]");
			if (!el) return;
			const name = el.getAttribute("data-zivvy-event");
			if (!name) return;
			track(name, { href: el.getAttribute("href") || "" });
		});

		const pricing = document.querySelector('[data-zivvy-page="pricing"]');
		if (pricing) track("pricing_view", { path: window.location.pathname });
	}

	function csrfToken() {
		if (window.csrf_token) return window.csrf_token;
		if (window.frappe && window.frappe.csrf_token) return window.frappe.csrf_token;
		const meta = document.querySelector('meta[name="csrf-token"]');
		return meta ? meta.getAttribute("content") : "";
	}

	function initContactForm() {
		const form = document.getElementById("zivvy-contact-form");
		if (!form) return;
		const status = document.getElementById("zivvy-contact-status");
		form.addEventListener("submit", async (e) => {
			e.preventDefault();
			if (status) status.textContent = "";
			const btn = form.querySelector('button[type="submit"]');
			if (btn) btn.disabled = true;
			const data = new FormData(form);
			try {
				const res = await fetch("/api/method/zivvy_brand.analytics.contact.submit_contact", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"X-Frappe-CSRF-Token": csrfToken(),
					},
					credentials: "same-origin",
					body: JSON.stringify({
						full_name: data.get("full_name"),
						email: data.get("email"),
						message: data.get("message"),
					}),
				});
				const payload = await res.json();
				if (!res.ok || payload.exc) {
					throw new Error("send failed");
				}
				if (status) status.textContent = "Thanks — we received your message.";
				form.reset();
				track("contact_submit", {});
			} catch (_) {
				if (status) {
					status.textContent = "Could not send right now. Email contact@vestcodes.com instead.";
				}
			} finally {
				if (btn) btn.disabled = false;
			}
		});
	}

	function boot() {
		initNav();
		initCtas();
		initContactForm();
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", boot);
	} else {
		boot();
	}
})();
