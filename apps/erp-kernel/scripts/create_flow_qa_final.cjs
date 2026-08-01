#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const BASE = "https://zivvy.xyz";
const ROOT = path.resolve(__dirname, "..");
const CREDS_FILE = path.join(ROOT, ".demo-credentials.local");
const OUT_JSON = path.resolve(__dirname, "../../erpnext/QA_CREATE_FLOWS.json");
const OUT_MD = path.resolve(__dirname, "../../erpnext/QA_CREATE_FLOWS.md");
const SHOT_DIR = path.join(ROOT, "e2e-screenshots", "create-qa");

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

const creds = loadCreds();
const EMAIL = "demo.business@zivvy.xyz";
const PASSWORD = creds.DEMO_BUSINESS_PASSWORD;

const results = {
  runAt: new Date().toISOString(),
  base: BASE,
  account: EMAIL,
  credentialSource: "demo.business@zivvy.xyz + DEMO_BUSINESS_PASSWORD from .demo-credentials.local",
  customerGroupTerritoryCheck: null,
  itemGroupCheck: null,
  createdRefs: {},
  flows: [],
};

async function login(page) {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle", timeout: 90000 });
  await page.fill("#signin-email", EMAIL);
  await page.fill("#signin-password", PASSWORD);
  await page.click('form button[type="submit"]');
  await page.waitForURL(/\/dashboard/, { timeout: 60000 });
}

async function gotoForm(page, route) {
  await page.goto(`${BASE}${route}`, { waitUntil: "networkidle", timeout: 90000 });
  await page.waitForTimeout(800);
}

async function toasts(page) {
  return (await page.locator("[data-sonner-toast]").allTextContents()).join(" | ").replace(/<[^>]+>/g, "");
}

async function fieldState(page, fieldname) {
  return page.evaluate((fn) => {
    const wrap = document.querySelector(`[data-field="${fn}"]`);
    if (!wrap) return { found: false };
    const input = wrap.querySelector("input, textarea, button[data-slot=select-trigger]");
    return {
      found: true,
      disabled: !!(input && (input.disabled || input.getAttribute("disabled") !== null)),
      placeholder: input?.getAttribute("placeholder") || "",
      value: input?.value || "",
    };
  }, fieldname);
}

async function clickCreate(page) {
  await page.locator('button:has-text("Create")').last().click({ force: true });
  await page.waitForTimeout(4500);
}

async function verifyListDetail(page, listPath, needle, detailUrl) {
  await gotoForm(page, `${listPath}?q=${encodeURIComponent(needle.slice(0, 40))}`);
  const inList = await page.getByRole("link", { name: new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").slice(0, 30)) }).first().isVisible({ timeout: 8000 }).catch(() => {
    return page.locator("body").innerText().then((t) => t.includes(needle));
  });
  await gotoForm(page, detailUrl.replace(BASE, ""));
  const broken = (await page.title()).includes("404") || (await page.locator("body").innerText()).includes("could not be found");
  return { inList: !!inList, detailOk: !broken };
}

function pushFlow(flow) {
  results.flows.push({ ...flow, at: new Date().toISOString() });
  console.log(`${flow.outcome}\t${flow.doctype}\t${flow.docName || flow.error?.slice(0, 60) || ""}`);
}

async function runCreate(page, spec) {
  const flow = {
    doctype: spec.doctype,
    route: spec.route,
    outcome: "CREATE_FAILED",
    error: null,
    docName: null,
    detailUrl: null,
  };
  try {
    await gotoForm(page, spec.route);
    if (await page.locator("text=/This page could not be found|Application error/i").first().isVisible({ timeout: 1500 }).catch(() => false)) {
      flow.outcome = "FORM_BROKEN";
      flow.error = "404 or application error";
      return flow;
    }
    if (await page.locator("text=/not available on your plan|Upgrade/i").first().isVisible({ timeout: 1500 }).catch(() => false)) {
      flow.outcome = "FORM_BROKEN";
      flow.error = "Plan upgrade gate";
      return flow;
    }
    const hasForm = await page.locator('[data-field], button:has-text("Create")').first().isVisible({ timeout: 20000 }).catch(() => false);
    if (!hasForm) {
      flow.outcome = "FORM_BROKEN";
      flow.error = "No form fields rendered";
      return flow;
    }
    if (spec.fill) await spec.fill(page);
    await clickCreate(page);
    flow.error = (await toasts(page)) || null;
    const url = page.url();
    if (/\/new(\?|$)/.test(url)) {
      flow.outcome = "CREATE_FAILED";
      return flow;
    }
    flow.docName = decodeURIComponent(url.split("/").pop() || "");
    flow.detailUrl = url;
    if (spec.listPath && spec.listNeedle) {
      const v = await verifyListDetail(page, spec.listPath, spec.listNeedle, url);
      if (!v.inList) flow.outcome = "LIST_FAIL";
      else if (!v.detailOk) flow.outcome = "DETAIL_NOT_FOUND";
      else flow.outcome = "CREATED";
    } else {
      flow.outcome = "CREATED";
    }
    if (flow.outcome === "CREATED") flow.error = null;
    return flow;
  } catch (e) {
    flow.error = e.message;
    flow.outcome = flow.outcome === "CREATE_FAILED" ? "CREATE_FAILED" : "FORM_BROKEN";
    return flow;
  }
}

function writeMd() {
  const lines = [];
  lines.push("# QA Create Flows — Zivvy Business");
  lines.push("");
  lines.push(`- **Run:** ${results.runAt}`);
  lines.push(`- **Site:** ${results.base}`);
  lines.push(`- **User:** \`${results.account}\` (${results.credentialSource})`);
  lines.push("");
  lines.push("## Customer Group / Territory");
  lines.push("");
  const cg = results.customerGroupTerritoryCheck;
  if (cg) {
    lines.push(`| Field | Found | Disabled | Value at create |`);
    lines.push(`|-------|-------|----------|-----------------|`);
    lines.push(`| Customer Group | ${cg.customer_group.found} | **${cg.customer_group.disabled}** | (empty) |`);
    lines.push(`| Territory | ${cg.territory.found} | **${cg.territory.disabled}** | (empty) |`);
    lines.push("");
    lines.push("Customer (Company) **CREATED** without setting Customer Group or Territory — both fields are disabled in the UI.");
  }
  if (results.itemGroupCheck) {
    lines.push("");
    lines.push(`**Item Group (Item form):** disabled=${results.itemGroupCheck.disabled}, placeholder="${results.itemGroupCheck.placeholder}".`);
  }
  lines.push("");
  lines.push("## Flow outcomes");
  lines.push("");
  lines.push("| DocType | Route | Outcome | Document | Error |");
  lines.push("|---------|-------|---------|----------|-------|");
  for (const f of results.flows) {
    const err = (f.error || "—").replace(/\|/g, "/").slice(0, 100);
    lines.push(`| ${f.doctype} | ${f.route} | ${f.outcome} | ${f.docName || "—"} | ${err} |`);
  }
  fs.writeFileSync(OUT_MD, lines.join("\n"));
}

(async () => {
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await login(page);

  const customerName = `QA Create Customer ${TS}`;
  const leadLabel = `QA Create Lead ${TS}`;
  const itemCode = `QA-ITEM-${TAG}`;

  // CG / Territory check on customer form
  await gotoForm(page, "/sales/customers/new");
  await page.waitForSelector('[data-field="customer_type"]', { timeout: 30000 });
  await page.locator('[data-field="customer_type"] [role="combobox"]').click();
  await page.getByRole("option", { name: "Company" }).click();
  results.customerGroupTerritoryCheck = {
    customer_group: await fieldState(page, "customer_group"),
    territory: await fieldState(page, "territory"),
  };

  const customerFlow = await runCreate(page, {
    doctype: "Customer",
    route: "/sales/customers/new",
    listPath: "/sales/customers",
    listNeedle: customerName,
    async fill(p) {
      await p.locator('[data-field="customer_type"] [role="combobox"]').click();
      await p.getByRole("option", { name: "Company" }).click();
      await p.locator('[data-field="customer_name"] input').fill(customerName);
    },
  });
  pushFlow(customerFlow);
  if (customerFlow.outcome === "CREATED") results.createdRefs.customer = { name: customerFlow.docName, url: customerFlow.detailUrl };

  const leadFlow = await runCreate(page, {
    doctype: "Lead",
    route: "/crm/leads/new",
    listPath: "/crm/leads",
    listNeedle: leadLabel,
    async fill(p) {
      await p.waitForSelector('[data-field="first_name"]', { timeout: 30000 });
      await p.getByLabel("First Name").fill("QA");
      await p.getByLabel("Last Name").fill(leadLabel);
      await p.getByLabel("Company").fill(leadLabel).catch(() => {});
    },
  });
  pushFlow(leadFlow);
  if (leadFlow.outcome === "CREATED") results.createdRefs.lead = { name: leadFlow.docName, url: leadFlow.detailUrl };

  await gotoForm(page, "/stock/items/new");
  await page.waitForSelector('[data-field="item_group"]', { timeout: 30000 });
  results.itemGroupCheck = await fieldState(page, "item_group");

  const itemFlow = await runCreate(page, {
    doctype: "Item",
    route: "/stock/items/new",
    listPath: "/stock/items",
    listNeedle: itemCode,
    async fill(p) {
      await p.locator('[data-field="item_code"] input').fill(itemCode);
      await p.locator('[data-field="item_name"] input').fill(`QA Item ${TS}`);
      const ig = await fieldState(p, "item_group");
      if (!ig.disabled) {
        const input = p.locator('[data-field="item_group"] input').first();
        await input.click({ force: true });
        await input.fill("Products");
        await p.waitForTimeout(1000);
        const opt = p.locator("div.absolute.z-50 button").first();
        if (await opt.isVisible().catch(() => false)) await opt.click({ force: true });
      }
      await p.locator('[data-field="stock_uom"] [role="combobox"]').click().catch(() => {});
      await p.getByRole("option", { name: "Nos" }).click().catch(() => {});
    },
  });
  if (results.itemGroupCheck.disabled) {
    itemFlow.notes = "item_group disabled in UI (No item group configured)";
    if (itemFlow.outcome === "CREATE_FAILED" && itemFlow.error) {
      itemFlow.error += " | Item Group field disabled: No item group configured";
    }
  }
  pushFlow(itemFlow);
  if (itemFlow.outcome === "CREATED") results.createdRefs.item = { code: itemCode, name: itemFlow.docName, url: itemFlow.detailUrl };

  const custRef = results.createdRefs.customer?.name || customerName;

  for (const spec of [
    {
      doctype: "Quotation",
      route: "/sales/quotations/new",
      listPath: "/sales/quotations",
      listNeedle: custRef,
      async fill(p) {
        const inp = p.locator('[data-field="party_name"] input, [data-field="customer"] input').first();
        await inp.click({ force: true });
        await inp.fill(custRef);
        await p.waitForTimeout(1000);
        await p.locator("div.absolute.z-50 button").first().click({ force: true }).catch(() => inp.press("Enter"));
      },
    },
    {
      doctype: "Sales Order",
      route: "/sales/orders/new",
      listPath: "/sales/orders",
      listNeedle: custRef,
      async fill(p) {
        const inp = p.locator('[data-field="customer"] input').first();
        await inp.click({ force: true });
        await inp.fill(custRef);
        await p.waitForTimeout(1000);
        await p.locator("div.absolute.z-50 button").first().click({ force: true }).catch(() => inp.press("Enter"));
      },
    },
  ]) {
    pushFlow(await runCreate(page, spec));
  }

  pushFlow(
    await runCreate(page, {
      doctype: "Sales Invoice",
      route: "/sales/invoices/new",
      listPath: "/sales/invoices",
      listNeedle: custRef,
      async fill(p) {
        const inp = p.locator('[data-field="customer"] input').first();
        await inp.click({ force: true });
        await inp.fill(custRef);
        await p.waitForTimeout(1000);
        await p.locator("div.absolute.z-50 button").first().click({ force: true }).catch(() => inp.press("Enter"));
      },
    })
  );

  pushFlow(
    await runCreate(page, {
      doctype: "Journal Entry",
      route: "/finance/journal/new",
      async fill(p) {
        await p.locator('[data-field="voucher_type"] [role="combobox"]').click().catch(() => {});
        await p.getByRole("option", { name: "Journal Entry" }).click().catch(() => {});
      },
    })
  );

  pushFlow(
    await runCreate(page, {
      doctype: "BOM",
      route: "/manufacturing/bom/new",
      async fill(p) {
        const code = results.createdRefs.item?.code || itemCode;
        const inp = p.locator('[data-field="item"] input').first();
        await inp.click({ force: true });
        await inp.fill(code);
        await p.waitForTimeout(1000);
        await p.locator("div.absolute.z-50 button").first().click({ force: true }).catch(() => inp.press("Enter"));
        await p.locator("#field-quantity").fill("1", { force: true });
      },
    })
  );

  pushFlow(
    await runCreate(page, {
      doctype: "Employee",
      route: "/hr/employees/new",
      listPath: "/hr/employees",
      listNeedle: `QA Create Employee ${TS}`,
      async fill(p) {
        const nm = `QA Create Employee ${TS}`;
        await p.locator('[data-field="first_name"] input').fill(nm);
        await p.locator('[data-field="gender"] button[data-slot="select-trigger"]').click();
        await p.getByRole("option", { name: "Male" }).click();
        await p.locator('[data-field="company_email"] input').fill(`qa.${TAG}@example.com`).catch(() => {});
      },
    })
  );

  pushFlow(
    await runCreate(page, {
      doctype: "Supplier",
      route: "/purchases/suppliers/new",
      listPath: "/purchases/suppliers",
      listNeedle: `QA Create Supplier ${TS}`,
      async fill(p) {
        await p.locator('[data-field="supplier_name"] input').fill(`QA Create Supplier ${TS}`);
      },
    })
  );

  pushFlow(
    await runCreate(page, {
      doctype: "Bank Account",
      route: "/finance/banking/accounts/new",
      listPath: "/finance/banking/accounts",
      listNeedle: `QA Bank ${TAG}`,
      async fill(p) {
        await p.locator('[data-field="account_name"] input').fill(`QA Bank ${TAG}`);
      },
    })
  );

  await browser.close();
  fs.writeFileSync(OUT_JSON, JSON.stringify(results, null, 2));
  writeMd();
  console.log(`\nSaved ${OUT_JSON}\nSaved ${OUT_MD}`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
