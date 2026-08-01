#!/usr/bin/env node
/**
 * Capture conversion-focused route screenshots for Zivvy.
 * Usage:
 *   node scripts/capture_conversion_screens.cjs e2e-screenshots/conversion-before
 *   node scripts/capture_conversion_screens.cjs e2e-screenshots/conversion-after
 */
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const BASE = process.env.ZIVVY_BASE_URL || "https://zivvy.xyz";
const ROOT = path.resolve(__dirname, "..");
const CREDS_FILE = path.join(ROOT, ".demo-credentials.local");
const TARGET_ARG = process.argv[2] || "e2e-screenshots/conversion-before";
const OUT_DIR = path.isAbsolute(TARGET_ARG) ? TARGET_ARG : path.join(ROOT, TARGET_ARG);
const META_FILE = path.join(OUT_DIR, "_capture.json");

const PUBLIC_ROUTES = [
	{ path: "/", name: "01-home" },
	{ path: "/pricing", name: "02-pricing" },
	{ path: "/docs", name: "03-docs" },
	{ path: "/developers", name: "04-developers" },
	{ path: "/login", name: "05-login" },
];

const AUTH_ROUTES = [{ path: "/app/billing", name: "06-app-billing" }];

function loadCreds() {
	if (!fs.existsSync(CREDS_FILE)) return {};
	const raw = fs.readFileSync(CREDS_FILE, "utf8");
	const out = {};
	for (const line of raw.split("\n")) {
		const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
		if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
	}
	return out;
}

async function safeGoto(page, url) {
	let lastError = null;
	for (let attempt = 1; attempt <= 2; attempt++) {
		try {
			const res = await page.goto(url, {
				waitUntil: "domcontentloaded",
				timeout: 60000,
			});
			await page.waitForTimeout(900);
			return res;
		} catch (err) {
			lastError = err;
			await page.waitForTimeout(800);
		}
	}
	throw lastError;
}

async function dismissCookie(page) {
	try {
		const btn = page.locator(
			'button:has-text("Accept all"), button:has-text("Accept"), button:has-text("Essential only"), button:has-text("Got it"), .cookie-banner button'
		);
		if (await btn.first().isVisible({ timeout: 2000 }).catch(() => false)) {
			await btn.first().click({ timeout: 2000 }).catch(() => {});
			await page.waitForTimeout(250);
		}
	} catch (_) {}
}

async function dismissModals(page) {
	for (let i = 0; i < 4; i++) {
		const close = page.locator(
			'.modal.show .btn-modal-close, .modal.show .modal-header .close, .modal.show button.close, .msgprint-dialog .btn-modal-close'
		);
		if (await close.first().isVisible({ timeout: 800 }).catch(() => false)) {
			await close.first().click({ timeout: 1200 }).catch(() => {});
			await page.waitForTimeout(250);
		} else {
			break;
		}
	}
}

async function login(page, email, password) {
	await safeGoto(page, `${BASE}/api/method/logout`);
	await safeGoto(page, `${BASE}/login`);
	await dismissCookie(page);
	await page.waitForSelector("#login_email", { timeout: 25000 });

	const result = await page.evaluate(
		async ({ email, password }) => {
			const csrf = window.csrf_token || "";
			const r = await fetch("/api/method/login", {
				method: "POST",
				credentials: "same-origin",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
					"X-Frappe-CSRF-Token": csrf,
					Accept: "application/json",
				},
				body: new URLSearchParams({ usr: email, pwd: password }),
			});
			return { status: r.status, ok: r.status === 200 };
		},
		{ email, password }
	);
	if (!result.ok) return { ok: false, status: result.status };

	await safeGoto(page, `${BASE}/app/billing`);
	await dismissCookie(page);
	await dismissModals(page);
	await page.waitForTimeout(1200);
	await dismissModals(page);

	const user = await page
		.evaluate(async () => {
			const r = await fetch("/api/method/frappe.auth.get_logged_user", {
				credentials: "same-origin",
			});
			const j = await r.json();
			return j.message;
		})
		.catch(() => "Guest");
	return { ok: !!(user && user !== "Guest"), user };
}

async function waitForBilling(page) {
	for (let i = 0; i < 45; i++) {
		const ready = await page.evaluate(() => {
			const text = document.body.innerText || "";
			return (
				!!document.querySelector(".zivvy-billing, .zivvy-plan-card, .zivvy-billing-tier") ||
				(/Current plan|Manage billing|Upgrade to/i.test(text) && !/Not permitted/i.test(text))
			);
		});
		if (ready) return;
		await page.waitForTimeout(400);
	}
}

async function capture(page, route, outputDir, opts = {}) {
	const res = await safeGoto(page, `${BASE}${route.path}`);
	await dismissCookie(page);
	await dismissModals(page);
	if (opts.waitBilling) {
		await waitForBilling(page);
	}
	await page.waitForTimeout(450);
	const shotPath = path.join(outputDir, `${route.name}.png`);
	await page.screenshot({ path: shotPath, fullPage: true });
	return {
		path: route.path,
		name: route.name,
		status: res ? res.status() : null,
		finalUrl: page.url(),
		file: shotPath,
	};
}

async function main() {
	fs.mkdirSync(OUT_DIR, { recursive: true });
	const creds = loadCreds();
	const email = creds.DEMO_FREE_EMAIL || "demo.free@zivvy.xyz";
	const password = creds.DEMO_FREE_PASSWORD;

	const browser = await chromium.launch({
		headless: true,
		args: ["--disable-dev-shm-usage"],
	});
	const context = await browser.newContext({
		viewport: { width: 1536, height: 960 },
		userAgent:
			"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
	});
	const page = await context.newPage();
	page.setDefaultTimeout(45000);

	const metadata = {
		base: BASE,
		outputDir: OUT_DIR,
		startedAt: new Date().toISOString(),
		public: [],
		auth: [],
		login: null,
	};

	try {
		for (const route of PUBLIC_ROUTES) {
			const result = await capture(page, route, OUT_DIR);
			metadata.public.push(result);
			console.log(`SHOT ${route.path} -> ${path.basename(result.file)}`);
		}

		if (!password) {
			throw new Error("Missing DEMO_FREE_PASSWORD in .demo-credentials.local");
		}
		const loginResult = await login(page, email, password);
		metadata.login = { ok: !!loginResult.ok, user: loginResult.user || null };
		if (!loginResult.ok) {
			throw new Error(`Login failed for ${email}`);
		}

		for (const route of AUTH_ROUTES) {
			const result = await capture(page, route, OUT_DIR, { waitBilling: true });
			metadata.auth.push(result);
			console.log(`SHOT ${route.path} -> ${path.basename(result.file)}`);
		}

		metadata.routeStatus = [...metadata.public, ...metadata.auth].map((entry) => ({
			path: entry.path,
			status: entry.status,
			ok: (entry.status || 0) >= 200 && (entry.status || 0) < 400,
		}));
	} finally {
		metadata.finishedAt = new Date().toISOString();
		fs.writeFileSync(META_FILE, JSON.stringify(metadata, null, 2));
		await browser.close();
	}

	console.log(`WROTE ${META_FILE}`);
}

main().catch((err) => {
	console.error(`ERROR ${String(err.message || err)}`);
	process.exit(1);
});
