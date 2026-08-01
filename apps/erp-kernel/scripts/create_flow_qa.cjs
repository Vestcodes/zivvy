#!/usr/bin/env node
/**
 * Create-flow QA for Zivvy Business demo user.
 * Output: erpnext/QA_CREATE_FLOWS.json + QA_CREATE_FLOWS.md
 */
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const BASE = process.env.ZIVVY_BASE || "https://zivvy.xyz";
const ROOT = path.resolve(__dirname, "..");
const CREDS_FILE = path.join(ROOT, ".demo-credentials.local");
const OUT_JSON = path.resolve(__dirname, "../../erpnext/QA_CREATE_FLOWS.json");
const OUT_MD = path.resolve(__dirname, "../../erpnext/QA_CREATE_FLOWS.md");
const SHOT_DIR = path.join(ROOT, "e2e-screenshots", "create-qa");

const TS = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const TAG = TS.replace(/-/g, "").slice(0, 15);

fs.mkdirSync(SHOT_DIR, { recursive: true });
fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });

function loadCreds() {
  const raw = fs.readFileSync(CREDS_FILE, "utf8");
  const out = {};
  for (const line of raw.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return out;
}

const creds = loadCreds();
const EMAIL = creds.DEMO_BUSINESS_EMAIL || "demo.business@zivvy.xyz";
const PASSWORD = creds.DEMO_BUSINESS_PASSWORD;
const CRED_NOTE = creds.DEMO_BUSINESS_EMAIL ? "actimi/business from file" : "demo.business@zivvy.xyz (no email in creds file)";

const names = {
  customer: `QA Create Customer ${TS}`,
  lead: `QA Create Lead ${TS}`,
  itemCode: `QA-ITEM-${TAG}`,
  itemName: `QA Item ${TS}`,
  supplier: `QA Create Supplier ${TS}`,
  employee: `QA Create Employee ${TS}`,
};

const results = {
  runAt: new Date().toISOString(),
  base: BASE,
  account: EMAIL,
  credentialSource: CRED_NOTE,
  customerGroupTerritoryCheck: null,
  createdRefs: {},
  flows: [],
};

function addFlow(entry) {
  results.flows.push({ ...entry, at: new Date().toISOString() });
  console.log(`[${entry.outcome}] ${entry.doctype} (${entry.route})${entry.docName ? " -> " + entry.docName : ""}${entry.error ? " — " + entry.error : ""}`);
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

async function goto(page, url) {
  const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(1000);
  await dismissCookie(page);
  return res;
}

async function login(page) {
  await goto(page, `${BASE}/login`);
  await page.waitForSelector("#signin-email", { timeout: 25000 });
  await page.fill("#signin-email", EMAIL);
  await page.fill("#signin-password", PASSWORD);
  await Promise.all([
    page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 45000 }).catch(() => null),
    page.click('form button[type="submit"]'),
  ]);
  await page.waitForTimeout(2000);
  if (page.url().includes("/login")) {
    throw new Error("Login failed — still on login page");
  }
}

async function collectToasts(page) {
  await page.waitForTimeout(500);
  const texts = await page
    .locator("[data-sonner-toast], [data-sonner-toaster] [data-content], li[data-sonner-toast]")
    .allTextContents()
    .catch(() => []);
  return [...new Set(texts.map((t) => t.replace(/\s+/g, " ").trim()).filter(Boolean))];
}

async function collectAlerts(page) {
  return page.evaluate(() => {
    const alerts = [...document.querySelectorAll('[role="alert"]')].map((el) =>
      (el.textContent || "").replace(/\s+/g, " ").trim()
    );
    const fieldErr = [...document.querySelectorAll("[data-field] p[role=alert]")].map((el) =>
      (el.textContent || "").trim()
    );
    return { alerts, fieldErr };
  });
}

async function fieldState(page, fieldname) {
  return page.evaluate((fn) => {
    const wrap = document.querySelector(`[data-field="${fn}"]`);
    if (!wrap) return { found: false };
    const input = wrap.querySelector("input, textarea, button[role=combobox], [data-slot=select-trigger]");
    const ro = input?.disabled || input?.readOnly || wrap.querySelector("[disabled]");
    const label = wrap.querySelector("label")?.textContent?.trim() ?? fn;
    const val =
      input?.value ??
      wrap.querySelector("[data-slot=select-value]")?.textContent?.trim() ??
      "";
    return {
      found: true,
      disabled: !!(input?.disabled || wrap.querySelector("button[disabled], input[disabled]")),
      readOnly: !!input?.readOnly,
      label,
      value: String(val).slice(0, 120),
    };
  }, fieldname);
}

async function selectOption(page, fieldname, optionText) {
  const wrap = page.locator(`[data-field="${fieldname}"]`);
  const trigger = wrap.locator('[role="combobox"], button[data-slot="select-trigger"]').first();
  if (await trigger.isVisible({ timeout: 2000 }).catch(() => false)) {
    await trigger.click();
    await page.locator(`[role="option"]:has-text("${optionText}")`).first().click({ timeout: 5000 }).catch(async () => {
      await page.getByRole("option", { name: optionText, exact: true }).click({ timeout: 3000 }).catch(() => {});
    });
    return true;
  }
  return false;
}

async function fillDataField(page, fieldname, value) {
  const wrap = page.locator(`[data-field="${fieldname}"]`);
  await wrap.waitFor({ state: "visible", timeout: 15000 }).catch(() => {});
  const input = wrap.locator('input[type="text"], input:not([type="hidden"]):not([type="checkbox"])').first();
  if (await input.isVisible({ timeout: 2000 }).catch(() => false)) {
    if (await input.isDisabled().catch(() => false)) return "disabled";
    await input.click();
    await input.fill(value);
    return "filled";
  }
  const ta = wrap.locator("textarea").first();
  if (await ta.isVisible({ timeout: 1000 }).catch(() => false)) {
    await ta.fill(value);
    return "filled";
  }
  return "not-found";
}

async function fillLinkField(page, fieldname, query) {
  const wrap = page.locator(`[data-field="${fieldname}"]`);
  await wrap.waitFor({ state: "visible", timeout: 15000 }).catch(() => {});
  const input = wrap.locator("input").first();
  if (!(await input.isVisible({ timeout: 3000 }).catch(() => false))) return "not-found";
  if (await input.isDisabled().catch(() => false)) return "disabled";
  await input.click();
  await input.fill(query);
  await page.waitForTimeout(900);
  const opt = page.locator(`[data-field="${fieldname}"] button`).filter({ hasText: query }).first();
  if (await opt.isVisible({ timeout: 2000 }).catch(() => false)) {
    await opt.click();
    return "selected";
  }
  const anyOpt = page.locator(`[data-field="${fieldname}"]`).locator("..").locator("button").nth(1);
  const dropdownBtn = page.locator('div[class*="absolute"] button, [data-field="' + fieldname + '"] ~ div button').first();
  const listBtn = page.locator(`[data-field="${fieldname}"]`).locator("xpath=ancestor::div[1]//button[contains(@class,'w-full')]").nth(1);
  const candidates = page.locator("div.absolute.z-50 button, div[class*='shadow'] button").filter({ hasNotText: query });
  if (await candidates.first().isVisible({ timeout: 1500 }).catch(() => false)) {
    await candidates.first().click();
    return "selected-first";
  }
  await input.press("Enter");
  await page.waitForTimeout(400);
  return "enter-commit";
}

async function clickCreateOrSave(page) {
  const btn = page.locator('button:has-text("Create"), button:has-text("Save")').filter({ hasNotText: "Saved" }).last();
  await btn.waitFor({ state: "visible", timeout: 15000 });
  await btn.click();
  await page.waitForTimeout(2500);
}

async function waitFormReady(page) {
  await page.waitForSelector('[data-field], button:has-text("Create")', { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1500);
}

async function pageBroken(page) {
  return page.evaluate(() => {
    const t = (document.body?.innerText || "").replace(/\s+/g, " ");
    return (
      t.includes("Application error") ||
      t.includes("This page could not be found") ||
      t.includes("Internal Server Error") ||
      document.title.includes("404")
    );
  });
}

async function verifyInList(page, basePath, needle) {
  await goto(page, `${BASE}${basePath}?q=${encodeURIComponent(needle.slice(0, 40))}`);
  await page.waitForTimeout(1500);
  const link = page.locator(`a:has-text("${needle}")`).first();
  const visible = await link.isVisible({ timeout: 8000 }).catch(() => false);
  if (!visible) {
    const body = await page.locator("body").innerText();
    if (body.includes(needle)) return { inList: true, href: null };
    return { inList: false, href: null };
  }
  const href = await link.getAttribute("href");
  return { inList: true, href };
}

async function verifyDetail(page, href) {
  if (!href) return { detailOk: false, url: page.url() };
  const url = href.startsWith("http") ? href : `${BASE}${href}`;
  await goto(page, url);
  if (await pageBroken(page)) return { detailOk: false, url };
  const has404 = (await page.title()).includes("404") || page.url().includes("not-found");
  return { detailOk: !has404, url: page.url() };
}

async function attemptCreate(page, cfg) {
  const entry = {
    doctype: cfg.doctype,
    route: cfg.route,
    outcome: "CREATE_FAILED",
    error: null,
    docName: null,
    detailUrl: null,
    notes: cfg.notes || null,
  };

  try {
    await goto(page, `${BASE}${cfg.route}`);
    if (await pageBroken(page)) {
      entry.outcome = "FORM_BROKEN";
      entry.error = "Page error or 404 on form route";
      return entry;
    }

    const upgrade = await page.locator("text=/upgrade|not available on your plan/i").first().isVisible({ timeout: 1500 }).catch(() => false);
    if (upgrade) {
      entry.outcome = "FORM_BROKEN";
      entry.error = "Upgrade/plan gate on form";
      return entry;
    }

    await waitFormReady(page);
    if (!(await page.locator('[data-field]').first().isVisible({ timeout: 5000 }).catch(() => false))) {
      entry.outcome = "FORM_BROKEN";
      entry.error = "No form fields rendered";
      return entry;
    }

    if (cfg.fill) await cfg.fill(page);

    await clickCreateOrSave(page);
    const toasts = await collectToasts(page);
    const { alerts, fieldErr } = await collectAlerts(page);
    const errMsg = [...toasts, ...alerts, ...fieldErr].filter(Boolean).join(" | ") || null;

    const url = page.url();
    const stillNew = /\/new(\?|$)/.test(url);
    const docNameFromUrl = !stillNew ? decodeURIComponent(url.split("/").pop() || "") : null;

    if (stillNew && (errMsg || fieldErr.length)) {
      entry.outcome = "CREATE_FAILED";
      entry.error = errMsg;
      return entry;
    }

    if (stillNew && !errMsg) {
      entry.outcome = "CREATE_FAILED";
      entry.error = "Stayed on /new with no clear success";
      return entry;
    }

    entry.docName = docNameFromUrl;
    entry.detailUrl = url;

    if (cfg.skipListCheck) {
      entry.outcome = "CREATED";
      return entry;
    }

    const needle = cfg.listNeedle || entry.docName;
    const list = await verifyInList(page, cfg.listPath || cfg.route.replace(/\/new$/, ""), needle);
    if (!list.inList) {
      entry.outcome = "LIST_FAIL";
      entry.error = errMsg || `Document not found in list for "${needle}"`;
      return entry;
    }

    const detail = await verifyDetail(page, list.href || url.replace(BASE, ""));
    if (!detail.detailOk) {
      entry.outcome = "DETAIL_NOT_FOUND";
      entry.error = errMsg || "Detail page failed to load";
      entry.detailUrl = detail.url;
      return entry;
    }

    entry.outcome = "CREATED";
    entry.detailUrl = detail.url;
    if (errMsg) entry.notes = (entry.notes ? entry.notes + "; " : "") + `post-save messages: ${errMsg}`;
    return entry;
  } catch (e) {
    entry.outcome = entry.outcome === "CREATE_FAILED" ? "CREATE_FAILED" : "FORM_BROKEN";
    entry.error = e.message;
    return entry;
  }
}

async function checkCustomerGroupTerritory(page) {
  await goto(page, `${BASE}/sales/customers/new`);
  await waitFormReady(page);
  await selectOption(page, "customer_type", "Company").catch(() => {});
  await page.waitForTimeout(500);
  const cg = await fieldState(page, "customer_group");
  const terr = await fieldState(page, "territory");
  results.customerGroupTerritoryCheck = {
    customer_group: cg,
    territory: terr,
    canCreateWithout: "tested via customer create flow",
  };
}

function writeReports() {
  fs.writeFileSync(OUT_JSON, JSON.stringify(results, null, 2));

  const lines = [];
  lines.push("# QA Create Flows — Zivvy Business");
  lines.push("");
  lines.push(`- **Run:** ${results.runAt}`);
  lines.push(`- **Base:** ${results.base}`);
  lines.push(`- **Account:** \`${results.account}\` (${results.credentialSource})`);
  lines.push("");
  lines.push("## Customer Group / Territory");
  lines.push("");
  lines.push("```json");
  lines.push(JSON.stringify(results.customerGroupTerritoryCheck, null, 2));
  lines.push("```");
  lines.push("");
  lines.push("## Results");
  lines.push("");
  lines.push("| # | DocType | Route | Outcome | Doc name | Error |");
  lines.push("|---|---------|-------|---------|----------|-------|");
  results.flows.forEach((f, i) => {
    const err = (f.error || "").replace(/\|/g, "/").slice(0, 120);
    lines.push(`| ${i + 1} | ${f.doctype} | ${f.route} | ${f.outcome} | ${f.docName || "—"} | ${err || "—"} |`);
  });
  lines.push("");
  lines.push("## Created references");
  lines.push("");
  lines.push("```json");
  lines.push(JSON.stringify(results.createdRefs, null, 2));
  lines.push("```");
  fs.writeFileSync(OUT_MD, lines.join("\n"));
}

(async () => {
  if (!PASSWORD) {
    console.error("Missing DEMO_BUSINESS_PASSWORD");
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    console.log(`Logging in as ${EMAIL}...`);
    await login(page);

    await checkCustomerGroupTerritory(page);

    // 1 Customer
    const cust = await attemptCreate(page, {
      doctype: "Customer",
      route: "/sales/customers/new",
      listNeedle: names.customer,
      async fill(p) {
        await selectOption(p, "customer_type", "Company");
        await fillDataField(p, "customer_name", names.customer);
      },
    });
    addFlow(cust);
    if (cust.outcome === "CREATED") results.createdRefs.customer = { name: cust.docName, url: cust.detailUrl };

    // 2 Lead
    const lead = await attemptCreate(page, {
      doctype: "Lead",
      route: "/crm/leads/new",
      listNeedle: names.lead,
      async fill(p) {
        await fillDataField(p, "company_name", names.lead);
        await fillDataField(p, "lead_name", names.lead);
      },
    });
    addFlow(lead);
    if (lead.outcome === "CREATED") results.createdRefs.lead = { name: lead.docName, url: lead.detailUrl };

    // 3 Item
    const item = await attemptCreate(page, {
      doctype: "Item",
      route: "/stock/items/new",
      listNeedle: names.itemCode,
      async fill(p) {
        await fillDataField(p, "item_code", names.itemCode);
        await fillDataField(p, "item_name", names.itemName);
        await fillLinkField(p, "item_group", "Products");
        const ig = await fieldState(p, "item_group");
        if (!ig.value) await fillLinkField(p, "item_group", "All Item Groups");
        await selectOption(p, "stock_uom", "Nos").catch(() => fillDataField(p, "stock_uom", "Nos"));
      },
    });
    addFlow(item);
    if (item.outcome === "CREATED") results.createdRefs.item = { name: cust.docName ? item.docName : item.docName, code: names.itemCode, url: item.detailUrl };

    // 4 Quotation (if customer+item)
    const custName = results.createdRefs.customer?.name;
    const itemCode = names.itemCode;
    const quot = await attemptCreate(page, {
      doctype: "Quotation",
      route: "/sales/quotations/new",
      listNeedle: `QA-QUOT-${TAG}`,
      async fill(p) {
        if (custName) await fillLinkField(p, "party_name", custName);
        else await fillLinkField(p, "customer", names.customer);
        await fillDataField(p, "title", `QA-QUOT-${TAG}`);
        // Try add item row if UI exists
        const addRow = p.locator('button:has-text("Add Row"), button:has-text("Add item"), button:has-text("Add")').first();
        if (await addRow.isVisible({ timeout: 2000 }).catch(() => false)) {
          await addRow.click();
          await p.waitForTimeout(800);
        }
        await fillLinkField(p, "item_code", itemCode).catch(() => {});
      },
    });
    addFlow(quot);
    if (quot.outcome === "CREATED") results.createdRefs.quotation = { name: quot.docName, url: quot.detailUrl };

    // Sales Order attempt if quotation failed but we have customer
    if (quot.outcome !== "CREATED" && custName) {
      const so = await attemptCreate(page, {
        doctype: "Sales Order",
        route: "/sales/orders/new",
        listNeedle: `QA-SO-${TAG}`,
        async fill(p) {
          await fillLinkField(p, "customer", custName);
          await fillDataField(p, "po_no", `QA-SO-${TAG}`);
        },
      });
      addFlow(so);
      if (so.outcome === "CREATED") results.createdRefs.salesOrder = { name: so.docName, url: so.detailUrl };
    }

    // 5 Sales Invoice
    const sinv = await attemptCreate(page, {
      doctype: "Sales Invoice",
      route: "/sales/invoices/new",
      listNeedle: `QA-INV-${TAG}`,
      async fill(p) {
        if (custName) await fillLinkField(p, "customer", custName);
        await fillDataField(p, "title", `QA-INV-${TAG}`);
      },
    });
    addFlow(sinv);

    // 6 Journal Entry
    const je = await attemptCreate(page, {
      doctype: "Journal Entry",
      route: "/finance/journal/new",
      listNeedle: `QA-JE-${TAG}`,
      async fill(p) {
        await selectOption(p, "voucher_type", "Journal Entry").catch(() => {});
      },
    });
    addFlow(je);

    // 7 BOM
    const bom = await attemptCreate(page, {
      doctype: "BOM",
      route: "/manufacturing/bom/new",
      listNeedle: names.itemCode,
      async fill(p) {
        await fillLinkField(p, "item", itemCode);
        await fillDataField(p, "quantity", "1");
      },
    });
    addFlow(bom);

    // 8 Employee
    const emp = await attemptCreate(page, {
      doctype: "Employee",
      route: "/hr/employees/new",
      listNeedle: names.employee,
      async fill(p) {
        await fillDataField(p, "first_name", names.employee);
        await fillDataField(p, "employee_name", names.employee);
        await fillDataField(p, "company_email", `qa.${TAG}@example.com`);
      },
    });
    addFlow(emp);

    // 9 Supplier
    const sup = await attemptCreate(page, {
      doctype: "Supplier",
      route: "/purchases/suppliers/new",
      listNeedle: names.supplier,
      async fill(p) {
        await fillDataField(p, "supplier_name", names.supplier);
      },
    });
    addFlow(sup);

    // 10 Bank Account
    const bank = await attemptCreate(page, {
      doctype: "Bank Account",
      route: "/finance/banking/accounts/new",
      listNeedle: `QA Bank ${TAG}`,
      skipListCheck: false,
      listPath: "/finance/banking/accounts",
      async fill(p) {
        await fillDataField(p, "account_name", `QA Bank ${TAG}`);
        await fillDataField(p, "bank_account_no", `99${TAG.slice(-8)}`);
      },
    });
    addFlow(bank);

    writeReports();
    console.log(`\nWrote ${OUT_JSON}`);
    console.log(`Wrote ${OUT_MD}`);
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  results.flows.push({
    doctype: "RUNNER",
    route: "—",
    outcome: "FORM_BROKEN",
    error: e.message,
  });
  writeReports();
  process.exit(1);
});
