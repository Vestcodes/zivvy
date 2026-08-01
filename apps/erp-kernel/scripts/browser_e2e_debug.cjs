#!/usr/bin/env node
/** Focused debug: login demo.free → billing, capture console + network */
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const CREDS = Object.fromEntries(
	fs
		.readFileSync(path.join(ROOT, ".demo-credentials.local"), "utf8")
		.split("\n")
		.map((l) => l.match(/^([A-Z0-9_]+)=(.*)$/))
		.filter(Boolean)
		.map((m) => [m[1], m[2].trim().replace(/^["']|["']$/g, "")])
);
const SHOTS = path.join(ROOT, "e2e-screenshots");

(async () => {
	const browser = await chromium.launch({ headless: true });
	const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
	const page = await context.newPage();
	const logs = [];
	page.on("console", (m) => logs.push(["console", m.type(), m.text().slice(0, 200)]));
	page.on("pageerror", (e) => logs.push(["pageerror", String(e.message).slice(0, 200)]));
	page.on("response", (r) => {
		const u = r.url();
		if (/billing|getpage|desk_page|permission|login/i.test(u)) {
			logs.push(["resp", r.status(), u.replace(/https:\/\/zivvy\.xyz/, "").slice(0, 180)]);
		}
	});

	await page.goto("https://zivvy.xyz/api/method/logout", { waitUntil: "domcontentloaded" });
	await page.goto("https://zivvy.xyz/login", { waitUntil: "networkidle" });
	await page.fill("#login_email", "demo.free@zivvy.xyz");
	await page.fill("#login_password", CREDS.DEMO_FREE_PASSWORD);
	await Promise.all([
		page.waitForNavigation({ waitUntil: "networkidle", timeout: 60000 }).catch(() => null),
		page.click("button.btn-login"),
	]);
	await page.waitForTimeout(3000);
	logs.push(["url_after_login", page.url()]);
	await page.screenshot({ path: path.join(SHOTS, "debug-after-login.png"), fullPage: true });

	// dismiss any modals
	for (let i = 0; i < 3; i++) {
		const close = page.locator(".modal.show .btn-modal-close, .modal.show .modal-header .close, .modal.show button:has-text('Close')");
		if (await close.first().isVisible().catch(() => false)) {
			await close.first().click().catch(() => {});
			await page.waitForTimeout(400);
		} else break;
	}

	await page.goto("https://zivvy.xyz/app/billing", { waitUntil: "networkidle", timeout: 60000 });
	await page.waitForTimeout(4000);
	// dismiss again
	for (let i = 0; i < 3; i++) {
		const close = page.locator(".modal.show .btn-modal-close, .modal.show button:has-text('×'), .modal.show .close");
		if (await close.first().isVisible().catch(() => false)) {
			await close.first().click().catch(() => {});
			await page.waitForTimeout(400);
		} else break;
	}
	await page.waitForTimeout(2000);
	logs.push(["url_billing", page.url()]);
	const body = await page.evaluate(() => ({
		text: (document.body.innerText || "").replace(/\s+/g, " ").slice(0, 600),
		hasBilling: !!document.querySelector(".zivvy-billing, .zivvy-plan-card"),
		modals: [...document.querySelectorAll(".modal.show")].map((m) => m.innerText.slice(0, 120)),
		pageContainer: !!document.querySelector('.page-container[data-page-route="billing"], [data-page-container="billing"]'),
	}));
	logs.push(["body", body]);
	await page.screenshot({ path: path.join(SHOTS, "debug-billing.png"), fullPage: true });

	// Try API from browser session
	const api = await page.evaluate(async () => {
		const r = await fetch("/api/method/zivvy_brand.billing.api.get_billing_status", {
			credentials: "same-origin",
			headers: { Accept: "application/json", "X-Frappe-CSRF-Token": window.csrf_token || "" },
		});
		const t = await r.text();
		return { status: r.status, body: t.slice(0, 500) };
	});
	logs.push(["api_billing_status", api]);

	fs.writeFileSync(path.join(SHOTS, "debug-logs.json"), JSON.stringify(logs, null, 2));
	console.log(JSON.stringify(logs.slice(-8), null, 2));
	await browser.close();
})().catch((e) => {
	console.error(String(e).slice(0, 500));
	process.exit(1);
});
