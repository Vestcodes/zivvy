#!/usr/bin/env node
/**
 * Create-flow QA — prefer sarwagya@actimi.com; fallback demo.business@zivvy.xyz
 * Output: erpnext/QA_CREATE_FLOWS_ACTIMI.json + QA_CREATE_FLOWS_ACTIMI.md
 */
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const BASE = process.env.ZIVVY_BASE || "https://zivvy.xyz";
const ROOT = path.resolve(__dirname, "..");
const CREDS_FILE = path.join(ROOT, ".demo-credentials.local");
const OUT_JSON = path.resolve(__dirname, "../../erpnext/QA_CREATE_FLOWS_ACTIMI.json");
const OUT_MD = path.resolve(__dirname, "../../erpnext/QA_CREATE_FLOWS_ACTIMI.md");
const SHOT_DIR = path.join(ROOT, "e2e-screenshots", "create-qa-actimi");

const DATE_TAG = "20260725";
const TS = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const TAG = TS.replace(/-/g, "").slice(0, 15);

const STORAGE_CANDIDATES = [
  path.join(ROOT, ".auth", "actimi.json"),
  path.join(ROOT, ".auth", "sarwagya@actimi.com.json"),
  path.join(ROOT, "e2e-screenshots", "auth-actimi.json"),
  process.env.ZIVVY_ACTIMI_STORAGE_STATE,
].filter(Boolean);

function loadCreds() {
  const out = {};
  if (!fs.existsSync(CREDS_FILE)) return out;
  for (const line of fs.readFileSync(CREDS_FILE, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return out;
}

const creds = loadCreds();

const results = {
  runAt: new Date().toISOString(),
  base: BASE,
  account: null,
  credentialSource: null,
  authMethod: null,
  customerGroupTerritoryCheck: null,
  itemGroupCheck: null,
  knownBugChecks: {},
  createdRefs: {},
  flows: [],
};

function addFlow(entry) {
  results.flows.push({ ...entry, at: new Date().toISOString() });
  const err = entry.error ? ` — ${String(entry.error).slice(0, 80)}` : "";
  console.log(`[${entry.outcome}] ${entry.doctype}${entry.docName ? " -> " + entry.docName : ""}${err}`);
}

async function dismissCookie(page) {
  const btn = page.locator(
    'button:has-text("Accept all"), button:has-text("Accept"), button:has-text("Essential only"), button:has-text("Got it")'
  );
  if (await btn.first().isVisible({ timeout: 1500 }).catch(() => false)) {
    await btn.first().click({ timeout: 2000 }).catch(() => {});
    await page.waitForTimeout(300);
  }
}

async function goto(page, routeOrUrl) {
  const url = routeOrUrl.startsWith("http") ? routeOrUrl : `${BASE}${routeOrUrl}`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(900);
  await dismissCookie(page);
}

async function tryLogin(page, email, password) {
  await goto(page, "/login");
  await page.waitForSelector("#signin-email", { timeout: 25000 });
  await page.fill("#signin-email", email);
  await page.fill("#signin-password", password);
  await Promise.all([
    page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 45000 }).catch(() => null),
    page.click('form button[type="submit"]'),
  ]);
  await page.waitForTimeout(1500);
  return !page.url().includes("/login");
}

async function resolveAuth(browser) {
  for (const storagePath of STORAGE_CANDIDATES) {
    if (storagePath && fs.existsSync(storagePath)) {
      const context = await browser.newContext({
        storageState: storagePath,
        viewport: { width: 1440, height: 900 },
      });
      const page = await context.newPage();
      await goto(page, "/dashboard");
      const ok = !page.url().includes("/login");
      if (ok) {
        results.account = "sarwagya@actimi.com";
        results.credentialSource = `storageState: ${storagePath}`;
        results.authMethod = "storageState";
        return { context, page };
      }
      await context.close();
    }
  }

  const actimiEmail = "sarwagya@actimi.com";
  const actimiPasswords = [
    process.env.ACTIMI_PASSWORD,
    process.env.SARWAGYA_ACTIMI_PASSWORD,
    creds.ACTIMI_PASSWORD,
    creds.SARWAGYA_PASSWORD,
  ].filter(Boolean);

  for (const pw of actimiPasswords) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    if (await tryLogin(page, actimiEmail, pw)) {
      results.account = actimiEmail;
      results.credentialSource = "sarwagya@actimi.com (password from env/creds file key)";
      results.authMethod = "login";
      return { context, page };
    }
    await context.close();
  }

  const demoEmail = "demo.business@zivvy.xyz";
  const demoPw = creds.DEMO_BUSINESS_PASSWORD || process.env.DEMO_BUSINESS_PASSWORD;
  if (!demoPw) throw new Error("No auth: missing storage state, actimi password, and DEMO_BUSINESS_PASSWORD");

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  if (!(await tryLogin(page, demoEmail, demoPw))) {
    throw new Error("Login failed for demo.business@zivvy.xyz");
  }
  results.account = demoEmail;
  results.credentialSource = "demo.business@zivvy.xyz + DEMO_BUSINESS_PASSWORD from .demo-credentials.local";
  results.authMethod = "login";
  return { context, page };
}

async function toasts(page) {
  const texts = await page.locator("[data-sonner-toast]").allTextContents().catch(() => []);
  return texts.join(" | ").replace(/\s+/g, " ").trim();
}

async function bodyText(page) {
  return page.locator("body").innerText().catch(() => "");
}

async function fieldState(page, fieldname) {
  return page.evaluate((fn) => {
    const wrap = document.querySelector(`[data-field="${fn}"]`);
    if (!wrap) return { found: false };
    const input = wrap.querySelector("input, textarea, button[data-slot=select-trigger], button[role=combobox]");
    const ph = input?.getAttribute("placeholder") || "";
    return {
      found: true,
      disabled: !!(input?.disabled || wrap.querySelector("input[disabled], button[disabled]")),
      placeholder: ph,
      value: input?.value || wrap.querySelector("[data-slot=select-value]")?.textContent?.trim() || "",
    };
  }, fieldname);
}

async function clickCreate(page) {
  const failures = [];
  page.on("response", (res) => {
    if (res.status() >= 500) failures.push(`${res.status()} ${res.url().slice(0, 120)}`);
  });
  await page.locator('button:has-text("Create")').last().click({ force: true });
  await page.waitForTimeout(5000);
  return failures;
}

async function verifyListDetail(page, listPath, needle, detailPath) {
  await goto(page, `${listPath}?q=${encodeURIComponent(needle.slice(0, 40))}`);
  const body = await bodyText(page);
  const inList = body.includes(needle);
  let listHref = null;
  const link = page.locator(`a:has-text("${needle.slice(0, 30)}")`).first();
  if (await link.isVisible({ timeout: 3000 }).catch(() => false)) {
    listHref = await link.getAttribute("href");
  }
  await goto(page, detailPath);
  const detailBody = await bodyText(page);
  const recordNotFound =
    /record not found|could not be found|not found/i.test(detailBody) ||
    (await page.title()).includes("404");
  return { inList, listHref, detailOk: !recordNotFound, detailSnippet: detailBody.slice(0, 200) };
}

async function runCreate(page, spec) {
  const flow = {
    doctype: spec.doctype,
    route: spec.route,
    outcome: "CREATE_FAILED",
    error: null,
    docName: null,
    detailUrl: null,
    notes: spec.notes || null,
  };
  try {
    await goto(page, spec.route);
    const broken = await page.locator("text=/This page could not be found|Application error/i").first().isVisible({ timeout: 1500 }).catch(() => false);
    if (broken) {
      flow.outcome = "FORM_BROKEN";
      flow.error = "404 or application error";
      return flow;
    }
    const hasForm = await page.locator('[data-field], button:has-text("Create")').first().isVisible({ timeout: 25000 }).catch(() => false);
    if (!hasForm) {
      flow.outcome = "FORM_BROKEN";
      flow.error = "No form fields rendered";
      return flow;
    }
    if (spec.fill) await spec.fill(page);
    const serverErrors = await clickCreate(page);
    flow.error = (await toasts(page)) || null;
    if (serverErrors.length) {
      flow.error = [flow.error, `HTTP: ${serverErrors.join("; ")}`].filter(Boolean).join(" | ");
    }
    const url = page.url();
    if (/\/new(\?|$)/.test(url)) {
      flow.outcome = "CREATE_FAILED";
      return flow;
    }
    flow.docName = decodeURIComponent(url.split("/").pop() || "");
    flow.detailUrl = url;
    if (spec.verify) {
      const v = await spec.verify(page, flow);
      flow.outcome = v.outcome;
      if (v.error) flow.error = v.error;
      if (v.detailUrl) flow.detailUrl = v.detailUrl;
    } else if (spec.listPath && spec.listNeedle) {
      const detailPath = url.replace(BASE, "");
      const v = await verifyListDetail(page, spec.listPath, spec.listNeedle, detailPath);
      if (!v.inList) flow.outcome = "LIST_FAIL";
      else if (!v.detailOk) flow.outcome = "DETAIL_NOT_FOUND";
      else flow.outcome = "CREATED";
      if (flow.outcome === "CREATED") flow.error = null;
    } else {
      flow.outcome = "CREATED";
      flow.error = null;
    }
    return flow;
  } catch (e) {
    flow.error = e.message;
    return flow;
  }
}

async function checkKnownBugQAAcme(page) {
  const name = "QA Acme GmbH";
  const encoded = encodeURIComponent(name);
  const check = { customerName: name, encodedPath: `/sales/customers/${encoded}`, account: results.account };
  await goto(page, `/sales/customers?q=${encoded}`);
  check.inList = (await bodyText(page)).includes(name);
  await goto(page, `/sales/customers/${encoded}`);
  const t = await bodyText(page);
  check.detailRecordNotFound = /record not found/i.test(t);
  check.detailOk = !check.detailRecordNotFound && !(await page.title()).includes("404");
  check.hypothesis = check.inList && check.detailRecordNotFound ? "list-vs-detail mismatch (likely name encoding / getDoc id)" : null;
  results.knownBugChecks.qaAcmeGmbH = check;
}

function writeMd() {
  const lines = [];
  lines.push("# QA Create Flows — Actimi / Business");
  lines.push("");
  lines.push(`- **Run:** ${results.runAt}`);
  lines.push(`- **Site:** ${results.base}`);
  lines.push(`- **User:** \`${results.account}\``);
  lines.push(`- **Auth:** ${results.authMethod} — ${results.credentialSource}`);
  lines.push("");
  lines.push("## Known bug: QA Acme GmbH");
  lines.push("");
  const k = results.knownBugChecks.qaAcmeGmbH;
  if (k) {
    lines.push(`| In list | Detail OK | Record not found on detail | Hypothesis |`);
    lines.push(`|---------|-----------|----------------------------|------------|`);
    lines.push(`| ${k.inList} | ${k.detailOk} | ${k.detailRecordNotFound} | ${k.hypothesis || "—"} |`);
    lines.push("");
    lines.push(`Detail path tested: \`${k.encodedPath}\``);
  }
  lines.push("");
  lines.push("## Customer Group / Territory / Item Group");
  lines.push("");
  if (results.customerGroupTerritoryCheck) {
    const cg = results.customerGroupTerritoryCheck;
    lines.push(`- Customer Group: found=${cg.customer_group.found}, disabled=${cg.customer_group.disabled}, placeholder="${cg.customer_group.placeholder || ""}"`);
    lines.push(`- Territory: found=${cg.territory.found}, disabled=${cg.territory.disabled}, placeholder="${cg.territory.placeholder || ""}"`);
  }
  if (results.itemGroupCheck) {
    lines.push(`- Item Group: disabled=${results.itemGroupCheck.disabled}, placeholder="${results.itemGroupCheck.placeholder || ""}"`);
  }
  lines.push("");
  lines.push("## Flow outcomes");
  lines.push("");
  lines.push("| DocType | Route | Outcome | Document | Error |");
  lines.push("|---------|-------|---------|----------|-------|");
  for (const f of results.flows) {
    const err = (f.error || "—").replace(/\|/g, "/").slice(0, 120);
    lines.push(`| ${f.doctype} | ${f.route} | ${f.outcome} | ${f.docName || "—"} | ${err} |`);
  }
  fs.writeFileSync(OUT_MD, lines.join("\n"));
  fs.writeFileSync(OUT_JSON, JSON.stringify(results, null, 2));
}

(async () => {
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });

  const browser = await chromium.launch({ headless: true });
  let context;
  let page;
  try {
    ({ context, page } = await resolveAuth(browser));

    await checkKnownBugQAAcme(page);

    await goto(page, "/sales/customers/new");
    await page.waitForSelector('[data-field="customer_type"]', { timeout: 30000 });
    await page.locator('[data-field="customer_type"] [role="combobox"]').click();
    await page.getByRole("option", { name: "Company" }).click();
    results.customerGroupTerritoryCheck = {
      customer_group: await fieldState(page, "customer_group"),
      territory: await fieldState(page, "territory"),
    };

    const customerSpaces = `QA Acme Flow ${TS}`;
    const customerNoSpaces = `QA-Acme-${DATE_TAG}`;

    const custSpaceFlow = await runCreate(page, {
      doctype: "Customer (spaces in name)",
      route: "/sales/customers/new",
      listPath: "/sales/customers",
      listNeedle: customerSpaces,
      async fill(p) {
        await p.locator('[data-field="customer_type"] [role="combobox"]').click();
        await p.getByRole("option", { name: "Company" }).click();
        await p.locator('[data-field="customer_name"] input').fill(customerSpaces);
      },
    });
    addFlow(custSpaceFlow);
    if (custSpaceFlow.outcome === "CREATED") results.createdRefs.customerSpaces = { name: custSpaceFlow.docName, url: custSpaceFlow.detailUrl };

    const custNoSpaceFlow = await runCreate(page, {
      doctype: "Customer (no spaces)",
      route: "/sales/customers/new",
      listPath: "/sales/customers",
      listNeedle: customerNoSpaces,
      async fill(p) {
        await p.locator('[data-field="customer_type"] [role="combobox"]').click();
        await p.getByRole("option", { name: "Company" }).click();
        await p.locator('[data-field="customer_name"] input').fill(customerNoSpaces);
      },
    });
    addFlow(custNoSpaceFlow);
    if (custNoSpaceFlow.outcome === "CREATED") results.createdRefs.customerNoSpaces = { name: custNoSpaceFlow.docName, url: custNoSpaceFlow.detailUrl };

    results.knownBugChecks.spaceEncodingIsolation = {
      spacesName: customerSpaces,
      spacesOutcome: custSpaceFlow.outcome,
      noSpacesName: customerNoSpaces,
      noSpacesOutcome: custNoSpaceFlow.outcome,
      isolatesEncodingBug: custNoSpaceFlow.outcome === "CREATED" && custSpaceFlow.outcome === "DETAIL_NOT_FOUND",
    };

    const leadLabel = `QA Lead ${TAG}`;
    const leadFlow = await runCreate(page, {
      doctype: "Lead",
      route: "/crm/leads/new",
      listPath: "/crm/leads",
      listNeedle: leadLabel,
      async fill(p) {
        await p.waitForSelector('[data-field="first_name"], [data-field="lead_name"]', { timeout: 30000 });
        if (await p.locator('[data-field="first_name"] input').isVisible().catch(() => false)) {
          await p.locator('[data-field="first_name"] input').fill("QA");
          await p.locator('[data-field="last_name"] input').fill(leadLabel).catch(() => {});
        }
        await p.locator('[data-field="lead_name"] input').fill(leadLabel).catch(() => {});
        await p.locator('[data-field="company_name"] input').fill(leadLabel).catch(() => {});
      },
    });
    addFlow(leadFlow);

    await goto(page, "/stock/items/new");
    await page.waitForSelector('[data-field="item_group"]', { timeout: 30000 });
    results.itemGroupCheck = await fieldState(page, "item_group");

    const itemCode = `QA-ITEM-${TAG}`;
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
          await p.locator("div.absolute.z-50 button").first().click({ force: true }).catch(() => {});
        }
      },
    });
    if (results.itemGroupCheck.disabled) {
      itemFlow.notes = "item_group disabled (No item group configured)";
      if (itemFlow.error) itemFlow.error += " | Item Group disabled in UI";
    }
    addFlow(itemFlow);

    const custRef =
      results.createdRefs.customerNoSpaces?.name ||
      results.createdRefs.customerSpaces?.name ||
      customerNoSpaces;

    addFlow(
      await runCreate(page, {
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
      })
    );

    addFlow(
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

    addFlow(
      await runCreate(page, {
        doctype: "Journal Entry",
        route: "/finance/journal/new",
        skipListCheck: true,
        async fill(p) {
          await p.locator('[data-field="voucher_type"] [role="combobox"]').click().catch(() => {});
          await p.getByRole("option", { name: "Journal Entry" }).click().catch(() => {});
        },
      })
    );

    addFlow(
      await runCreate(page, {
        doctype: "Supplier",
        route: "/purchases/suppliers/new",
        listPath: "/purchases/suppliers",
        listNeedle: `QA Supplier ${TAG}`,
        async fill(p) {
          await p.locator('[data-field="supplier_name"] input').fill(`QA Supplier ${TAG}`);
        },
      })
    );

    addFlow(
      await runCreate(page, {
        doctype: "Employee",
        route: "/hr/employees/new",
        listPath: "/hr/employees",
        listNeedle: `QA Emp ${TAG}`,
        async fill(p) {
          await p.locator('[data-field="first_name"] input').fill(`QA Emp ${TAG}`);
          const genderTrigger = p.locator('[data-field="gender"] button[data-slot="select-trigger"], [data-field="gender"] [role="combobox"]').first();
          if (await genderTrigger.isVisible({ timeout: 3000 }).catch(() => false)) {
            await genderTrigger.click();
            await p.getByRole("option", { name: "Male" }).click();
          }
          await p.locator('[data-field="company_email"] input').fill(`qa.${TAG}@example.com`).catch(() => {});
        },
      })
    );

    writeMd();
    console.log(`\nSaved ${OUT_JSON}\nSaved ${OUT_MD}`);
  } finally {
    if (context) await context.close().catch(() => {});
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  results.flows.push({ doctype: "RUNNER", route: "—", outcome: "FORM_BROKEN", error: e.message });
  try {
    writeMd();
  } catch (_) {}
  process.exit(1);
});
