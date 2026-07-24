/**
 * Records a Business-tier product walkthrough on https://zivvy.xyz
 * using Playwright video capture. Requires playwright from zivvy_brand.
 *
 * Usage:
 *   node scripts/record-product-tour.mjs
 *
 * Prerequisites:
 *   Demo users must exist with passwords from DEMO_*_PASSWORD env / Railway.
 *   If login 401s, re-seed on the web service WITH env forwarded:
 *     railway ssh -s web -- bash -lc \
 *       'su -s /bin/bash frappe -c "cd /home/frappe/frappe-bench && \
 *        DEMO_FREE_PASSWORD=\"$DEMO_FREE_PASSWORD\" \
 *        DEMO_PRO_PASSWORD=\"$DEMO_PRO_PASSWORD\" \
 *        DEMO_BUSINESS_PASSWORD=\"$DEMO_BUSINESS_PASSWORD\" \
 *        bench --site zivvy.xyz execute zivvy_brand.setup.seed_demo_accounts.seed_demo_accounts"'
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CRED_PATH = "/Users/shrey/Desktop/work/zivvy_brand/.demo-credentials.local";
const PLAYWRIGHT_ROOT = "/Users/shrey/Desktop/work/zivvy_brand";
const RAW_DIR = path.join(ROOT, "public", "videos", "raw");
const ORIGIN = process.env.ZIVVY_ORIGIN || "https://zivvy.xyz";

const require = createRequire(path.join(PLAYWRIGHT_ROOT, "package.json"));
const { chromium } = require("playwright");

function parseEnvFile(filePath) {
  const out = {};
  if (!fs.existsSync(filePath)) return out;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    out[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, "");
  }
  return out;
}

async function safeGoto(page, url, waitMs = 2200) {
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
  } catch (err) {
    console.warn("goto soft-fail", url, String(err.message || err));
  }
  await page.waitForTimeout(waitMs);
}

async function scrollGently(page) {
  await page.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const max = Math.min(document.body.scrollHeight, 1400);
    for (let y = 0; y <= max; y += 280) {
      window.scrollTo({ top: y, behavior: "smooth" });
      await sleep(350);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  await page.waitForTimeout(900);
}

async function dismissCookieBanner(page) {
  const candidates = [
    'button:has-text("Accept")',
    'button:has-text("Accept all")',
    'button:has-text("Got it")',
    'button:has-text("I agree")',
    '[data-testid="cookie-accept"]'
  ];
  for (const sel of candidates) {
    const btn = page.locator(sel).first();
    if (await btn.count()) {
      try {
        await btn.click({ timeout: 1500 });
        await page.waitForTimeout(400);
        return;
      } catch {
        /* ignore */
      }
    }
  }
}

/**
 * Login and hard-fail if auth does not succeed.
 * Previous tour shipped a 401 failure because the recorder only waited 4s
 * and then navigated blindly — never asserting Logged In / dashboard shell.
 */
async function loginSuccessfully(page, email, password) {
  console.log("Opening login…", `${ORIGIN}/login`);
  await page.goto(`${ORIGIN}/login`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForSelector("#signin-email", { timeout: 20000 });
  await dismissCookieBanner(page);

  await page.fill("#signin-email", email);
  await page.fill("#signin-password", password);

  const loginResponsePromise = page.waitForResponse(
    (res) => res.url().includes("/api/method/login"),
    { timeout: 25000 }
  );

  const submit = page.locator('form button[type="submit"]').first();
  if (await submit.count()) {
    await submit.click();
  } else {
    await page.keyboard.press("Enter");
  }

  const loginRes = await loginResponsePromise;
  const status = loginRes.status();
  let bodyText = "";
  try {
    bodyText = await loginRes.text();
  } catch {
    /* body may already be consumed by the page */
  }

  if (status !== 200) {
    const alert = await page.locator('[role="alert"]').textContent().catch(() => null);
    throw new Error(
      `Login failed HTTP ${status}. alert=${alert || "(none)"} body=${bodyText.slice(0, 240)}. ` +
        `Re-seed demo accounts with DEMO_*_PASSWORD env forwarded (see script header).`
    );
  }

  await page.waitForURL(/\/(dashboard|app)(\/|$|\?)/, { timeout: 30000 });
  // Ensure we are on the Next app shell (not stuck on /login with an error).
  if (page.url().includes("/login")) {
    throw new Error(`Still on login after 200: ${page.url()}`);
  }

  // Prefer /dashboard for the Next.js product UI.
  if (!page.url().includes("/dashboard")) {
    await safeGoto(page, `${ORIGIN}/dashboard`, 2800);
  }

  await page.waitForSelector("text=Demo Business", { timeout: 20000 });
  const shell = await page.evaluate(() => {
    const text = document.body.innerText || "";
    const alert = document.querySelector('[role="alert"]')?.textContent || "";
    return {
      hasSidebar: Boolean(document.querySelector("[data-sidebar], aside, nav")),
      hasFailed: /sign in failed|invalid login|request failed \(401\)/i.test(text + alert),
      showsBusiness: /Business/i.test(text)
    };
  });

  if (!shell.hasSidebar) {
    throw new Error("Post-login app shell missing sidebar/nav");
  }
  if (shell.hasFailed) {
    throw new Error("Post-login page still shows a login failure message");
  }

  console.log("Login OK →", page.url(), shell);
  // Hold on dashboard so the first seconds of the video are clearly "in app"
  await page.waitForTimeout(3500);
}

async function main() {
  const creds = parseEnvFile(CRED_PATH);
  const email = process.env.DEMO_BUSINESS_EMAIL || "demo.business@zivvy.xyz";
  const password = process.env.DEMO_BUSINESS_PASSWORD || creds.DEMO_BUSINESS_PASSWORD;
  if (!password) throw new Error("Missing DEMO_BUSINESS_PASSWORD");

  fs.mkdirSync(RAW_DIR, { recursive: true });
  for (const f of fs.readdirSync(RAW_DIR)) {
    if (f.endsWith(".webm")) fs.unlinkSync(path.join(RAW_DIR, f));
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: RAW_DIR, size: { width: 1440, height: 900 } },
    deviceScaleFactor: 1
  });
  const page = await context.newPage();

  await loginSuccessfully(page, email, password);

  // Optional: open launcher so viewers see the Business module grid
  const allApps = page.locator('a:has-text("All apps"), button:has-text("All apps")').first();
  if (await allApps.count()) {
    try {
      await allApps.click({ timeout: 3000 });
      await page.waitForTimeout(2200);
      await page.keyboard.press("Escape").catch(() => {});
      await page.waitForTimeout(600);
    } catch {
      /* launcher optional */
    }
  }

  // Prefer routes that render real list shells (avoid known 404s like /finance/reports).
  const stops = [
    { url: `${ORIGIN}/dashboard`, wait: 3800, label: "dashboard" },
    { url: `${ORIGIN}/crm/leads`, wait: 3400, label: "crm-leads" },
    { url: `${ORIGIN}/crm/opportunities`, wait: 3000, label: "crm-opps" },
    { url: `${ORIGIN}/sales/customers`, wait: 3000, label: "customers" },
    { url: `${ORIGIN}/sales/quotations`, wait: 2800, label: "quotations" },
    { url: `${ORIGIN}/sales/orders`, wait: 2800, label: "orders" },
    { url: `${ORIGIN}/sales/invoices`, wait: 3000, label: "invoices" },
    { url: `${ORIGIN}/stock/items`, wait: 3000, label: "stock-items" },
    { url: `${ORIGIN}/stock/warehouses`, wait: 2800, label: "warehouses" },
    { url: `${ORIGIN}/finance/payments`, wait: 3000, label: "payments" },
    { url: `${ORIGIN}/finance/accounts`, wait: 3000, label: "chart-of-accounts" },
    { url: `${ORIGIN}/hr/employees`, wait: 3000, label: "hr-employees" },
    { url: `${ORIGIN}/hr/payroll`, wait: 2800, label: "payroll" },
    { url: `${ORIGIN}/projects`, wait: 3000, label: "projects" },
    { url: `${ORIGIN}/manufacturing/bom`, wait: 3400, label: "bom" },
    { url: `${ORIGIN}/manufacturing/work-orders`, wait: 3400, label: "work-orders" },
    { url: `${ORIGIN}/quality`, wait: 3000, label: "quality" },
    { url: `${ORIGIN}/billing`, wait: 3400, label: "billing" },
    { url: `${ORIGIN}/settings/team`, wait: 3000, label: "team" }
  ];

  for (const stop of stops) {
    console.log("→", stop.label);
    await safeGoto(page, stop.url, stop.wait);
    // Refuse to continue if we somehow bounced to login mid-tour
    if (page.url().includes("/login")) {
      throw new Error(`Session lost at ${stop.label}; landed on login`);
    }
    await scrollGently(page);
  }

  await page.waitForTimeout(2500);

  const videoPath = await page.video()?.path();
  await context.close();
  await browser.close();

  if (!videoPath || !fs.existsSync(videoPath)) {
    throw new Error("Playwright did not produce a video file");
  }

  const staged = path.join(RAW_DIR, "business-walkthrough-raw.webm");
  fs.copyFileSync(videoPath, staged);
  console.log("Raw video:", staged);
  console.log("Bytes:", fs.statSync(staged).size);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
