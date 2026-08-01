#!/usr/bin/env node
/**
 * Zivvy smoke tests against https://zivvy.xyz
 * Usage:
 *   DEMO_FREE_PASSWORD=… DEMO_PRO_PASSWORD=… DEMO_BUSINESS_PASSWORD=… \
 *     node scripts/smoke_zivvy.mjs
 * Writes zivvy_brand/SMOKE_REPORT.md (passwords never written).
 */
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const BASE = process.env.ZIVVY_BASE_URL || "https://zivvy.xyz";
const __dirname = dirname(fileURLToPath(import.meta.url));
const REPORT_PATH = join(__dirname, "..", "SMOKE_REPORT.md");

const PUBLIC_PATHS = [
	"/",
	"/home",
	"/features",
	"/pricing",
	"/blog",
	"/contact",
	"/terms",
	"/privacy",
	"/cookies",
	"/acceptable-use",
	"/developers",
	"/login",
];

const DEMOS = [
	{
		label: "Free",
		email: "demo.free@zivvy.xyz",
		password: process.env.DEMO_FREE_PASSWORD || "",
		tier: "free",
		proPage: "/app/sales-invoice",
		okPage: "/app/lead",
	},
	{
		label: "Pro",
		email: "demo.pro@zivvy.xyz",
		password: process.env.DEMO_PRO_PASSWORD || "",
		tier: "pro",
		proPage: "/app/sales-invoice",
		okPage: "/app/lead",
	},
	{
		label: "Business",
		email: "demo.business@zivvy.xyz",
		password: process.env.DEMO_BUSINESS_PASSWORD || "",
		tier: "business",
		proPage: "/app/asset",
		okPage: "/app/sales-invoice",
	},
];

function row(status, url, detail = "") {
	return { status, url, detail };
}

async function checkPublic(page, results) {
	for (const path of PUBLIC_PATHS) {
		const url = `${BASE}${path}`;
		try {
			const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
			const code = res ? res.status() : 0;
			const ok = code >= 200 && code < 400;
			const body = await page.content();
			const hasError =
				/Internal Server Error|Traceback|DoesNotExistError|Page not found/i.test(body) &&
				code >= 400;
			if (ok && !hasError) {
				results.push(row("PASS", url, `HTTP ${code}`));
			} else {
				results.push(row("FAIL", url, `HTTP ${code}${hasError ? " (error page)" : ""}`));
			}
		} catch (e) {
			results.push(row("FAIL", url, String(e.message || e).slice(0, 160)));
		}
	}

	// www redirect / reachability
	try {
		const www = "https://www.zivvy.xyz/home";
		const res = await page.goto(www, { waitUntil: "domcontentloaded", timeout: 45000 });
		const code = res ? res.status() : 0;
		const finalUrl = page.url();
		results.push(
			row(
				code >= 200 && code < 400 ? "PASS" : "FAIL",
				www,
				`HTTP ${code} → ${finalUrl}`
			)
		);
	} catch (e) {
		results.push(row("FAIL", "https://www.zivvy.xyz/home", String(e.message || e).slice(0, 160)));
	}

	// OpenAPI asset
	try {
		const openapi = `${BASE}/assets/zivvy_brand/openapi.json`;
		const res = await page.goto(openapi, { waitUntil: "domcontentloaded", timeout: 30000 });
		const code = res ? res.status() : 0;
		const text = await page.locator("body").innerText().catch(() => "");
		const ok = code === 200 && text.includes("openapi");
		results.push(row(ok ? "PASS" : "FAIL", openapi, `HTTP ${code}`));
	} catch (e) {
		results.push(row("FAIL", `${BASE}/assets/zivvy_brand/openapi.json`, String(e.message || e).slice(0, 160)));
	}
}

async function login(page, email, password) {
	await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded", timeout: 45000 });
	await page.waitForSelector('input[type="email"], input[name="usr"], #login_email', {
		timeout: 15000,
	});
	const emailSel = (await page.$("#login_email"))
		? "#login_email"
		: (await page.$('input[name="usr"]'))
			? 'input[name="usr"]'
			: 'input[type="email"]';
	const passSel = (await page.$("#login_password"))
		? "#login_password"
		: (await page.$('input[name="pwd"]'))
			? 'input[name="pwd"]'
			: 'input[type="password"]';
	await page.fill(emailSel, email);
	await page.fill(passSel, password);
	await Promise.all([
		page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 45000 }).catch(() => null),
		page.click('button[type="submit"], .btn-login, button:has-text("Login"), button:has-text("Sign")'),
	]);
	await page.waitForTimeout(2000);
	return page.url();
}

async function checkAuth(page, demo, results) {
	const tag = `[${demo.label}]`;
	if (!demo.password) {
		results.push(row("SKIP", `${BASE}/login (${demo.email})`, `${tag} password env missing`));
		return;
	}
	try {
		const after = await login(page, demo.email, demo.password);
		const loggedIn = !after.includes("/login") || (await page.content()).includes("frappe.boot");
		results.push(
			row(loggedIn ? "PASS" : "FAIL", `${BASE}/login`, `${tag} login → ${after}`)
		);
		if (!loggedIn) return;

		for (const path of ["/app", "/app/billing"]) {
			const url = `${BASE}${path}`;
			try {
				const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
				const code = res ? res.status() : 0;
				const body = await page.content();
				const deskish =
					body.includes("frappe") ||
					body.includes("desk") ||
					body.includes("Billing") ||
					page.url().includes("/app");
				results.push(
					row(code < 400 && deskish ? "PASS" : "FAIL", url, `${tag} HTTP ${code}`)
				);
			} catch (e) {
				results.push(row("FAIL", url, `${tag} ${String(e.message || e).slice(0, 120)}`));
			}
		}

		// Free: Pro-gated page should show upgrade / permission friction
		if (demo.tier === "free") {
			const url = `${BASE}${demo.proPage}`;
			try {
				await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
				await page.waitForTimeout(1500);
				const body = await page.content();
				const gated =
					/upgrade|requires the|Pro plan|Billing|PermissionError|not permitted|blocked/i.test(
						body
					) || page.url().includes("billing") || page.url().includes("pricing");
				results.push(
					row(
						gated ? "PASS" : "WARN",
						url,
						`${tag} Free→Pro gate ${gated ? "detected" : "not clearly detected"}`
					)
				);
			} catch (e) {
				results.push(row("FAIL", url, `${tag} ${String(e.message || e).slice(0, 120)}`));
			}
		}

		// Pro/Business: allowed page loads
		const okUrl = `${BASE}${demo.okPage}`;
		try {
			const res = await page.goto(okUrl, { waitUntil: "domcontentloaded", timeout: 45000 });
			const code = res ? res.status() : 0;
			results.push(row(code < 400 ? "PASS" : "FAIL", okUrl, `${tag} allowed page HTTP ${code}`));
		} catch (e) {
			results.push(row("FAIL", okUrl, `${tag} ${String(e.message || e).slice(0, 120)}`));
		}

		// Logout via clear cookies for next demo
		await page.context().clearCookies();
	} catch (e) {
		results.push(row("FAIL", `${BASE}/login (${demo.email})`, `${tag} ${String(e.message || e).slice(0, 160)}`));
		await page.context().clearCookies().catch(() => null);
	}
}

function writeReport(results) {
	const now = new Date().toISOString();
	const pass = results.filter((r) => r.status === "PASS").length;
	const fail = results.filter((r) => r.status === "FAIL").length;
	const warn = results.filter((r) => r.status === "WARN").length;
	const skip = results.filter((r) => r.status === "SKIP").length;
	const lines = [
		"# Zivvy smoke report",
		"",
		`Generated: ${now}`,
		`Base: ${BASE}`,
		"",
		`Summary: **${pass} pass**, **${fail} fail**, **${warn} warn**, **${skip} skip**`,
		"",
		"| Status | URL | Detail |",
		"| --- | --- | --- |",
		...results.map((r) => `| ${r.status} | \`${r.url}\` | ${r.detail.replace(/\|/g, "/")} |`),
		"",
		"## Demo accounts",
		"",
		"| Plan | Email | Password |",
		"| --- | --- | --- |",
		"| Free | `demo.free@zivvy.xyz` | `DEMO_FREE_PASSWORD` env / site_config |",
		"| Pro | `demo.pro@zivvy.xyz` | `DEMO_PRO_PASSWORD` env / site_config |",
		"| Business | `demo.business@zivvy.xyz` | `DEMO_BUSINESS_PASSWORD` env / site_config |",
		"",
		"Passwords are never written to this report.",
		"",
	];
	writeFileSync(REPORT_PATH, lines.join("\n"), "utf8");
	return { pass, fail, warn, skip };
}

async function main() {
	const browser = await chromium.launch({ headless: true });
	const context = await browser.newContext({ ignoreHTTPSErrors: true });
	const page = await context.newPage();
	const results = [];

	await checkPublic(page, results);
	for (const demo of DEMOS) {
		await checkAuth(page, demo, results);
	}

	await browser.close();
	const summary = writeReport(results);
	console.log(
		`Smoke done: ${summary.pass} pass, ${summary.fail} fail, ${summary.warn} warn, ${summary.skip} skip`
	);
	console.log(`Report: ${REPORT_PATH}`);
	if (summary.fail > 0) process.exitCode = 1;
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
