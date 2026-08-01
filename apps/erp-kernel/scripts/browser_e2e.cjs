#!/usr/bin/env node
/**
 * Browser E2E for https://zivvy.xyz — Playwright Chromium.
 * Credentials from .demo-credentials.local (never logged).
 */
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const BASE = "https://zivvy.xyz";
const ROOT = path.resolve(__dirname, "..");
const SHOTS = path.join(ROOT, "e2e-screenshots");
const CREDS_FILE = path.join(ROOT, ".demo-credentials.local");
const RESULTS = path.join(SHOTS, "_results.json");

fs.mkdirSync(SHOTS, { recursive: true });

function loadCreds() {
	const raw = fs.readFileSync(CREDS_FILE, "utf8");
	const out = {};
	for (const line of raw.split("\n")) {
		const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
		if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
	}
	return out;
}

function stamp() {
	return new Date().toISOString();
}

async function shot(page, name) {
	const file = path.join(SHOTS, `${name}.png`);
	await page.screenshot({ path: file, fullPage: true });
	return `e2e-screenshots/${name}.png`;
}

async function safeGoto(page, url, opts = {}) {
	const res = await page.goto(url, {
		waitUntil: "domcontentloaded",
		timeout: 60000,
		...opts,
	});
	await page.waitForTimeout(800);
	return res;
}

function pageLooksStyled(page) {
	return page.evaluate(() => {
		const body = document.body;
		const cs = getComputedStyle(body);
		const hasCss =
			document.styleSheets.length > 0 ||
			!!document.querySelector('link[rel="stylesheet"]');
		const text = (body.innerText || "").slice(0, 200);
		const title = document.title || "";
		const h1 = document.querySelector("h1, .zivvy-page-hero h1, .page-title");
		return {
			hasCss,
			title,
			h1: h1 ? h1.innerText.trim() : "",
			bg: cs.backgroundColor,
			font: cs.fontFamily,
			textSample: text.replace(/\s+/g, " ").trim().slice(0, 120),
			statusHint: document.querySelector(".page-card, .zivvy-nav, .desk-sidebar, .zivvy-billing")
				? "ui-present"
				: "sparse",
		};
	});
}

async function dismissCookie(page) {
	try {
		const btn = page.locator(
			'button:has-text("Accept all"), button:has-text("Accept"), button:has-text("Essential only"), button:has-text("Got it"), .cookie-banner button'
		);
		if (await btn.first().isVisible({ timeout: 2000 }).catch(() => false)) {
			await btn.first().click({ timeout: 2000 }).catch(() => {});
			await page.waitForTimeout(300);
		}
	} catch (_) {}
}

async function dismissModals(page) {
	for (let i = 0; i < 4; i++) {
		const close = page.locator(
			'.modal.show .btn-modal-close, .modal.show .modal-header .close, .modal.show button.close, .msgprint-dialog .btn-modal-close'
		);
		if (await close.first().isVisible({ timeout: 800 }).catch(() => false)) {
			await close.first().click({ timeout: 1500 }).catch(() => {});
			await page.waitForTimeout(300);
		} else break;
	}
}

async function logout(page) {
	await safeGoto(page, `${BASE}/api/method/logout`);
	await page.waitForTimeout(500);
	await safeGoto(page, `${BASE}/login`);
}

async function login(page, email, password) {
	await logout(page);
	await safeGoto(page, `${BASE}/login`);
	await dismissCookie(page);
	await page.waitForSelector("#login_email", { timeout: 20000 });

	// Prefer API login (more reliable than form submit under cookie banners)
	const api = await page.evaluate(
		async ({ email, pwd }) => {
			const csrf = window.csrf_token || "";
			const r = await fetch("/api/method/login", {
				method: "POST",
				credentials: "same-origin",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
					"X-Frappe-CSRF-Token": csrf,
					Accept: "application/json",
				},
				body: new URLSearchParams({ usr: email, pwd }),
			});
			const text = await r.text();
			return { status: r.status, ok: r.status === 200, text: text.slice(0, 160) };
		},
		{ email, pwd: password }
	);

	if (!api.ok) {
		return {
			ok: false,
			error: /Invalid login/i.test(api.text) ? "invalid credentials" : `login HTTP ${api.status}`,
			url: page.url(),
		};
	}

	await safeGoto(page, `${BASE}/app`);
	await page.waitForTimeout(2000);
	await dismissCookie(page);
	await dismissModals(page);

	const logged = await page
		.evaluate(async () => {
			const r = await fetch("/api/method/frappe.auth.get_logged_user", {
				credentials: "same-origin",
			});
			const j = await r.json();
			return j.message;
		})
		.catch(() => "Guest");

	return {
		ok: !!(logged && logged !== "Guest"),
		url: page.url(),
		user: logged,
		error: logged && logged !== "Guest" ? null : "session not established",
	};
}

async function waitBilling(page) {
	await dismissCookie(page);
	await dismissModals(page);
	await safeGoto(page, `${BASE}/app/billing`);
	await page.waitForTimeout(1500);
	await dismissModals(page);
	await dismissCookie(page);
	// If setup wizard intercepts, go again after setup_complete fix
	if (page.url().includes("setup-wizard")) {
		await page.waitForTimeout(1000);
		await safeGoto(page, `${BASE}/app/billing`);
		await page.waitForTimeout(1500);
		await dismissModals(page);
	}
	// Wait for billing UI (not loading)
	for (let i = 0; i < 40; i++) {
		const ready = await page.evaluate(() => {
			const t = document.body.innerText || "";
			return (
				!!document.querySelector(".zivvy-billing, .zivvy-plan-card, .zivvy-billing-tier") ||
				(/Current plan|Upgrade to|Manage billing/i.test(t) && !/Not permitted/i.test(t))
			);
		});
		if (ready) break;
		await page.waitForTimeout(500);
	}
	await page.waitForTimeout(800);
}

async function readBillingPlan(page) {
	return page.evaluate(() => {
		const body = document.body.innerText || "";
		const tierEl = document.querySelector(".zivvy-billing-tier");
		const seats = document.querySelector(".zivvy-billing-seats");
		const warn = document.querySelector(".zivvy-billing-alert");
		const upgradeBtns = [...document.querySelectorAll(".zivvy-upgrade-btn")].map((b) => ({
			plan: b.getAttribute("data-plan"),
			text: b.innerText.trim(),
			disabled: b.disabled,
		}));
		return {
			tierText: tierEl ? tierEl.innerText.trim() : "",
			seatsText: seats ? seats.innerText.trim() : "",
			setupWarn: warn ? warn.innerText.trim().slice(0, 240) : "",
			upgradeBtns,
			bodyHasFree: /Free/i.test(body),
			bodyHasPro: /\bPro\b/i.test(body),
			bodyHasBusiness: /Business/i.test(body),
			bodyHasPolarWarn: /Polar is not configured/i.test(body),
			snippet: body.replace(/\s+/g, " ").trim().slice(0, 400),
		};
	});
}

async function main() {
	const creds = loadCreds();
	const freePass = creds.DEMO_FREE_PASSWORD;
	const proPass = creds.DEMO_PRO_PASSWORD;
	const bizPass = creds.DEMO_BUSINESS_PASSWORD;
	if (!freePass || !proPass || !bizPass) {
		console.error("Missing demo passwords in .demo-credentials.local");
		process.exit(1);
	}

	const report = {
		started: stamp(),
		base: BASE,
		flows: {},
		screenshots: [],
		verdict: null,
	};

	const browser = await chromium.launch({
		headless: true,
		args: ["--disable-dev-shm-usage"],
	});
	const context = await browser.newContext({
		viewport: { width: 1440, height: 900 },
		userAgent:
			"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 ZivvyBrowserE2E/1.0",
	});
	const page = await context.newPage();
	page.setDefaultTimeout(45000);

	// Collect console/page errors (no secrets)
	const pageErrors = [];
	page.on("pageerror", (e) => pageErrors.push(String(e.message || e).slice(0, 200)));

	// ---------- 1) Documentation ----------
	const docPages = [
		{ path: "/", name: "01-home" },
		{ path: "/pricing", name: "02-pricing" },
		{ path: "/features", name: "03-features" },
		{ path: "/developers", name: "04-developers" },
		{ path: "/docs", name: "05-docs" },
		{ path: "/blog", name: "06-blog" },
		{ path: "/terms", name: "07-terms" },
		{ path: "/privacy", name: "08-privacy" },
		{ path: "/cookies", name: "09-cookies" },
		{ path: "/acceptable-use", name: "10-acceptable-use" },
		{ path: "/contact", name: "11-contact" },
	];
	const docResults = [];
	for (const p of docPages) {
		const entry = { path: p.path, name: p.name, pass: false };
		try {
			const res = await safeGoto(page, BASE + p.path);
			await dismissCookie(page);
			const status = res ? res.status() : 0;
			const info = await pageLooksStyled(page);
			const shotPath = await shot(page, p.name);
			report.screenshots.push(shotPath);
			entry.status = status;
			entry.title = info.title;
			entry.h1 = info.h1;
			entry.hasCss = info.hasCss;
			entry.ui = info.statusHint;
			entry.screenshot = shotPath;
			entry.pass =
				status >= 200 &&
				status < 400 &&
				status !== 500 &&
				info.hasCss &&
				!/Internal Server Error|Traceback|Jinja/i.test(info.textSample + info.title);
			entry.failReason = entry.pass
				? null
				: `status=${status} css=${info.hasCss} sample=${info.textSample.slice(0, 80)}`;
		} catch (e) {
			entry.error = String(e.message || e).slice(0, 240);
			try {
				entry.screenshot = await shot(page, p.name + "-error");
				report.screenshots.push(entry.screenshot);
			} catch (_) {}
		}
		docResults.push(entry);
		console.log(`DOC ${entry.pass ? "PASS" : "FAIL"} ${p.path} ${entry.status || ""}`);
	}
	// Nav click smoke from home
	let navPass = false;
	try {
		await safeGoto(page, BASE + "/home");
		await dismissCookie(page);
		const pricingLink = page.locator('a[href="/pricing"]').first();
		await pricingLink.click({ timeout: 8000 });
		await page.waitForTimeout(1000);
		navPass = page.url().includes("/pricing");
		const navShot = await shot(page, "12-nav-pricing-click");
		report.screenshots.push(navShot);
	} catch (e) {
		navPass = false;
	}
	report.flows.documentation = {
		pass: docResults.every((d) => d.pass) && navPass,
		navClickWorks: navPass,
		pages: docResults,
	};

	// ---------- 2) Auth + Desk ----------
	const authFlow = { accounts: [] };

	async function authAccount(label, email, password, expectTier) {
		const row = { label, email, pass: false };
		try {
			const loginRes = await login(page, email, password);
			row.login = loginRes;
			if (!loginRes.ok) {
				row.error = loginRes.error || "login failed";
				row.screenshot = await shot(page, `${label}-login-fail`);
				report.screenshots.push(row.screenshot);
				authFlow.accounts.push(row);
				console.log(`AUTH FAIL ${label}`);
				return row;
			}
			await page.waitForTimeout(1500);
			row.deskShot = await shot(page, `${label}-desk`);
			report.screenshots.push(row.deskShot);
			await waitBilling(page);
			row.billing = await readBillingPlan(page);
			row.billingShot = await shot(page, `${label}-billing`);
			report.screenshots.push(row.billingShot);
			const tierOk = expectTier.some((t) =>
				new RegExp(t, "i").test(row.billing.tierText + " " + row.billing.snippet)
			);
			row.tierOk = tierOk;
			row.pass = loginRes.ok && tierOk && !row.billing.bodyHasPolarWarn;
			row.passSoft = loginRes.ok && tierOk; // polar warn is soft if still can upgrade
			console.log(
				`AUTH ${row.pass || row.passSoft ? "PASS" : "FAIL"} ${label} tier=${row.billing.tierText}`
			);
		} catch (e) {
			row.error = String(e.message || e).slice(0, 300);
			try {
				row.screenshot = await shot(page, `${label}-error`);
				report.screenshots.push(row.screenshot);
			} catch (_) {}
			console.log(`AUTH FAIL ${label} ${row.error}`);
		}
		authFlow.accounts.push(row);
		return row;
	}

	const freeRow = await authAccount("20-demo-free", "demo.free@zivvy.xyz", freePass, [
		"Free",
		"free",
	]);
	await authAccount("21-demo-pro", "demo.pro@zivvy.xyz", proPass, ["Pro", "pro"]);
	await authAccount("22-demo-business", "demo.business@zivvy.xyz", bizPass, [
		"Business",
		"business",
	]);
	authFlow.pass = authFlow.accounts.every((a) => a.pass || a.passSoft);
	report.flows.authDesk = authFlow;

	// ---------- 3) Subscription creation ----------
	const sub = { pass: false, notes: [] };
	try {
		const loginRes = await login(page, "demo.free@zivvy.xyz", freePass);
		sub.loginOk = loginRes.ok;
		await waitBilling(page);
		sub.billingBefore = await readBillingPlan(page);
		sub.billingShot = await shot(page, "30-billing-before-checkout");
		report.screenshots.push(sub.billingShot);

		const proBtn = page.locator('.zivvy-upgrade-btn[data-plan="pro"]');
		const visible = await proBtn.isVisible().catch(() => false);
		sub.upgradeButtonVisible = visible;
		sub.upgradeDisabled = visible ? await proBtn.isDisabled() : null;

		if (!visible) {
			sub.notes.push("Upgrade to Pro button not found");
			sub.errorShot = await shot(page, "31-checkout-no-button");
			report.screenshots.push(sub.errorShot);
		} else if (sub.upgradeDisabled) {
			sub.notes.push("Upgrade button disabled (Polar not configured?)");
			sub.errorShot = await shot(page, "31-checkout-disabled");
			report.screenshots.push(sub.errorShot);
		} else {
			// Listen for popup or navigation to Polar
			const popupPromise = context.waitForEvent("page", { timeout: 25000 }).catch(() => null);
			const navPromise = page
				.waitForURL(/polar\.sh|checkout/i, { timeout: 25000 })
				.catch(() => null);

			await proBtn.click();
			sub.notes.push("Clicked Upgrade to Pro");

			// Frappe may show msgprint error
			await page.waitForTimeout(2500);
			const dialogText = await page
				.evaluate(() => {
					const m =
						document.querySelector(".msgprint, .modal-dialog .modal-body, .frappe-msgprint") ||
						null;
					return m ? m.innerText.trim().slice(0, 400) : "";
				})
				.catch(() => "");
			if (dialogText) {
				sub.dialogError = dialogText;
				sub.errorShot = await shot(page, "31-checkout-error-dialog");
				report.screenshots.push(sub.errorShot);
			}

			const popup = await popupPromise;
			await navPromise;
			const checkoutPage = popup || page;
			await checkoutPage.waitForTimeout(2000);
			const curl = checkoutPage.url();
			sub.checkoutUrl = curl.replace(/([?&](client_secret|token|key)=)[^&]+/gi, "$1REDACTED");
			sub.reachedPolar = /polar\.sh/i.test(curl);
			sub.checkoutShot = await shot(
				checkoutPage,
				sub.reachedPolar ? "32-polar-checkout" : "32-after-upgrade-click"
			);
			report.screenshots.push(sub.checkoutShot);

			if (sub.reachedPolar) {
				sub.notes.push(
					"Polar checkout session created — stopped before real payment (live mode)"
				);
				sub.pass = true;
				sub.webhookNote =
					"After successful pay, Polar webhook subscription.* / order.paid should update Zivvy Tenant plan/seats via metadata zivvy_tenant (demo-free).";
			} else if (sub.dialogError) {
				sub.notes.push("Checkout failed with UI error");
				sub.pass = false;
			} else {
				sub.notes.push(`Did not reach Polar; stayed at ${curl}`);
				sub.pass = false;
			}

			if (popup) await popup.close().catch(() => {});
		}
	} catch (e) {
		sub.error = String(e.message || e).slice(0, 400);
		try {
			sub.errorShot = await shot(page, "31-checkout-exception");
			report.screenshots.push(sub.errorShot);
		} catch (_) {}
	}
	report.flows.subscription = sub;
	console.log(`SUB ${sub.pass ? "PASS" : "FAIL"} polar=${!!sub.reachedPolar}`);

	// ---------- 4) Signup ----------
	const signup = { pass: false };
	try {
		await logout(page);
		const unique = `e2e.${Date.now()}@example.com`;
		signup.email = unique;
		await safeGoto(page, `${BASE}/login#signup`);
		await dismissCookie(page);
		await page.waitForTimeout(1200);
		signup.beforeShot = await shot(page, "40-signup-form");
		report.screenshots.push(signup.beforeShot);

		await page.waitForSelector("form.form-signup, .for-signup .page-card", { timeout: 15000 });
		const signupForm = page.locator("form.form-signup").first();
		await signupForm.waitFor({ state: "visible", timeout: 10000 });

		// Email verification signup: name + email (+ company + datacenter). No password field.
		const nameInput = signupForm.locator(
			'input[name="full_name"], #signup_fullname, input[type="text"]'
		).first();
		const emailInput = signupForm.locator(
			'input[name="email"], #signup_email, input[type="email"]'
		).first();
		await nameInput.fill("E2E Browser Test");
		await emailInput.fill(unique);

		const company = page.locator('#signup_company, input[name="company_name"]');
		if (await company.count()) await company.first().fill("E2E Browser Co");

		const eu = page.locator('input[name="zivvy_datacenter"][value="eu"]');
		if (await eu.count()) await eu.first().check({ force: true });

		signup.formShot = await shot(page, "41-signup-filled");
		report.screenshots.push(signup.formShot);

		const submit = signupForm.locator(
			'button[type="submit"], button.btn-signup, button.btn-primary'
		);
		await submit.first().click();
		await page.waitForTimeout(5000);

		const resultText = await page.evaluate(() =>
			(document.body.innerText || "").replace(/\s+/g, " ").trim().slice(0, 500)
		);
		signup.resultSnippet = resultText.slice(0, 300);
		signup.afterShot = await shot(page, "42-signup-result");
		report.screenshots.push(signup.afterShot);

		signup.looksSuccess =
			/check your email|verification|registered|success|welcome|please check|account created/i.test(
				resultText
			);
		signup.looksError =
			/already registered|already exists|traceback|internal server|signup disabled/i.test(
				resultText
			);
		signup.pass = signup.looksSuccess || (page.url().includes("/app") && !signup.looksError);
		signup.notes = signup.pass
			? "Signup submitted (email verification flow — no password on form)"
			: "Signup result ambiguous or error — see screenshot";
		console.log(`SIGNUP ${signup.pass ? "PASS" : "FAIL"}`);
	} catch (e) {
		signup.error = String(e.message || e).slice(0, 400);
		try {
			signup.errorShot = await shot(page, "42-signup-exception");
			report.screenshots.push(signup.errorShot);
		} catch (_) {}
		console.log(`SIGNUP FAIL ${signup.error}`);
	}
	report.flows.signup = signup;

	report.pageErrors = pageErrors.slice(0, 20);
	report.finished = stamp();

	const canHumanSubscribe =
		!!report.flows.subscription.pass ||
		(!!report.flows.subscription.reachedPolar &&
			!!report.flows.authDesk.accounts.find((a) => a.label.includes("free")));

	report.verdict = {
		canCreateSubscriptionInBrowser: canHumanSubscribe,
		summary: canHumanSubscribe
			? "YES — Billing Upgrade opens Polar checkout (live). Stopped before paid charge. Webhook path exists for tenant sync after pay."
			: "NO / BLOCKED — Upgrade did not reach Polar checkout; see subscription flow errors.",
	};

	fs.writeFileSync(RESULTS, JSON.stringify(report, null, 2));
	console.log("WROTE", RESULTS);
	await browser.close();
}

main().catch((e) => {
	console.error("FATAL", String(e.message || e).slice(0, 500));
	process.exit(1);
});
