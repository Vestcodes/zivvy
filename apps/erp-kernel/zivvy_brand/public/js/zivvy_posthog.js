/**
 * PostHog loader — only after analytics cookie consent (zivvy_cookie_consent = all).
 */
(() => {
	const CONSENT_KEY = "zivvy_cookie_consent";
	let loaded = false;
	let configCache = null;

	function readConsent() {
		try {
			const raw = localStorage.getItem(CONSENT_KEY);
			if (!raw) return null;
			const parsed = JSON.parse(raw);
			return parsed && parsed.choice ? parsed.choice : null;
		} catch (_) {
			return null;
		}
	}

	function analyticsAllowed() {
		return readConsent() === "all";
	}

	function isDesk() {
		return /^\/app(\/|$)/.test(window.location.pathname);
	}

	async function fetchConfig() {
		if (configCache) return configCache;
		try {
			const res = await fetch("/api/method/zivvy_brand.analytics.posthog.get_public_config", {
				credentials: "same-origin",
			});
			const payload = await res.json();
			configCache = payload.message || payload;
			return configCache;
		} catch (_) {
			return { enabled: false };
		}
	}

	function injectPostHog(cfg) {
		if (loaded || !cfg || !cfg.enabled || !cfg.api_key) return;
		if (isDesk() && !cfg.enable_on_desk) return;
		loaded = true;

		!(function (t, e) {
			var o, n, p, r;
			e.__SV ||
				((window.posthog = e),
				(e._i = []),
				(e.init = function (i, s, a) {
					function g(t, e) {
						var o = e.split(".");
						2 == o.length && ((t = t[o[0]]), (e = o[1]));
						t[e] = function () {
							t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
						};
					}
					((p = t.createElement("script")).type = "text/javascript"),
						(p.crossOrigin = "anonymous"),
						(p.async = !0),
						(p.src = s.api_host.replace(/\/$/, "") + "/static/array.js"),
						(r = t.getElementsByTagName("script")[0]),
						r.parentNode.insertBefore(p, r);
					var u = e;
					for (
						void 0 !== a ? (u = e[a] = []) : (a = "posthog"),
							u.people = u.people || [],
							u.toString = function (t) {
								var e = "posthog";
								return "posthog" !== a && (e += "." + a), t || (e += " (stub)"), e;
							},
							u.people.toString = function () {
								return u.toString(1) + ".people (stub)";
							},
							o =
								"init capture register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group identify setPersonProperties setPersonPropertiesOnce setGroupPropertiesOnce startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_distinct_id getGroups get_session_id createPersonProfile".split(
									" "
								),
							n = 0;
						n < o.length;
						n++
					)
						g(u, o[n]);
					e._i.push([i, s, a]);
				}),
				(e.__SV = 1));
		})(document, window.posthog || []);

		window.posthog.init(cfg.api_key, {
			api_host: cfg.host,
			person_profiles: "identified_only",
			capture_pageview: true,
			capture_pageleave: true,
		});
	}

	async function maybeLoad() {
		if (!analyticsAllowed()) return;
		const cfg = await fetchConfig();
		injectPostHog(cfg);
	}

	function track(event, props) {
		if (window.posthog && typeof window.posthog.capture === "function") {
			window.posthog.capture(event, props || {});
		}
	}

	document.addEventListener("click", (e) => {
		const el = e.target.closest("[data-zivvy-cta], [data-zivvy-event]");
		if (!el) return;
		const cta = el.getAttribute("data-zivvy-cta") || el.getAttribute("data-zivvy-event");
		if (!cta) return;
		track("cta_click", { cta: cta, href: el.getAttribute("href") || "" });
	});

	document.addEventListener("zivvy-track", (e) => {
		const detail = e.detail || {};
		if (detail.event) track(detail.event, detail.props || {});
	});

	window.addEventListener("zivvy-cookie-consent", (e) => {
		const choice = e.detail && e.detail.choice;
		if (choice === "all") maybeLoad();
	});

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", maybeLoad);
	} else {
		maybeLoad();
	}
})();
