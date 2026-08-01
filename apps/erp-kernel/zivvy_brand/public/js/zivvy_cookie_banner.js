/**
 * Lightweight cookie consent (localStorage). Links to /cookies.
 * choice=all → analytics (PostHog) allowed; essential → no analytics.
 */
(() => {
	const KEY = "zivvy_cookie_consent";

	const emit = (choice) => {
		try {
			window.dispatchEvent(
				new CustomEvent("zivvy:cookie-consent", { detail: { choice } })
			);
		} catch (_) {}
	};

	const existing = (() => {
		try {
			return localStorage.getItem(KEY);
		} catch (_) {
			return null;
		}
	})();

	if (existing) {
		try {
			const parsed = JSON.parse(existing);
			if (parsed && parsed.choice) emit(parsed.choice);
		} catch (_) {}
		return;
	}

	const banner = document.createElement("div");
	banner.className = "zivvy-cookie-banner is-visible";
	banner.setAttribute("role", "dialog");
	banner.setAttribute("aria-label", "Cookie consent");
	banner.innerHTML = `
		<p style="margin:0;">
			We use essential cookies to run Zivvy. Optional analytics help us improve the product.
			See our <a href="/cookies">Cookie Policy</a>.
		</p>
		<div class="zivvy-cookie-banner__actions">
			<button type="button" class="accept" data-choice="all">Accept all</button>
			<button type="button" class="essential" data-choice="essential">Essential only</button>
		</div>
	`;
	const mount = () => document.body.appendChild(banner);
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", mount);
	} else {
		mount();
	}

	banner.addEventListener("click", (e) => {
		const btn = e.target.closest("button[data-choice]");
		if (!btn) return;
		const choice = btn.dataset.choice;
		try {
			localStorage.setItem(KEY, JSON.stringify({ choice, at: Date.now() }));
		} catch (_) {}
		emit(choice);
		banner.remove();
	});
})();
