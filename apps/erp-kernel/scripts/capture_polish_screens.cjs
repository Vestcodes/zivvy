#!/usr/bin/env node
/**
 * Capture polish screenshots for key Zivvy routes.
 * Usage:
 *   node scripts/capture_polish_screens.cjs e2e-screenshots/polish-before
 *   node scripts/capture_polish_screens.cjs e2e-screenshots/polish-after
 */
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const BASE = process.env.ZIVVY_BASE_URL || "https://zivvy.xyz";
const ROOT = path.resolve(__dirname, "..");
const CREDS_FILE = path.join(ROOT, ".demo-credentials.local");
const TARGET_ARG = process.argv[2] || "e2e-screenshots/polish-before";
const OUT_DIR = path.isAbsolute(TARGET_ARG) ? TARGET_ARG : path.join(ROOT, TARGET_ARG);
const META_FILE = path.join(OUT_DIR, "_capture.json");

const ROUTES = [
	{ path: "/", name: "01-home", auth: false },
	{ path: "/features", name: "02-features", auth: false },
	{ path: "/pricing", name: "03-pricing", auth: false },
	{ path: "/docs", name: "04-docs", auth: false },
	{ path: "/developers", name: "05-developers", auth: false },
	{ path: "/blog", name: "06-blog", auth: false },
	{ path: "/login", name: "07-login", auth: false },
	{ path: "/app", name: "08-app", auth: true },
	{ path: "/app/billing", name: "09-app-billing", auth: true },
];

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
	const res = await page.goto(url, {
		waitUntil: "domcontentloaded",
		timeout: 60000,
	});
	await page.waitForTimeout(1000);
	return res;
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
		} else {
			break;
		}
	}
}

async function login(page, email, password) {
	await safeGoto(page, `${BASE}/api/method/logout`);
	await safeGoto(page, `${BASE}/login`);
	await dismissCookie(page);
	await page.waitForSelector("#login_email", { timeout: 20000 });

	const loginRes = await page.evaluate(
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
			return { ok: r.status === 200, status: r.status };
		},
		{ email, password }
	);
	if (!loginRes.ok) {
		return { ok: false, status: loginRes.status };
	}

	await safeGoto(page, `${BASE}/app`);
	await dismissCookie(page);
	await dismissModals(page);
	await page.waitForTimeout(1200);

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

async function capture(page, route, outputDir) {
	const res = await safeGoto(page, `${BASE}${route.path}`);
	await dismissCookie(page);
	await dismissModals(page);
	await page.waitForTimeout(900);
	await dismissModals(page);
	await dismissCookie(page);
	await page.waitForTimeout(350);
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
	const freePassword = creds.DEMO_FREE_PASSWORD;
	const freeEmail = creds.DEMO_FREE_EMAIL || "demo.free@zivvy.xyz";

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
		results: [],
		login: null,
	};

	try {
		for (const route of ROUTES.filter((r) => !r.auth)) {
			const result = await capture(page, route, OUT_DIR);
			metadata.results.push(result);
			console.log(`SHOT ${route.path} -> ${path.basename(result.file)}`);
		}

		if (!freePassword) {
			throw new Error("Missing DEMO_FREE_PASSWORD in .demo-credentials.local");
		}
		const loginResult = await login(page, freeEmail, freePassword);
		metadata.login = { ok: !!loginResult.ok, user: loginResult.user || null };
		if (!loginResult.ok) {
			throw new Error(`Login failed for ${freeEmail}`);
		}

		for (const route of ROUTES.filter((r) => r.auth)) {
			const result = await capture(page, route, OUT_DIR);
			metadata.results.push(result);
			console.log(`SHOT ${route.path} -> ${path.basename(result.file)}`);
		}
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
