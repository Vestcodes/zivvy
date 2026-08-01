#!/usr/bin/env node
/**
 * Playwright quote → cash submit path for Acme / demo@zivvy.xyz.
 *
 * Flow (API mutations under a real browser session + UI verification):
 *   Customer + Item → Quotation (submit) → Sales Order (submit)
 *   → Sales Invoice (submit) → Payment Entry (submit)
 *
 * Usage:
 *   ZIVVY_EMAIL=demo@zivvy.xyz ZIVVY_PASSWORD=... node scripts/quote_to_cash_e2e.cjs
 *
 * Writes:
 *   e2e-screenshots/quote-cash/
 *   QUOTE_TO_CASH_REPORT.md
 *   ../../erpnext/QA_QUOTE_TO_CASH.json (if present)
 */
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const BASE = process.env.ZIVVY_BASE || "https://zivvy.xyz";
const API = process.env.ZIVVY_API || "https://api.zivvy.xyz";
const ROOT = path.resolve(__dirname, "..");
const CREDS_FILE = path.join(ROOT, ".demo-credentials.local");
const OUT = path.join(ROOT, "e2e-screenshots", "quote-cash");
const REPORT_MD = path.join(ROOT, "QUOTE_TO_CASH_REPORT.md");
const REPORT_JSON = path.resolve(__dirname, "../../erpnext/QA_QUOTE_TO_CASH.json");

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

const creds = loadCreds();
const EMAIL = process.env.ZIVVY_EMAIL || creds.DEMO_BUSINESS_EMAIL || "demo@zivvy.xyz";
const PASSWORD =
  process.env.ZIVVY_PASSWORD ||
  creds.DEMO_BUSINESS_PASSWORD ||
  creds.DEMO_ARCADE_PASSWORD;

const TAG = `Q2C-${Date.now().toString(36).toUpperCase()}`;
const results = {
  runAt: new Date().toISOString(),
  base: BASE,
  api: API,
  account: EMAIL,
  tag: TAG,
  steps: [],
  verdict: "FAIL",
};

function step(name, ok, detail = {}) {
  const safe = { ...detail };
  if (safe.error) safe.error = String(safe.error).replace(/password=[^&\s"\\]+/gi, "password=REDACTED");
  if (safe.detail) safe.detail = String(safe.detail).replace(/password=[^&\s"\\]+/gi, "password=REDACTED");
  const row = { name, ok, ...safe, at: new Date().toISOString() };
  results.steps.push(row);
  console.log(`${ok ? "✓" : "✗"} ${name}${safe.doc ? ` — ${safe.doc}` : ""}${safe.error ? ` — ${String(safe.error).slice(0, 120)}` : ""}`);
  return row;
}

async function login(page, context) {
  // API login avoids flaky form GET submits and keeps the password out of the URL bar.
  const res = await page.request.post(`${API}/api/method/login`, {
    form: { usr: EMAIL, pwd: PASSWORD },
    headers: { Accept: "application/json", Origin: BASE, Referer: `${BASE}/login` },
  });
  const status = res.status();
  if (status !== 200) {
    const body = await res.text();
    throw new Error(`API login failed ${status}: ${body.slice(0, 200)}`);
  }
  const setCookies = res.headersArray().filter((h) => h.name.toLowerCase() === "set-cookie");
  const jar = [];
  for (const { value } of setCookies) {
    const [pair, ...attrs] = value.split(";");
    const eq = pair.indexOf("=");
    if (eq < 0) continue;
    const name = pair.slice(0, eq).trim();
    const cookieValue = pair.slice(eq + 1).trim();
    const lower = attrs.map((a) => a.trim().toLowerCase());
    jar.push({
      name,
      value: cookieValue,
      domain: ".zivvy.xyz",
      path: "/",
      httpOnly: lower.some((a) => a === "httponly"),
      secure: true,
      sameSite: "Lax",
    });
    jar.push({
      name,
      value: cookieValue,
      domain: "api.zivvy.xyz",
      path: "/",
      httpOnly: lower.some((a) => a === "httponly"),
      secure: true,
      sameSite: "Lax",
    });
    jar.push({
      name,
      value: cookieValue,
      domain: "zivvy.xyz",
      path: "/",
      httpOnly: lower.some((a) => a === "httponly"),
      secure: true,
      sameSite: "Lax",
    });
  }
  await context.addCookies(jar);
  await page.goto(`${BASE}/dashboard`, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(1500);
  if (page.url().includes("/login")) {
    throw new Error("Cookie session did not open /dashboard");
  }
}

async function api(page, method, path, { data, headers } = {}) {
  const url = path.startsWith("http") ? path : `${API}${path}`;
  const cookies = await page.context().cookies();
  const csrf = cookies.find((c) => c.name === "csrf_token")?.value;
  const payload =
    data == null || typeof data === "string" || Buffer.isBuffer(data)
      ? data
      : JSON.stringify(data);
  const res = await page.request.fetch(url, {
    method,
    data: payload,
    headers: {
      Accept: "application/json",
      ...(csrf ? { "X-Frappe-CSRF-Token": decodeURIComponent(csrf) } : {}),
      ...(payload && method !== "GET" ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
  });
  const text = await res.text();
  let body = null;
  try {
    body = JSON.parse(text);
  } catch {
    body = { raw: text.slice(0, 500) };
  }
  return { status: res.status(), body };
}

async function insert(page, doc) {
  return api(page, "POST", `/api/resource/${encodeURIComponent(doc.doctype)}`, {
    data: { data: doc },
  });
}

async function submitDoc(page, doctype, name) {
  return api(page, "POST", "/api/method/frappe.client.submit", {
    data: { doc: { doctype, name } },
  });
}

async function call(page, method, args = {}) {
  return api(page, "POST", `/api/method/${method}`, {
    data: args,
  });
}

async function getDoc(page, doctype, name) {
  return api(
    page,
    "GET",
    `/api/resource/${encodeURIComponent(doctype)}/${encodeURIComponent(name)}`
  );
}

async function verifyUi(page, path, expectText) {
  await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(1200);
  const title = await page.title();
  const body = await page.locator("body").innerText().catch(() => "");
  const ok =
    !/could not be found|Application error|HTTP ERROR/i.test(body) &&
    !title.includes("404") &&
    (!expectText || body.includes(expectText) || title.includes(expectText));
  const shot = String(path).replace(/\W+/g, "_").slice(0, 60);
  await page.screenshot({ path: `${OUT}/${shot}.png`, fullPage: true }).catch(() => {});
  return { ok, title, sample: body.slice(0, 200) };
}

function writeReports() {
  const passed = results.steps.filter((s) => s.ok).length;
  const failed = results.steps.filter((s) => !s.ok).length;
  results.summary = { passed, failed, total: results.steps.length };
  results.verdict = failed === 0 ? "PASS" : passed >= 6 ? "PARTIAL" : "FAIL";

  fs.writeFileSync(REPORT_JSON, JSON.stringify(results, null, 2));

  const lines = [
    "# Quote → Cash Submit Path",
    "",
    `**When:** ${results.runAt}`,
    `**Account:** ${EMAIL}`,
    `**Tag:** ${TAG}`,
    `**Verdict:** ${results.verdict}`,
    "",
    `| Step | OK | Doc / note |`,
    `| --- | --- | --- |`,
    ...results.steps.map((s) => {
      const note = s.doc || s.error || s.detail || "";
      return `| ${s.name} | ${s.ok ? "yes" : "no"} | ${String(note).replace(/\|/g, "/").slice(0, 120)} |`;
    }),
    "",
    `Screenshots: \`${OUT}\``,
    "",
  ];
  fs.writeFileSync(REPORT_MD, lines.join("\n"));
  console.log(`\nVerdict: ${results.verdict}`);
  console.log(`Report: ${REPORT_MD}`);
  console.log(`JSON: ${REPORT_JSON}`);
}

(async () => {
  if (!PASSWORD) {
    console.error("Missing password (ZIVVY_PASSWORD or .demo-credentials.local)");
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: "ZivvyQuoteCash/1.0",
  });
  // Share cookies across zivvy.xyz and api.zivvy.xyz
  const page = await context.newPage();

  try {
    await login(page, context);
    step("Login", true, { detail: page.url() });

    const who = await api(page, "GET", "/api/method/frappe.auth.get_logged_user");
    step("API session", who.status === 200 && who.body?.message === EMAIL, {
      detail: who.body?.message || who.body?.exc_type || who.status,
    });

    const companyRes = await api(
      page,
      "GET",
      `/api/resource/Company?${new URLSearchParams({
        fields: JSON.stringify(["name"]),
        limit_page_length: "1",
      }).toString()}`
    );
    const company = companyRes.body?.data?.[0]?.name;
    step("Resolve company", !!company, { doc: company || companyRes.body?.exc_type });

    // --- masters ---
    const customerName = `Q2C Customer ${TAG}`;
    const custIns = await insert(page, {
      doctype: "Customer",
      customer_name: customerName,
      customer_type: "Company",
      customer_group: "Commercial",
      territory: "All Territories",
    });
    const customer = custIns.body?.data?.name;
    step("Create Customer", custIns.status === 200 && !!customer, {
      doc: customer,
      error:
        custIns.body?.exc_type ||
        custIns.body?.exception ||
        custIns.body?._server_messages ||
        JSON.stringify(custIns.body).slice(0, 200),
    });

    const itemCode = `IT-${TAG}`;
    const itemIns = await insert(page, {
      doctype: "Item",
      item_code: itemCode,
      item_name: `Q2C Item ${TAG}`,
      item_group: "Products",
      stock_uom: "Nos",
      is_stock_item: 0,
      is_sales_item: 1,
    });
    const item = itemIns.body?.data?.name || itemCode;
    step("Create Item", itemIns.status === 200, {
      doc: item,
      error: itemIns.body?.exc_type || itemIns.body?.exception,
    });

    if (!customer || itemIns.status !== 200) {
      results.verdict = "FAIL";
      writeReports();
      await browser.close();
      process.exit(1);
    }

    // --- Quotation ---
    const qtnIns = await insert(page, {
      doctype: "Quotation",
      quotation_to: "Customer",
      party_name: customer,
      company,
      items: [{ item_code: item, item_name: item, qty: 1, rate: 100, uom: "Nos" }],
    });
    const quotation = qtnIns.body?.data?.name;
    step("Create Quotation", qtnIns.status === 200 && !!quotation, {
      doc: quotation,
      error: qtnIns.body?.exc_type || qtnIns.body?.exception,
    });

    let qtnSub = { status: 0, body: {} };
    if (quotation) {
      qtnSub = await submitDoc(page, "Quotation", quotation);
      // frappe.client.submit returns the doc; also try method with doc dict from get
      if (qtnSub.status >= 400 || qtnSub.body?.exc_type) {
        const full = await getDoc(page, "Quotation", quotation);
        qtnSub = await api(page, "POST", "/api/method/frappe.client.submit", {
          data: { doc: full.body?.data },
        });
      }
      const qtnDoc = await getDoc(page, "Quotation", quotation);
      const submitted = qtnDoc.body?.data?.docstatus === 1;
      step("Submit Quotation", submitted, {
        doc: quotation,
        error: submitted ? undefined : qtnSub.body?.exc_type || qtnSub.body?.exception || `docstatus=${qtnDoc.body?.data?.docstatus}`,
      });
    }

    // --- Sales Order (from quotation when possible) ---
    let salesOrder = null;
    if (quotation) {
      const made = await call(page, "erpnext.selling.doctype.quotation.quotation.make_sales_order", {
        source_name: quotation,
      });
      if (made.status === 200 && made.body?.message) {
        const soDoc = made.body.message;
        soDoc.delivery_date = soDoc.delivery_date || "2026-08-15";
        for (const row of soDoc.items || []) {
          if (!row.delivery_date) row.delivery_date = soDoc.delivery_date;
        }
        const soIns = await insert(page, soDoc);
        salesOrder = soIns.body?.data?.name;
        step("Create Sales Order from Quotation", soIns.status === 200 && !!salesOrder, {
          doc: salesOrder,
          error: soIns.body?.exc_type || soIns.body?.exception,
        });
      } else {
        step("Create Sales Order from Quotation", false, {
          error: made.body?.exc_type || made.body?.exception || made.status,
        });
      }
    }

    if (!salesOrder) {
      const soIns = await insert(page, {
        doctype: "Sales Order",
        customer,
        company,
        delivery_date: "2026-08-15",
        items: [
          {
            item_code: item,
            qty: 1,
            rate: 100,
            uom: "Nos",
            delivery_date: "2026-08-15",
          },
        ],
      });
      salesOrder = soIns.body?.data?.name;
      step("Create Sales Order (direct)", soIns.status === 200 && !!salesOrder, {
        doc: salesOrder,
        error: soIns.body?.exc_type || soIns.body?.exception,
      });
    }

    if (salesOrder) {
      const full = await getDoc(page, "Sales Order", salesOrder);
      let soSub = await api(page, "POST", "/api/method/frappe.client.submit", {
        data: { doc: full.body?.data },
      });
      const soDoc2 = await getDoc(page, "Sales Order", salesOrder);
      const submitted = soDoc2.body?.data?.docstatus === 1;
      step("Submit Sales Order", submitted, {
        doc: salesOrder,
        error: submitted ? undefined : soSub.body?.exc_type || soSub.body?.exception || `docstatus=${soDoc2.body?.data?.docstatus}`,
      });
    }

    // --- Sales Invoice ---
    let salesInvoice = null;
    if (salesOrder) {
      const made = await call(
        page,
        "erpnext.selling.doctype.sales_order.sales_order.make_sales_invoice",
        { source_name: salesOrder }
      );
      if (made.status === 200 && made.body?.message) {
        const siDoc = made.body.message;
        const siIns = await insert(page, siDoc);
        salesInvoice = siIns.body?.data?.name;
        step("Create Sales Invoice from SO", siIns.status === 200 && !!salesInvoice, {
          doc: salesInvoice,
          error: siIns.body?.exc_type || siIns.body?.exception,
        });
      } else {
        step("Create Sales Invoice from SO", false, {
          error: made.body?.exc_type || made.body?.exception || made.status,
        });
      }
    }

    if (!salesInvoice && customer) {
      const siIns = await insert(page, {
        doctype: "Sales Invoice",
        customer,
        company,
        items: [{ item_code: item, qty: 1, rate: 100, uom: "Nos" }],
      });
      salesInvoice = siIns.body?.data?.name;
      step("Create Sales Invoice (direct)", siIns.status === 200 && !!salesInvoice, {
        doc: salesInvoice,
        error: siIns.body?.exc_type || siIns.body?.exception,
      });
    }

    if (salesInvoice) {
      const full = await getDoc(page, "Sales Invoice", salesInvoice);
      await api(page, "POST", "/api/method/frappe.client.submit", {
        data: { doc: full.body?.data },
      });
      const siDoc2 = await getDoc(page, "Sales Invoice", salesInvoice);
      const submitted = siDoc2.body?.data?.docstatus === 1;
      step("Submit Sales Invoice", submitted, {
        doc: salesInvoice,
        error: submitted ? undefined : siDoc2.body?.exc_type || `docstatus=${siDoc2.body?.data?.docstatus}`,
      });
    }

    // --- Payment Entry ---
    let paymentEntry = null;
    if (salesInvoice) {
      const siFull = await getDoc(page, "Sales Invoice", salesInvoice);
      const si = siFull.body?.data || {};
      const paidAmount = si.outstanding_amount || si.grand_total || 100;

      // Prefer helper when this bench supports it; otherwise build PE manually.
      const made = await call(
        page,
        "erpnext.accounts.doctype.payment_entry.payment_entry.get_payment_entry",
        { dt: "Sales Invoice", dn: salesInvoice }
      );
      if (made.status === 200 && made.body?.message) {
        const peDoc = made.body.message;
        for (const k of [
          "name",
          "creation",
          "modified",
          "modified_by",
          "owner",
          "idx",
          "docstatus",
          "amended_from",
        ]) {
          delete peDoc[k];
        }
        peDoc.doctype = "Payment Entry";
        if (!peDoc.mode_of_payment) peDoc.mode_of_payment = "Cash";
        const peIns = await insert(page, peDoc);
        paymentEntry = peIns.body?.data?.name;
        step("Create Payment Entry from SI", peIns.status === 200 && !!paymentEntry, {
          doc: paymentEntry,
          error: peIns.body?.exc_type || peIns.body?.exception,
        });
      }

      if (!paymentEntry) {
        const acctQ = new URLSearchParams({
          filters: JSON.stringify([
            ["Account", "company", "=", company || si.company],
            ["Account", "account_type", "in", ["Cash", "Bank"]],
            ["Account", "is_group", "=", 0],
          ]),
          fields: JSON.stringify(["name", "account_type"]),
          limit_page_length: "5",
        }).toString();
        const accts = await api(page, "GET", `/api/resource/Account?${acctQ}`);
        const cash =
          (accts.body?.data || []).find((a) => a.account_type === "Cash") ||
          (accts.body?.data || [])[0];
        const peDoc = {
          doctype: "Payment Entry",
          payment_type: "Receive",
          company: company || si.company,
          party_type: "Customer",
          party: si.customer || customer,
          paid_amount: paidAmount,
          received_amount: paidAmount,
          source_exchange_rate: 1,
          target_exchange_rate: 1,
          paid_from: si.debit_to,
          paid_to: cash?.name,
          mode_of_payment: "Cash",
          reference_no: TAG,
          reference_date: "2026-07-26",
          references: [
            {
              reference_doctype: "Sales Invoice",
              reference_name: salesInvoice,
              allocated_amount: paidAmount,
              outstanding_amount: paidAmount,
              total_amount: si.grand_total || paidAmount,
            },
          ],
        };
        const peIns = await insert(page, peDoc);
        paymentEntry = peIns.body?.data?.name;
        step("Create Payment Entry (manual)", peIns.status === 200 && !!paymentEntry, {
          doc: paymentEntry,
          error:
            peIns.body?.exc_type ||
            peIns.body?.exception ||
            made.body?.exc_type ||
            made.body?.exception ||
            JSON.stringify(peIns.body || made.body).slice(0, 220),
        });
      }
    }

    if (paymentEntry) {
      const full = await getDoc(page, "Payment Entry", paymentEntry);
      await api(page, "POST", "/api/method/frappe.client.submit", {
        data: { doc: full.body?.data },
      });
      const peDoc2 = await getDoc(page, "Payment Entry", paymentEntry);
      const submitted = peDoc2.body?.data?.docstatus === 1;
      step("Submit Payment Entry", submitted, {
        doc: paymentEntry,
        error: submitted ? undefined : peDoc2.body?.exc_type || peDoc2.body?.exception || `docstatus=${peDoc2.body?.data?.docstatus}`,
      });
    }

    // --- UI verification ---
    if (quotation) {
      const ui = await verifyUi(page, `/sales/quotations/${encodeURIComponent(quotation)}`, quotation);
      step("UI Quotation detail", ui.ok, { doc: quotation, detail: ui.title });
    }
    if (salesOrder) {
      const ui = await verifyUi(page, `/sales/orders/${encodeURIComponent(salesOrder)}`, salesOrder);
      step("UI Sales Order detail", ui.ok, { doc: salesOrder, detail: ui.title });
    }
    if (salesInvoice) {
      const ui = await verifyUi(
        page,
        `/sales/invoices/${encodeURIComponent(salesInvoice)}`,
        salesInvoice
      );
      step("UI Sales Invoice detail", ui.ok, { doc: salesInvoice, detail: ui.title });
    }

    results.created = { customer, item, quotation, salesOrder, salesInvoice, paymentEntry, company };
  } catch (e) {
    step("Unhandled error", false, { error: e.stack || String(e) });
  } finally {
    writeReports();
    await browser.close();
  }

  process.exit(results.verdict === "PASS" ? 0 : 1);
})();
