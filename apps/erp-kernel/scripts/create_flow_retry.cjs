#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const BASE = "https://zivvy.xyz";
const ROOT = path.resolve(__dirname, "..");
const CREDS_FILE = path.join(ROOT, ".demo-credentials.local");
const OUT_JSON = path.resolve(__dirname, "../../erpnext/QA_CREATE_FLOWS.json");

const TS = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const TAG = TS.replace(/-/g, "").slice(0, 15);

function loadCreds() {
  const raw = fs.readFileSync(CREDS_FILE, "utf8");
  const out = {};
  for (const line of raw.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].trim();
  }
  return out;
}

const PASSWORD = loadCreds().DEMO_BUSINESS_PASSWORD;
const EMAIL = "demo.business@zivvy.xyz";

async function dismissCookie(page) {
  const btn = page.locator('button:has-text("Accept all"), button:has-text("Accept")');
  if (await btn.first().isVisible({ timeout: 1000 }).catch(() => false)) await btn.first().click().catch(() => {});
}

async function goto(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(900);
  await dismissCookie(page);
}

async function login(page) {
  await goto(page, `${BASE}/login`);
  await page.fill("#signin-email", EMAIL);
  await page.fill("#signin-password", PASSWORD);
  await Promise.all([
    page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 45000 }).catch(() => null),
    page.click('form button[type="submit"]'),
  ]);
  await page.waitForTimeout(1500);
}

async function selectOption(page, fieldname, optionText) {
  const wrap = page.locator(`[data-field="${fieldname}"]`);
  const trigger = wrap.locator('[role="combobox"], button[data-slot="select-trigger"]').first();
  if (!(await trigger.isVisible({ timeout: 2000 }).catch(() => false))) return false;
  await trigger.click({ force: true });
  await page.getByRole("option", { name: optionText }).click({ timeout: 5000 }).catch(async () => {
    await page.locator(`[role="option"]:has-text("${optionText}")`).first().click({ timeout: 3000 }).catch(() => {});
  });
  return true;
}

async function fillDataIfPresent(page, fieldname, value) {
  const wrap = page.locator(`[data-field="${fieldname}"]`);
  if (!(await wrap.isVisible({ timeout: 2000 }).catch(() => false))) return false;
  const el = wrap.locator("input, textarea").first();
  if (!(await el.isVisible({ timeout: 2000 }).catch(() => false))) return false;
  await el.fill(value, { force: true });
  return true;
}

async function fillLinkFirst(page, fieldname, query) {
  const wrap = page.locator(`[data-field="${fieldname}"]`);
  const input = wrap.locator("input").first();
  await input.click({ force: true });
  await input.fill(query);
  await page.waitForTimeout(1200);
  const option = page.locator("div.absolute.z-50 button, div[class*='z-50'] button").first();
  if (await option.isVisible({ timeout: 4000 }).catch(() => false)) {
    const txt = (await option.innerText()).trim();
    await option.click({ force: true });
    return txt;
  }
  await input.press("Enter");
  return query;
}

async function clickCreate(page) {
  await page.locator('button:has-text("Create")').last().click({ force: true });
  await page.waitForTimeout(3000);
}

async function toasts(page) {
  const t = await page.locator("[data-sonner-toast]").allTextContents().catch(() => []);
  return t.join(" | ");
}

async function verifyListDetail(page, basePath, needle, urlIfCreated) {
  if (!urlIfCreated) return {};
  await goto(page, `${BASE}${basePath}?q=${encodeURIComponent(needle.slice(0, 30))}`);
  const inList = await page.locator(`a:has-text("${needle}")`).first().isVisible({ timeout: 8000 }).catch(() => false);
  await goto(page, urlIfCreated);
  const detailOk = !(await page.title()).includes("404");
  return { inList, detailOk };
}

async function tryFlow(page, cfg) {
  await goto(page, `${BASE}${cfg.route}`);
  await page.waitForSelector('[data-field], button:has-text("Create")', { timeout: 20000 });
  await cfg.fill(page);
  await clickCreate(page);
  const err = await toasts(page);
  const url = page.url();
  const created = !/\/new(\?|$)/.test(url);
  let outcome = created ? "CREATED" : "CREATE_FAILED";
  let docName = created ? decodeURIComponent(url.split("/").pop()) : null;
  if (created && cfg.listNeedle) {
    const v = await verifyListDetail(page, cfg.listPath, cfg.listNeedle, url);
    if (!v.inList) outcome = "LIST_FAIL";
    if (!v.detailOk) outcome = "DETAIL_NOT_FOUND";
  }
  return { doctype: cfg.doctype, route: cfg.route, outcome, error: created && outcome === "CREATED" ? null : err, docName, detailUrl: created ? url : null, notes: cfg.notes || "retry" };
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await login(page);

  const leadName = `QA Create Lead ${TS}`;
  const itemCode = `QA-ITEM-${TAG}`;

  const retries = [];
  retries.push(await tryFlow(page, {
    doctype: "Lead",
    route: "/crm/leads/new",
    listPath: "/crm/leads",
    listNeedle: leadName,
    async fill(p) {
      await fillDataIfPresent(p, "first_name", "QA");
      await fillDataIfPresent(p, "last_name", leadName);
      await fillDataIfPresent(p, "lead_name", leadName);
    },
  }));

  retries.push(await tryFlow(page, {
    doctype: "Item",
    route: "/stock/items/new",
    listPath: "/stock/items",
    listNeedle: itemCode,
    async fill(p) {
      await fillDataIfPresent(p, "item_code", itemCode);
      await fillDataIfPresent(p, "item_name", `QA Item ${TS}`);
      await fillLinkFirst(p, "item_group", "Product");
      await selectOption(p, "stock_uom", "Nos").catch(() => fillDataIfPresent(p, "stock_uom", "Nos"));
    },
  }));

  const createdItem = retries.find((r) => r.doctype === "Item" && r.outcome === "CREATED")?.docName || itemCode;

  retries.push(await tryFlow(page, {
    doctype: "Employee",
    route: "/hr/employees/new",
    listPath: "/hr/employees",
    listNeedle: `QA Employee ${TS}`,
    async fill(p) {
      await fillDataIfPresent(p, "first_name", `QA Employee ${TS}`);
      await fillDataIfPresent(p, "employee_name", `QA Employee ${TS}`);
      await selectOption(p, "gender", "Male");
      await fillDataIfPresent(p, "company_email", `qa.emp.${TAG}@example.com`);
    },
  }));

  retries.push(await tryFlow(page, {
    doctype: "BOM",
    route: "/manufacturing/bom/new",
    listPath: "/manufacturing/bom",
    listNeedle: createdItem,
    async fill(p) {
      await fillLinkFirst(p, "item", createdItem);
      await p.locator("#field-quantity").fill("1", { force: true });
    },
  }));

  await browser.close();

  const base = JSON.parse(fs.readFileSync(OUT_JSON, "utf8"));
  for (const r of retries) {
    const idx = base.flows.findIndex((f) => f.doctype === r.doctype && f.route === r.route);
    if (idx >= 0) base.flows[idx] = { ...base.flows[idx], ...r, at: new Date().toISOString() };
    if (r.outcome === "CREATED" || r.outcome.startsWith("LIST") || r.outcome === "DETAIL_NOT_FOUND") {
      const key = r.doctype.charAt(0).toLowerCase() + r.doctype.slice(1).replace(/ /g, "");
      if (r.doctype === "Item") base.createdRefs.item = { name: r.docName, code: itemCode, url: r.detailUrl };
      if (r.doctype === "Lead") base.createdRefs.lead = { name: r.docName, url: r.detailUrl };
      if (r.doctype === "Employee") base.createdRefs.employee = { name: r.docName, url: r.detailUrl };
      if (r.doctype === "BOM") base.createdRefs.bom = { name: r.docName, url: r.detailUrl };
    }
  }
  base.retriedAt = new Date().toISOString();
  fs.writeFileSync(OUT_JSON, JSON.stringify(base, null, 2));

  // regenerate md
  const OUT_MD = path.resolve(__dirname, "../../erpnext/QA_CREATE_FLOWS.md");
  const lines = [];
  lines.push("# QA Create Flows — Zivvy Business");
  lines.push("");
  lines.push(`- **Run:** ${base.runAt}${base.retriedAt ? ` (retried ${base.retriedAt})` : ""}`);
  lines.push(`- **Base:** ${base.base}`);
  lines.push(`- **Account:** \`${base.account}\` (${base.credentialSource})`);
  lines.push("");
  lines.push("## Customer Group / Territory");
  lines.push("");
  lines.push(`- **customer_group:** disabled=${base.customerGroupTerritoryCheck.customer_group.disabled}, value empty at create — customer create **succeeded without setting them**`);
  lines.push(`- **territory:** disabled=${base.customerGroupTerritoryCheck.territory.disabled}, value empty at create`);
  lines.push("");
  lines.push("## Results");
  lines.push("");
  lines.push("| # | DocType | Route | Outcome | Doc name | Error |");
  lines.push("|---|---------|-------|---------|----------|-------|");
  base.flows.forEach((f, i) => {
    const err = (f.error || "").replace(/\|/g, "/").replace(/<[^>]+>/g, "").slice(0, 100);
    lines.push(`| ${i + 1} | ${f.doctype} | ${f.route} | ${f.outcome} | ${f.docName || "—"} | ${err || "—"} |`);
  });
  fs.writeFileSync(OUT_MD, lines.join("\n"));
  console.log(JSON.stringify(retries, null, 2));
})();
