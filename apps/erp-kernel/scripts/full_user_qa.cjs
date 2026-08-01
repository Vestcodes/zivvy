#!/usr/bin/env node
/**
 * Thorough end-to-end user QA for https://zivvy.xyz (Next.js app + Frappe API).
 * Business demo primary; Pro used only if Business login fails for plan checks.
 *
 * Usage: node scripts/full_user_qa.cjs
 * Output: e2e-screenshots/full-qa/ + FULL_USER_QA_REPORT.md
 */
const fs = require("fs");
const path = require("path");
const { chromium, devices } = require("playwright");

const BASE = process.env.ZIVVY_BASE || "https://zivvy.xyz";
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "e2e-screenshots", "full-qa");
const CREDS_FILE = path.join(ROOT, ".demo-credentials.local");
const REPORT_MD = path.join(ROOT, "FULL_USER_QA_REPORT.md");
const RESULTS_JSON = path.join(OUT, "_results.json");

fs.mkdirSync(OUT, { recursive: true });

function loadCreds() {
  const raw = fs.readFileSync(CREDS_FILE, "utf8");
  const out = {};
  for (const line of raw.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return out;
}

function now() {
  return new Date().toISOString();
}

/** Full inventory from app-launcher-data + sidebar extras */
const APP_ROUTES = [
  // Workspace
  { label: "Dashboard", href: "/dashboard", area: "workspace" },
  { label: "Messages", href: "/messages", area: "workspace" },
  { label: "Apps launcher", href: "/apps", area: "workspace" },

  // CRM / Sales
  { label: "CRM Leads", href: "/crm/leads", area: "crm" },
  { label: "CRM Opportunities", href: "/crm/opportunities", area: "crm" },
  { label: "Customers", href: "/sales/customers", area: "sales" },
  { label: "Quotations", href: "/sales/quotations", area: "sales" },
  { label: "Sales orders", href: "/sales/orders", area: "sales" },
  { label: "Invoices", href: "/sales/invoices", area: "sales" },
  { label: "Deliveries", href: "/sales/deliveries", area: "sales" },
  { label: "POS invoices", href: "/pos/invoices", area: "pos", minTier: "pro" },
  { label: "POS profiles", href: "/pos/profiles", area: "pos", minTier: "pro" },
  { label: "POS opening", href: "/pos/opening", area: "pos", minTier: "pro" },
  { label: "POS closing", href: "/pos/closing", area: "pos", minTier: "pro" },

  // Procurement
  { label: "Suppliers", href: "/purchases/suppliers", area: "procurement" },
  { label: "RFQs", href: "/purchases/rfqs", area: "procurement" },
  { label: "Purchase orders", href: "/purchases/orders", area: "procurement" },
  { label: "Purchase invoices", href: "/purchases/invoices", area: "procurement" },

  // Stock
  { label: "Items", href: "/stock/items", area: "stock" },
  { label: "Warehouses", href: "/stock/warehouses", area: "stock" },
  { label: "Stock entries", href: "/stock/entries", area: "stock" },
  { label: "Reorder", href: "/stock/reorder", area: "stock" },
  { label: "Barcode scan", href: "/stock/scan", area: "stock", minTier: "pro" },

  // Shipping
  { label: "Shipments", href: "/shipping/shipments", area: "shipping" },
  { label: "Parcels", href: "/shipping/parcels", area: "shipping" },
  { label: "Shipping rules", href: "/shipping/rules", area: "shipping" },
  { label: "Carriers", href: "/shipping/carriers", area: "shipping" },

  // Accounting
  { label: "Chart of accounts", href: "/finance/accounts", area: "finance", minTier: "pro" },
  { label: "Payments", href: "/finance/payments", area: "finance", minTier: "pro" },
  { label: "Journal entries", href: "/finance/journal", area: "finance", minTier: "pro" },
  { label: "Reports", href: "/finance/reports", area: "finance", minTier: "pro" },

  // HR
  { label: "Employees", href: "/hr/employees", area: "hr", minTier: "pro" },
  { label: "Time off", href: "/hr/time-off", area: "hr", minTier: "pro" },
  { label: "Attendance", href: "/hr/attendance", area: "hr", minTier: "pro" },
  { label: "Shifts", href: "/hr/shifts", area: "hr", minTier: "pro" },
  { label: "Payroll", href: "/hr/payroll", area: "hr", minTier: "pro" },
  { label: "Expenses", href: "/hr/expenses", area: "hr", minTier: "pro" },
  { label: "Loans", href: "/hr/loans", area: "hr", minTier: "pro" },
  { label: "Onboarding", href: "/hr/onboarding", area: "hr", minTier: "pro" },

  // Talent
  { label: "Job openings", href: "/talent/openings", area: "talent", minTier: "pro" },
  { label: "Applicants", href: "/talent/applicants", area: "talent", minTier: "pro" },
  { label: "Interviews", href: "/talent/interviews", area: "talent", minTier: "pro" },
  { label: "Appraisals", href: "/talent/appraisals", area: "talent", minTier: "pro" },
  { label: "Goals", href: "/talent/goals", area: "talent", minTier: "pro" },
  { label: "Training", href: "/talent/training", area: "talent", minTier: "pro" },

  // Manufacturing (Business)
  { label: "BOMs", href: "/manufacturing/bom", area: "manufacturing", minTier: "business" },
  { label: "Work orders", href: "/manufacturing/work-orders", area: "manufacturing", minTier: "business" },
  { label: "Job cards", href: "/manufacturing/job-cards", area: "manufacturing", minTier: "business" },
  { label: "Subcontracting", href: "/manufacturing/subcontracting", area: "manufacturing", minTier: "business" },
  { label: "Quality", href: "/quality/inspections", area: "manufacturing", minTier: "business" },

  // Assets
  { label: "Assets", href: "/assets/register", area: "assets" },
  { label: "Maintenance", href: "/assets/maintenance", area: "assets" },
  { label: "Movements", href: "/assets/movements", area: "assets" },
  { label: "Depreciation", href: "/assets/depreciation", area: "assets" },

  // Projects
  { label: "Projects", href: "/projects/all", area: "projects", minTier: "pro" },
  { label: "Tasks", href: "/projects/tasks", area: "projects", minTier: "pro" },
  { label: "Timesheets", href: "/projects/timesheets", area: "projects", minTier: "pro" },

  // Support
  { label: "Tickets", href: "/service/tickets", area: "support" },
  { label: "Issues", href: "/service/issues", area: "support" },
  { label: "Warranty", href: "/service/warranty", area: "support" },
  { label: "SLAs", href: "/service/slas", area: "support" },

  // Setup
  { label: "Team", href: "/settings/team", area: "setup" },
  { label: "Billing", href: "/billing", area: "setup" },
  { label: "Settings", href: "/settings", area: "setup" },
  { label: "Help", href: "/help", area: "setup" }
];

const MARKETING_ROUTES = [
  { label: "Homepage", href: "/" },
  { label: "Pricing", href: "/pricing" },
  { label: "Product tour", href: "/product-tour" },
  { label: "Solutions", href: "/solutions" },
  { label: "Compare", href: "/compare" },
  { label: "Features", href: "/features" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Blog", href: "/blog" },
  { label: "Resources", href: "/resources" },
  { label: "Integrations", href: "/integrations" },
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
  { label: "Cookies", href: "/cookies" },
  { label: "Acceptable use", href: "/acceptable-use" },
  { label: "WWW redirect", href: "/www" }
];

const results = {
  startedAt: now(),
  base: BASE,
  checks: [],
  bugs: [],
  consoleErrors: [],
  networkFailures: [],
  screenshots: [],
  skipped: []
};

function record(section, name, status, detail = {}, shot = null) {
  const row = { section, name, status, detail, shot, at: now() };
  results.checks.push(row);
  const icon = status === "pass" ? "✓" : status === "fail" ? "✗" : "~";
  console.log(`  ${icon} [${section}] ${name}${detail.note ? " — " + detail.note : ""}`);
  return row;
}

function bug(severity, title, steps, url, expected, actual, shot = null) {
  const b = { severity, title, steps, url, expected, actual, shot, at: now() };
  results.bugs.push(b);
  console.log(`  !! BUG (${severity}): ${title}`);
  return b;
}

async function shot(page, name) {
  const safe = name.replace(/[^a-z0-9-_]+/gi, "_").slice(0, 80);
  const file = path.join(OUT, `${safe}.png`);
  try {
    await page.screenshot({ path: file, fullPage: false });
    results.screenshots.push(`e2e-screenshots/full-qa/${safe}.png`);
    return `e2e-screenshots/full-qa/${safe}.png`;
  } catch (e) {
    return null;
  }
}

async function dismissCookie(page) {
  try {
    const btn = page.locator(
      'button:has-text("Accept all"), button:has-text("Accept"), button:has-text("Essential only"), button:has-text("Got it")'
    );
    if (await btn.first().isVisible({ timeout: 1500 }).catch(() => false)) {
      await btn.first().click({ timeout: 2000 }).catch(() => {});
      await page.waitForTimeout(300);
    }
  } catch (_) {}
}

function attachListeners(page, tag) {
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const text = msg.text();
      if (/favicon|ResizeObserver|hydration|third-party|chrome-extension/i.test(text)) return;
      results.consoleErrors.push({ tag, text: text.slice(0, 400), url: page.url() });
    }
  });
  page.on("pageerror", (err) => {
    results.consoleErrors.push({ tag, text: `PAGEERROR: ${err.message}`.slice(0, 400), url: page.url() });
  });
  page.on("response", (res) => {
    const status = res.status();
    const url = res.url();
    if (status >= 400 && /zivvy\.xyz|api\.zivvy/i.test(url)) {
      // Ignore expected auth redirects / 404 for /www
      if (status === 404 && /\/www/.test(url)) return;
      if (status === 401 && /login|bootinfo|method\/logout/i.test(url)) return;
      results.networkFailures.push({
        tag,
        status,
        url: url.slice(0, 300),
        page: page.url()
      });
    }
  });
}

async function goto(page, url, opts = {}) {
  const res = await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
    ...opts
  });
  await page.waitForTimeout(900);
  await dismissCookie(page);
  return res;
}

async function pageHealth(page) {
  return page.evaluate(() => {
    const body = document.body;
    const text = (body?.innerText || "").replace(/\s+/g, " ").trim();
    const title = document.title || "";
    const h1 = document.querySelector("h1");
    const alert = document.querySelector('[role="alert"]');
    const nextError =
      text.includes("Application error") ||
      text.includes("This page could not be found") ||
      !!document.querySelector("#__next_error__") ||
      text.includes("Internal Server Error") ||
      text.includes("500");
    const blank = text.length < 40;
    const upgradeGate =
      /upgrade|not available on your plan|requires (pro|business)|locked/i.test(text) &&
      text.length < 800;
    const loginRedirect = location.pathname.startsWith("/login");
    return {
      title,
      h1: h1 ? h1.innerText.trim().slice(0, 120) : "",
      textLen: text.length,
      textSample: text.slice(0, 180),
      alert: alert ? alert.textContent.trim().slice(0, 200) : null,
      nextError,
      blank,
      upgradeGate,
      loginRedirect,
      href: location.href,
      pathname: location.pathname
    };
  });
}

async function loginForm(page, email, password) {
  await goto(page, `${BASE}/login`);
  await page.waitForSelector("#signin-email", { timeout: 25000 });
  await page.fill("#signin-email", email);
  await page.fill("#signin-password", password);
  await Promise.all([
    page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 45000 }).catch(() => null),
    page.click('form button[type="submit"]')
  ]);
  await page.waitForTimeout(1500);
  return pageHealth(page);
}

async function logoutViaUi(page) {
  // Prefer API logout for reliability, then verify UI
  await page.evaluate(async () => {
    try {
      await fetch("/api/method/logout", { method: "POST", credentials: "include" });
    } catch (_) {}
  });
  await goto(page, `${BASE}/login`);
  await page.waitForTimeout(500);
}

async function testMarketing(page) {
  console.log("\n== Marketing ==");
  for (const r of MARKETING_ROUTES) {
    try {
      const res = await goto(page, `${BASE}${r.href}`);
      const status = res ? res.status() : 0;
      const health = await pageHealth(page);
      const isWww = r.href === "/www";
      const ok =
        (!isWww && status < 400 && !health.nextError && !health.blank) ||
        (isWww && (status === 404 || status === 301 || status === 302 || status === 308));

      if (ok) {
        record("marketing", r.label, isWww && status === 404 ? "warn" : "pass", {
          status,
          title: health.title,
          note: isWww ? `status=${status}` : health.h1 || health.title
        });
        if (isWww && status === 404) {
          bug(
            "low",
            "/www returns 404 (no redirect)",
            ["Open https://zivvy.xyz/www"],
            `${BASE}/www`,
            "Redirect to / or marketing home",
            `HTTP ${status}`,
            await shot(page, "marketing-www-404")
          );
        }
      } else {
        const s = await shot(page, `marketing-fail-${r.label}`);
        record("marketing", r.label, "fail", { status, ...health }, s);
        bug(
          "high",
          `Marketing page broken: ${r.label}`,
          [`Navigate to ${BASE}${r.href}`],
          health.href,
          "Page loads with content",
          `status=${status} blank=${health.blank} error=${health.nextError}`,
          s
        );
      }
    } catch (e) {
      const s = await shot(page, `marketing-err-${r.label}`);
      record("marketing", r.label, "fail", { note: e.message }, s);
      bug("high", `Marketing page exception: ${r.label}`, [`Open ${r.href}`], `${BASE}${r.href}`, "Loads", e.message, s);
    }
  }

  // Homepage interactions
  try {
    await goto(page, `${BASE}/`);
    await dismissCookie(page);

    // Mega menus
    for (const item of ["Product", "Solutions", "Resources", "Compare"]) {
      const trigger = page.getByRole("button", { name: item }).or(page.locator(`text=${item}`).first());
      const visible = await trigger.first().isVisible({ timeout: 3000 }).catch(() => false);
      if (!visible) {
        // try MenuItem hover targets
        const hoverEl = page.locator(`nav >> text=${item}`).first();
        if (await hoverEl.isVisible({ timeout: 2000 }).catch(() => false)) {
          await hoverEl.hover();
          await page.waitForTimeout(400);
          record("marketing", `Nav mega: ${item}`, "pass", { note: "hovered" });
        } else {
          record("marketing", `Nav mega: ${item}`, "warn", { note: "trigger not found" });
        }
      } else {
        await trigger.first().hover().catch(() => trigger.first().click());
        await page.waitForTimeout(400);
        record("marketing", `Nav mega: ${item}`, "pass", { note: "opened/hovered" });
      }
    }

    // Hero video dialog
    await goto(page, `${BASE}/`);
    const videoThumb = page
      .locator('[data-slot="hero-video"], button:has(img), .group relative, [aria-label*="Play" i], button:has(svg)')
      .filter({ has: page.locator("img") })
      .first();
    const productTourBtn = page.locator('a[href="/product-tour"], button:has-text("Watch"), button:has-text("Play")').first();

    let videoOpened = false;
    // Prefer product-tour page for HeroVideoDialog
    await goto(page, `${BASE}/product-tour`);
    const dialogTrigger = page.locator("button").filter({ has: page.locator("img") }).first();
    if (await dialogTrigger.isVisible({ timeout: 5000 }).catch(() => false)) {
      await dialogTrigger.click();
      await page.waitForTimeout(800);
      const dialog = page.locator('[role="dialog"], [data-state="open"]');
      videoOpened = await dialog.first().isVisible({ timeout: 3000 }).catch(() => false);
      if (videoOpened) {
        await shot(page, "hero-video-dialog-open");
        // close
        await page.keyboard.press("Escape").catch(() => {});
        const closeBtn = page.locator('[role="dialog"] button, button:has-text("Close")').first();
        if (await closeBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
          await closeBtn.click().catch(() => {});
        }
      }
    }
    record("marketing", "HeroVideoDialog", videoOpened ? "pass" : "warn", {
      note: videoOpened ? "modal opened" : "could not open modal (selector miss or missing)"
    });

    // CTA presence
    const cta = page.locator('a[href="/login"], a[href="/pricing"], a:has-text("Start"), a:has-text("Get started")').first();
    const ctaOk = await cta.isVisible({ timeout: 3000 }).catch(() => false);
    record("marketing", "Primary CTAs present", ctaOk ? "pass" : "warn");
  } catch (e) {
    record("marketing", "Homepage interactions", "fail", { note: e.message });
  }
}

async function testAuth(page, creds) {
  console.log("\n== Auth ==");
  const email = process.env.ZIVVY_EMAIL || creds.DEMO_BUSINESS_EMAIL || "demo@zivvy.xyz";
  const password = process.env.ZIVVY_PASSWORD || creds.DEMO_BUSINESS_PASSWORD || creds.DEMO_ARCADE_PASSWORD;

  // Signup tab loads
  try {
    await goto(page, `${BASE}/login#signup`);
    await page.waitForTimeout(800);
    const signupVisible =
      (await page.locator('form').filter({ hasText: /create|sign up|company|workspace/i }).first().isVisible({ timeout: 5000 }).catch(() => false)) ||
      (await page.getByRole("tab", { name: /create account/i }).isVisible({ timeout: 3000 }).catch(() => false));
    record("auth", "Signup tab loads", signupVisible ? "pass" : "warn", {
      note: signupVisible ? "Create account UI visible" : "tab/form not clearly visible"
    });
    await shot(page, "auth-signup-tab");
  } catch (e) {
    record("auth", "Signup tab loads", "fail", { note: e.message });
  }

  // Update password page
  try {
    const res = await goto(page, `${BASE}/update-password`);
    const status = res ? res.status() : 0;
    const health = await pageHealth(page);
    const ok = status < 400 && !health.nextError;
    record("auth", "Update password page", ok ? "pass" : "fail", { status, title: health.title });
    if (!ok) {
      bug(
        "medium",
        "Update password page broken",
        ["Open /update-password"],
        `${BASE}/update-password`,
        "Form loads",
        `status=${status}`,
        await shot(page, "auth-update-password-fail")
      );
    }
  } catch (e) {
    record("auth", "Update password page", "fail", { note: e.message });
  }

  // Wrong password
  try {
    await logoutViaUi(page);
    await goto(page, `${BASE}/login`);
    await page.fill("#signin-email", email);
    await page.fill("#signin-password", "definitely-wrong-password-xyz");
    await page.click('form button[type="submit"]');
    await page.waitForTimeout(2000);
    const health = await pageHealth(page);
    const hasAlert =
      !!health.alert ||
      /invalid|incorrect|failed|wrong|unable/i.test(health.textSample) ||
      (await page.locator('[role="alert"]').isVisible().catch(() => false));
    const stayed = health.pathname.startsWith("/login") || health.loginRedirect;
    if (hasAlert && stayed) {
      record("auth", "Wrong password shows error", "pass", { note: health.alert || "error shown" });
    } else if (stayed) {
      record("auth", "Wrong password shows error", "warn", {
        note: "stayed on login but no clear alert"
      });
      await shot(page, "auth-wrong-password-no-alert");
    } else {
      const s = await shot(page, "auth-wrong-password-navigated");
      record("auth", "Wrong password shows error", "fail", { ...health }, s);
      bug(
        "critical",
        "Wrong password did not stay on login / no error",
        ["Go to /login", "Enter demo.business email + wrong password", "Submit"],
        health.href,
        "Stay on login with error",
        `navigated to ${health.pathname}`,
        s
      );
    }
  } catch (e) {
    record("auth", "Wrong password shows error", "fail", { note: e.message });
  }

  // Successful login
  try {
    await logoutViaUi(page);
    const health = await loginForm(page, email, password);
    const ok =
      !health.loginRedirect &&
      (health.pathname.startsWith("/dashboard") ||
        health.pathname.startsWith("/apps") ||
        health.pathname.startsWith("/crm") ||
        health.textLen > 100);
    const s = await shot(page, "auth-business-login");
    if (ok) {
      record("auth", "Business demo login", "pass", {
        note: `landed ${health.pathname}`,
        title: health.title
      }, s);
    } else {
      record("auth", "Business demo login", "fail", health, s);
      bug(
        "critical",
        "Business demo login failed",
        ["Open /login", "Sign in as demo.business@zivvy.xyz with DEMO_BUSINESS_PASSWORD"],
        health.href,
        "Land on /dashboard or app shell",
        health.alert || health.textSample || health.pathname,
        s
      );
    }
    return ok;
  } catch (e) {
    const s = await shot(page, "auth-business-login-exception");
    record("auth", "Business demo login", "fail", { note: e.message }, s);
    bug("critical", "Business login exception", ["Login as business demo"], `${BASE}/login`, "Success", e.message, s);
    return false;
  }
}

async function tryOpenDetail(page) {
  // Click first plausible list row / link that looks like a document
  const candidates = [
    'table tbody tr a[href]',
    'table tbody tr',
    '[data-row] a',
    'a[href*="/"]:not([href="/dashboard"]):not([href="/apps"])'
  ];
  for (const sel of candidates) {
    const el = page.locator(sel).first();
    if (await el.isVisible({ timeout: 1500 }).catch(() => false)) {
      const href = await el.getAttribute("href").catch(() => null);
      if (href && (/^https?:/.test(href) && !href.includes("zivvy.xyz"))) continue;
      try {
        await el.click({ timeout: 3000 });
        await page.waitForTimeout(1200);
        return true;
      } catch (_) {
        /* try next */
      }
    }
  }
  return false;
}

async function tryLightCreateCancel(page) {
  const newBtn = page
    .locator(
      'a:has-text("New"), button:has-text("New"), a:has-text("Create"), button:has-text("Create"), a:has-text("Add"), button:has-text("Add")'
    )
    .first();
  if (!(await newBtn.isVisible({ timeout: 1500 }).catch(() => false))) return "no-new-button";
  await newBtn.click().catch(() => {});
  await page.waitForTimeout(1000);
  // Cancel / back without saving
  const cancel = page
    .locator('button:has-text("Cancel"), a:has-text("Cancel"), button:has-text("Back"), [aria-label="Close"]')
    .first();
  if (await cancel.isVisible({ timeout: 2000 }).catch(() => false)) {
    await cancel.click().catch(() => {});
    await page.waitForTimeout(400);
    return "created-then-cancelled";
  }
  await page.keyboard.press("Escape").catch(() => {});
  // If navigated to form, go back
  if (/\/new$|\/new\?|form/i.test(page.url())) {
    await page.goBack().catch(() => {});
    return "opened-form-backed-out";
  }
  return "opened-create-ui";
}

async function testAppShell(page) {
  console.log("\n== App shell (Business) ==");
  let passCount = 0;
  let failCount = 0;
  let warnCount = 0;

  // Confirm billing plan context
  try {
    await goto(page, `${BASE}/billing`);
    const health = await pageHealth(page);
    const business =
      /business/i.test(health.textSample) || /business/i.test(await page.content());
    record("app", "Billing shows Business plan", business ? "pass" : "warn", {
      note: health.textSample.slice(0, 120)
    });
    await shot(page, "app-billing-business");
  } catch (e) {
    record("app", "Billing shows Business plan", "fail", { note: e.message });
  }

  // Detail samples (open first row) for key lists
  const detailSamples = new Set([
    "/crm/leads",
    "/sales/customers",
    "/sales/invoices",
    "/stock/items",
    "/projects",
    "/hr/employees",
    "/manufacturing/bom"
  ]);
  const createSamples = new Set(["/crm/leads", "/sales/customers", "/projects/tasks"]);

  for (const r of APP_ROUTES) {
    try {
      const beforeFails = results.networkFailures.length;
      const res = await goto(page, `${BASE}${r.href}`);
      const status = res ? res.status() : 0;
      const health = await pageHealth(page);

      // Collect new 5xx for this navigation
      const newFails = results.networkFailures.slice(beforeFails).filter((f) => f.status >= 500);

      let statusLabel = "pass";
      let note = health.h1 || health.title || `len=${health.textLen}`;

      if (health.loginRedirect) {
        statusLabel = "fail";
        note = "redirected to login (session lost?)";
      } else if (health.nextError || health.blank || status >= 500) {
        statusLabel = "fail";
        note = `status=${status} blank=${health.blank} error=${health.nextError}`;
      } else if (health.upgradeGate) {
        // Business should NOT be gated on pro/business features
        statusLabel = "fail";
        note = "upgrade/plan gate shown on Business account";
      } else if (status >= 400) {
        statusLabel = "fail";
        note = `HTTP ${status}`;
      } else if (newFails.length) {
        statusLabel = "warn";
        note = `page ok but ${newFails.length} API 5xx`;
      }

      if (statusLabel === "pass") passCount++;
      else if (statusLabel === "fail") failCount++;
      else warnCount++;

      let s = null;
      if (statusLabel !== "pass") {
        s = await shot(page, `app-fail-${r.area}-${r.label}`);
        if (statusLabel === "fail") {
          bug(
            health.upgradeGate ? "high" : status >= 500 || health.nextError ? "critical" : "high",
            `App screen issue: ${r.label}`,
            [`Login as Business demo`, `Open ${r.href}`],
            health.href,
            "Module loads without blank/error/incorrect plan gate",
            note,
            s
          );
        }
      }

      record("app", r.label, statusLabel, { href: r.href, status, area: r.area, note }, s);

      if (statusLabel === "pass" || statusLabel === "warn") {
        if (detailSamples.has(r.href)) {
          const listUrl = page.url();
          const opened = await tryOpenDetail(page);
          const after = await pageHealth(page);
          if (opened && !after.nextError && !after.blank) {
            record("app", `${r.label} → detail`, "pass", { note: after.pathname });
            await shot(page, `app-detail-${r.label}`);
            await goto(page, listUrl);
          } else {
            record("app", `${r.label} → detail`, "warn", {
              note: opened ? "detail looked empty/error" : "no list row to open"
            });
          }
        }
        if (createSamples.has(r.href)) {
          const outcome = await tryLightCreateCancel(page);
          record("app", `${r.label} light create/cancel`, outcome.startsWith("no") ? "warn" : "pass", {
            note: outcome
          });
        }
      }
    } catch (e) {
      failCount++;
      const s = await shot(page, `app-err-${r.label}`);
      record("app", r.label, "fail", { href: r.href, note: e.message }, s);
      bug("high", `App screen exception: ${r.label}`, [`Open ${r.href}`], `${BASE}${r.href}`, "Loads", e.message, s);
    }
  }

  // Cross-cutting: awesomebar / search if present
  try {
    await goto(page, `${BASE}/dashboard`);
    // cmdk / search
    await page.keyboard.press("Meta+k").catch(() => {});
    await page.waitForTimeout(500);
    let searchOpen = await page.locator('[cmdk-root], [role="dialog"] input, input[placeholder*="Search" i]').first().isVisible({ timeout: 1500 }).catch(() => false);
    if (!searchOpen) {
      await page.keyboard.press("Control+k").catch(() => {});
      await page.waitForTimeout(400);
      searchOpen = await page.locator('[cmdk-root], [role="dialog"] input, input[placeholder*="Search" i]').first().isVisible({ timeout: 1500 }).catch(() => false);
    }
    if (!searchOpen) {
      const searchBtn = page.locator('button:has-text("Search"), [aria-label*="Search" i]').first();
      if (await searchBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
        await searchBtn.click();
        searchOpen = true;
      }
    }
    record("app", "Search / awesomebar", searchOpen ? "pass" : "warn", {
      note: searchOpen ? "opened" : "shortcut/button not found"
    });
    await page.keyboard.press("Escape").catch(() => {});
  } catch (e) {
    record("app", "Search / awesomebar", "warn", { note: e.message });
  }

  // Notifications if present
  try {
    const notif = page.locator('button[aria-label*="notif" i], button:has-text("Notifications"), [data-slot="notifications"]').first();
    const visible = await notif.isVisible({ timeout: 2000 }).catch(() => false);
    if (visible) {
      await notif.click();
      await page.waitForTimeout(500);
      record("app", "Notifications", "pass", { note: "opened" });
      await page.keyboard.press("Escape").catch(() => {});
    } else {
      record("app", "Notifications", "warn", { note: "control not found" });
    }
  } catch (e) {
    record("app", "Notifications", "warn", { note: e.message });
  }

  // Session persistence: reload dashboard
  try {
    await goto(page, `${BASE}/dashboard`);
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    const health = await pageHealth(page);
    const ok = !health.loginRedirect && health.textLen > 50;
    record("app", "Session persists on reload", ok ? "pass" : "fail", { pathname: health.pathname });
    if (!ok) {
      bug(
        "critical",
        "Session lost on reload",
        ["Login", "Open /dashboard", "Reload"],
        health.href,
        "Stay authenticated",
        "Redirected to login or blank",
        await shot(page, "session-lost")
      );
    }
  } catch (e) {
    record("app", "Session persists on reload", "fail", { note: e.message });
  }

  return { passCount, failCount, warnCount };
}

async function testLogout(page) {
  console.log("\n== Logout ==");
  try {
    await goto(page, `${BASE}/dashboard`);
    // Try UI logout via user menu
    const trigger = page.locator('[data-sidebar="footer"] button, button:has([data-slot="avatar"]), button:has-text("@")').first();
    let usedUi = false;
    if (await trigger.isVisible({ timeout: 3000 }).catch(() => false)) {
      await trigger.click();
      await page.waitForTimeout(400);
      const logoutItem = page.getByRole("menuitem", { name: /log out/i }).or(page.locator('text=Log out'));
      if (await logoutItem.first().isVisible({ timeout: 2000 }).catch(() => false)) {
        await logoutItem.first().click();
        await page.waitForTimeout(1500);
        usedUi = true;
      }
    }
    if (!usedUi) {
      await logoutViaUi(page);
    }
    const health = await pageHealth(page);
    // After logout, dashboard should redirect to login
    await goto(page, `${BASE}/dashboard`);
    const after = await pageHealth(page);
    const ok = after.loginRedirect || after.pathname.startsWith("/login");
    record("auth", "Logout clears session", ok ? "pass" : "fail", {
      note: usedUi ? "UI logout" : "API logout",
      pathname: after.pathname
    });
    if (!ok) {
      bug(
        "high",
        "Logout did not clear session",
        ["Log out", "Visit /dashboard"],
        after.href,
        "Redirect to /login",
        after.pathname,
        await shot(page, "logout-session-not-cleared")
      );
    }
  } catch (e) {
    record("auth", "Logout clears session", "fail", { note: e.message });
  }
}

async function testMobile(browser, creds) {
  console.log("\n== Mobile viewport ==");
  const iPhone = devices["iPhone 13"];
  const context = await browser.newContext({
    ...iPhone,
    baseURL: BASE
  });
  const page = await context.newPage();
  attachListeners(page, "mobile");
  try {
    await goto(page, `${BASE}/`);
    await dismissCookie(page);
    const menuBtn = page.locator('button[aria-label*="menu" i], button:has-text("Menu"), button[aria-label*="Open" i]').first();
    // common sheet trigger
    const sheetTrigger = page.locator("header button").filter({ has: page.locator("svg") }).first();
    let opened = false;
    if (await menuBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await menuBtn.click();
      opened = true;
    } else if (await sheetTrigger.isVisible({ timeout: 2000 }).catch(() => false)) {
      await sheetTrigger.click();
      opened = true;
    }
    await page.waitForTimeout(600);
    const sheet = page.locator('[role="dialog"], [data-state="open"]');
    const sheetVisible = await sheet.first().isVisible({ timeout: 2000 }).catch(() => false);
    record("mobile", "Marketing nav sheet", opened || sheetVisible ? "pass" : "warn", {
      note: sheetVisible ? "sheet open" : opened ? "clicked trigger" : "no menu trigger"
    });
    await shot(page, "mobile-marketing-nav");

    // Login + dashboard mobile
    const email = process.env.ZIVVY_EMAIL || creds.DEMO_BUSINESS_EMAIL || "demo@zivvy.xyz";
    const password = process.env.ZIVVY_PASSWORD || creds.DEMO_BUSINESS_PASSWORD || creds.DEMO_ARCADE_PASSWORD;
    const health = await loginForm(page, email, password);
    const ok = !health.loginRedirect;
    record("mobile", "Business login (mobile)", ok ? "pass" : "fail", { pathname: health.pathname });
    await shot(page, "mobile-dashboard");

    // Sidebar sheet in app
    const sidebarBtn = page.locator('button[data-sidebar="trigger"], button[aria-label*="sidebar" i], button[aria-label*="Toggle" i]').first();
    if (await sidebarBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await sidebarBtn.click();
      await page.waitForTimeout(500);
      record("mobile", "App sidebar sheet", "pass");
      await shot(page, "mobile-app-sidebar");
    } else {
      record("mobile", "App sidebar sheet", "warn", { note: "trigger not found" });
    }
  } catch (e) {
    record("mobile", "Mobile smoke", "fail", { note: e.message });
  } finally {
    await context.close();
  }
}

function summarizeVerdict() {
  const critical = results.bugs.filter((b) => b.severity === "critical").length;
  const high = results.bugs.filter((b) => b.severity === "high").length;
  const fails = results.checks.filter((c) => c.status === "fail").length;
  if (critical > 0 || fails > 8) return "fail";
  if (high > 0 || fails > 0 || results.bugs.length > 0) return "pass with issues";
  return "pass";
}

function writeReport() {
  results.finishedAt = now();
  results.verdict = summarizeVerdict();
  fs.writeFileSync(RESULTS_JSON, JSON.stringify(results, null, 2));

  const bySection = {};
  for (const c of results.checks) {
    bySection[c.section] = bySection[c.section] || { pass: 0, fail: 0, warn: 0, total: 0 };
    bySection[c.section][c.status] = (bySection[c.section][c.status] || 0) + 1;
    bySection[c.section].total++;
  }

  const lines = [];
  lines.push(`# Zivvy Full User QA Report`);
  lines.push("");
  lines.push(`**Date:** ${results.startedAt} → ${results.finishedAt}`);
  lines.push(`**Base:** ${BASE}`);
  lines.push(`**Account:** ${process.env.ZIVVY_EMAIL || "demo@zivvy.xyz"} (Business)`);
  lines.push(`**Verdict: ${results.verdict.toUpperCase()}**`);
  lines.push("");
  lines.push(`## 1. Summary`);
  lines.push("");
  lines.push(`- Checks: ${results.checks.length} (pass ${results.checks.filter((c) => c.status === "pass").length}, warn ${results.checks.filter((c) => c.status === "warn").length}, fail ${results.checks.filter((c) => c.status === "fail").length})`);
  lines.push(`- Bugs: ${results.bugs.length} (critical ${results.bugs.filter((b) => b.severity === "critical").length}, high ${results.bugs.filter((b) => b.severity === "high").length}, medium ${results.bugs.filter((b) => b.severity === "medium").length}, low ${results.bugs.filter((b) => b.severity === "low").length})`);
  lines.push(`- Console errors captured: ${results.consoleErrors.length}`);
  lines.push(`- Notable network failures (4xx/5xx on zivvy): ${results.networkFailures.length}`);
  lines.push("");
  lines.push(`### By section`);
  lines.push("");
  for (const [sec, s] of Object.entries(bySection)) {
    lines.push(`- **${sec}**: ${s.pass || 0} pass / ${s.warn || 0} warn / ${s.fail || 0} fail (of ${s.total})`);
  }
  lines.push("");
  lines.push(`## 2. What was tested`);
  lines.push("");
  lines.push(`- [x] Marketing pages: ${MARKETING_ROUTES.map((r) => r.href).join(", ")}`);
  lines.push(`- [x] Homepage nav mega-menus + HeroVideoDialog attempt + CTAs`);
  lines.push(`- [x] Auth: signup tab, update-password, wrong password, Business login, logout, session reload`);
  lines.push(`- [x] App modules (${APP_ROUTES.length} routes from launcher/sidebar inventory)`);
  lines.push(`- [x] Light detail open on sample lists; create/cancel on sample lists`);
  lines.push(`- [x] Billing plan context, search/awesomebar, notifications (if present)`);
  lines.push(`- [x] Mobile viewport: marketing nav + login + sidebar`);
  lines.push(`- [x] Console errors + failed network logging`);
  lines.push("");
  lines.push(`## 3. Bugs found`);
  lines.push("");
  if (!results.bugs.length) {
    lines.push(`_None recorded._`);
  } else {
    for (const [i, b] of results.bugs.entries()) {
      lines.push(`### ${i + 1}. [${b.severity.toUpperCase()}] ${b.title}`);
      lines.push("");
      lines.push(`- **URL:** ${b.url}`);
      lines.push(`- **Steps:** ${b.steps.join(" → ")}`);
      lines.push(`- **Expected:** ${b.expected}`);
      lines.push(`- **Actual:** ${b.actual}`);
      if (b.shot) lines.push(`- **Screenshot:** \`${b.shot}\``);
      lines.push("");
    }
  }
  lines.push(`## 4. Screenshots`);
  lines.push("");
  if (!results.screenshots.length) lines.push(`_None_`);
  else for (const s of results.screenshots) lines.push(`- \`${s}\``);
  lines.push("");
  lines.push(`## 5. Console / network notables`);
  lines.push("");
  const uniqConsole = [...new Map(results.consoleErrors.map((e) => [e.text, e])).values()].slice(0, 25);
  if (!uniqConsole.length) lines.push(`- No significant console errors.`);
  else {
    lines.push(`### Console`);
    for (const e of uniqConsole) lines.push(`- \`${e.tag}\` @ ${e.url}: ${e.text.replace(/\n/g, " ")}`);
  }
  lines.push("");
  const uniqNet = [...new Map(results.networkFailures.map((e) => [`${e.status}:${e.url}`, e])).values()].slice(0, 40);
  if (!uniqNet.length) lines.push(`### Network\n- No notable 4xx/5xx on zivvy hosts.`);
  else {
    lines.push(`### Network`);
    for (const e of uniqNet) lines.push(`- **${e.status}** ${e.url} (from ${e.page})`);
  }
  lines.push("");
  lines.push(`## 6. What could not be tested`);
  lines.push("");
  lines.push(`- Did not create real signup accounts (avoid spam / tenant pollution).`);
  lines.push(`- Did not complete Polar checkout / payment (live billing).`);
  lines.push(`- Did not run destructive deletes or submit irreversible documents.`);
  lines.push(`- AI features: only noted if visible in UI during walkthrough.`);
  lines.push(`- Print/PDF: only if controls appeared during detail opens.`);
  lines.push(`- Keyboard shortcuts beyond Cmd/Ctrl+K search probe.`);
  if (results.skipped.length) {
    for (const s of results.skipped) lines.push(`- ${s}`);
  }
  lines.push("");
  lines.push(`## 7. Checklist detail`);
  lines.push("");
  lines.push(`| Section | Name | Status | Notes |`);
  lines.push(`|---------|------|--------|-------|`);
  for (const c of results.checks) {
    const note = (c.detail && (c.detail.note || c.detail.pathname || c.detail.title) || "").toString().replace(/\|/g, "/").slice(0, 80);
    lines.push(`| ${c.section} | ${c.name} | ${c.status} | ${note} |`);
  }
  lines.push("");

  fs.writeFileSync(REPORT_MD, lines.join("\n"));
  console.log(`\nReport written: ${REPORT_MD}`);
  console.log(`JSON: ${RESULTS_JSON}`);
  console.log(`Verdict: ${results.verdict}`);
}

async function main() {
  const creds = loadCreds();
  if (!creds.DEMO_BUSINESS_PASSWORD) {
    console.error("Missing DEMO_BUSINESS_PASSWORD in .demo-credentials.local");
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    baseURL: BASE
  });
  const page = await context.newPage();
  attachListeners(page, "desktop");

  try {
    await testMarketing(page);
    const loggedIn = await testAuth(page, creds);
    if (loggedIn) {
      await testAppShell(page);
      await testLogout(page);
    } else {
      results.skipped.push("App shell skipped — Business login failed");
      record("app", "App shell suite", "fail", { note: "skipped due to login failure" });
    }
    await testMobile(browser, creds);
  } catch (e) {
    console.error("Fatal:", e);
    bug("critical", "QA runner fatal error", ["Run full_user_qa.cjs"], BASE, "Complete suite", e.message);
  } finally {
    await browser.close();
    writeReport();
  }

  process.exit(results.verdict === "fail" ? 1 : 0);
}

main();
