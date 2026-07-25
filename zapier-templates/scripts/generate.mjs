#!/usr/bin/env node
/**
 * Generate Zapier templates parallel to n8n-templates:
 *  1) recipes/*.json — Catch Hook Zap blueprints (any Zapier plan)
 *  2) integration/   — Platform CLI app (REST Hook triggers + creates)
 *
 * Docs checked:
 *  - https://docs.zapier.com/integrations/build-cli/overview
 *  - https://docs.zapier.com/integrations/build/cli-hook-trigger
 *  - https://docs.zapier.com/integrations/build/apikeyauth
 *  - https://integrate.zivvy.xyz/openapi.json  (POST /v1/webhooks)
 *  - Production emit verbs: created|updated|deleted|submitted|cancelled
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const API = "https://api.zivvy.xyz";
const INTEGRATE = "https://integrate.zivvy.xyz";

const AREAS = [
  {
    id: "01",
    key: "crm_lead_created",
    area: "CRM",
    name: "Zivvy CRM — New Lead → Slack",
    events: ["leads.created"],
    resource: "leads",
    noun: "Lead",
    triggerLabel: "New Lead",
    triggerDesc: "Triggers when a lead is created in Zivvy.",
    slackText: "New Zivvy lead {{name}} (status {{status}})",
    createKey: "lead",
    createFields: [
      { key: "lead_name", label: "Lead Name", required: true },
      { key: "email_id", label: "Email", required: false },
      { key: "status", label: "Status", required: false, default: "Open" }
    ]
  },
  {
    id: "02",
    key: "sales_order_submitted",
    area: "Sales",
    name: "Zivvy Sales — Order Submitted → Fulfillment",
    events: ["sales-orders.submitted"],
    resource: "sales-orders",
    noun: "Sales Order",
    triggerLabel: "Sales Order Submitted",
    triggerDesc: "Triggers when a sales order is submitted.",
    slackText: "Sales Order {{name}} submitted for {{customer}} (total {{grand_total}})",
    createKey: null
  },
  {
    id: "03",
    key: "billing_invoice",
    area: "Billing & Accounting",
    name: "Zivvy Billing — Invoice / Payment Events",
    events: [
      "sales-invoices.submitted",
      "sales-invoices.updated",
      "payment-entries.submitted"
    ],
    resource: "sales-invoices",
    noun: "Invoice Event",
    triggerLabel: "Invoice or Payment Event",
    triggerDesc:
      "Triggers on sales invoice submitted/updated or payment entry submitted.",
    slackText: "{{event}}: {{name}} party={{customer}} total={{grand_total}}",
    createKey: null
  },
  {
    id: "04",
    key: "purchasing_po",
    area: "Purchasing",
    name: "Zivvy Purchasing — PO / Receipt Submitted",
    events: ["purchase-orders.submitted", "purchase-receipts.submitted"],
    resource: "purchase-orders",
    noun: "Purchase Event",
    triggerLabel: "Purchase Order or Receipt Submitted",
    triggerDesc: "Triggers when a PO or purchase receipt is submitted.",
    slackText: "{{event}}: {{name}} supplier={{supplier}}",
    createKey: null
  },
  {
    id: "05",
    key: "stock_movement",
    area: "Stock",
    name: "Zivvy Stock — Movements & New Items",
    events: [
      "stock-entries.submitted",
      "items.created",
      "delivery-notes.submitted"
    ],
    resource: "stock-entries",
    noun: "Stock Event",
    triggerLabel: "Stock Movement or Item Created",
    triggerDesc: "Triggers on stock entry / delivery note submit or item create.",
    slackText: "{{event}}: {{name}}",
    createKey: "item",
    createFields: [
      { key: "item_code", label: "Item Code", required: true },
      { key: "item_name", label: "Item Name", required: false },
      { key: "item_group", label: "Item Group", required: true, default: "Products" },
      { key: "stock_uom", label: "Default UOM", required: true, default: "Nos" }
    ]
  },
  {
    id: "06",
    key: "banking_transaction",
    area: "Banking",
    name: "Zivvy Banking — Bank Transaction",
    events: ["bank-transactions.created", "bank-transactions.updated"],
    resource: "bank-transactions",
    noun: "Bank Transaction",
    triggerLabel: "New or Updated Bank Transaction",
    triggerDesc: "Triggers when a bank transaction is created or updated.",
    slackText: "Bank txn {{name}} ({{event}})",
    createKey: null
  },
  {
    id: "07",
    key: "hr_people",
    area: "HR & People",
    name: "Zivvy HR — Leave / Expense / Employee",
    events: [
      "leave-applications.created",
      "leave-applications.updated",
      "leave-applications.submitted",
      "expense-claims.created",
      "expense-claims.updated",
      "expense-claims.submitted",
      "employees.created"
    ],
    resource: "leave-applications",
    noun: "HR Event",
    triggerLabel: "Leave, Expense, or Employee Event",
    triggerDesc:
      "Triggers on leave/expense create|update|submit or employee create. Filter by status in Zap.",
    slackText: "{{event}}: {{name}} employee={{employee}} status={{status}}",
    createKey: "employee",
    createFields: [
      { key: "first_name", label: "First Name", required: true },
      { key: "last_name", label: "Last Name", required: false },
      { key: "gender", label: "Gender", required: true, default: "Other" },
      { key: "date_of_joining", label: "Date of Joining", required: true },
      { key: "date_of_birth", label: "Date of Birth", required: true },
      { key: "company", label: "Company", required: true }
    ]
  },
  {
    id: "08",
    key: "projects_tasks",
    area: "Projects",
    name: "Zivvy Projects — Task / Timesheet",
    events: [
      "tasks.created",
      "tasks.updated",
      "timesheets.submitted",
      "projects.updated"
    ],
    resource: "tasks",
    noun: "Project Event",
    triggerLabel: "Task, Timesheet, or Project Update",
    triggerDesc: "Triggers on task create/update, timesheet submit, or project update.",
    slackText: "{{event}}: {{name}} status={{status}}",
    createKey: "task",
    createFields: [
      { key: "subject", label: "Subject", required: true },
      { key: "project", label: "Project", required: false },
      { key: "status", label: "Status", required: false, default: "Open" },
      { key: "priority", label: "Priority", required: false }
    ]
  },
  {
    id: "09",
    key: "manufacturing",
    area: "Manufacturing",
    name: "Zivvy Manufacturing — Work Order / BOM",
    events: [
      "work-orders.submitted",
      "work-orders.updated",
      "boms.created",
      "job-cards.updated"
    ],
    resource: "work-orders",
    noun: "Manufacturing Event",
    triggerLabel: "Work Order / BOM / Job Card Event",
    triggerDesc: "Triggers on work order submit/update, BOM create, or job card update.",
    slackText: "{{event}}: {{name}} status={{status}}",
    createKey: null
  },
  {
    id: "10",
    key: "support_ticket",
    area: "Support",
    name: "Zivvy Support — Ticket / Issue",
    events: [
      "support-tickets.created",
      "support-tickets.updated",
      "issues.created",
      "issues.updated"
    ],
    resource: "support-tickets",
    noun: "Support Ticket",
    triggerLabel: "Support Ticket or Issue Event",
    triggerDesc: "Triggers when a helpdesk ticket or issue is created/updated.",
    slackText: "{{event}}: {{name}} status={{status}}",
    createKey: null
  }
];

mkdirSync(join(ROOT, "recipes"), { recursive: true });
mkdirSync(join(ROOT, "integration", "triggers"), { recursive: true });
mkdirSync(join(ROOT, "integration", "creates"), { recursive: true });
mkdirSync(join(ROOT, "integration", "test"), { recursive: true });

// ─── shared Code by Zapier snippets ──────────────────────────────────────────

const HMAC_CODE = `// Code by Zapier — optional signature check
// Production signs: X-Zivvy-Signature: sha256=<hmac_sha256(secret, raw_body)>
// Catch Hook usually only gives parsed JSON, so re-serialize compactly.
// Prefer REST Hook private integration for reliable delivery auth.
const crypto = require('crypto');
const secret = inputData.webhook_secret;
const sig = inputData.signature_header || '';
const payload = {
  event: inputData.event,
  resource: inputData.resource,
  data: typeof inputData.data === 'string' ? JSON.parse(inputData.data) : inputData.data,
  timestamp: inputData.timestamp
};
const raw = JSON.stringify(payload);
const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(raw).digest('hex');
const ok = sig.length === expected.length &&
  crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
if (!ok) {
  throw new Error('Invalid Zivvy webhook signature');
}
return { ...payload, signature_valid: true };`;

const FILTER_CODE = `// Keep only subscribed events for this Zap
const allowed = String(inputData.allowed_events || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const event = inputData.event || '';
if (allowed.length && !allowed.includes(event) && !allowed.includes('*')) {
  // Returning [] stops the Zap for Catch Hook + Filter patterns when used
  // with Paths / Filter — here we throw so the step fails closed.
  throw new Error('Event ' + event + ' not in allowed list');
}
return {
  event,
  resource: inputData.resource,
  name: inputData.name,
  customer: inputData.customer || '',
  supplier: inputData.supplier || '',
  employee: inputData.employee || '',
  status: inputData.status || '',
  grand_total: inputData.grand_total || '',
  timestamp: inputData.timestamp || ''
};`;

writeFileSync(join(ROOT, "recipes", "_shared-hmac-code.js"), HMAC_CODE + "\n");
writeFileSync(join(ROOT, "recipes", "_shared-filter-code.js"), FILTER_CODE + "\n");

// ─── recipes ─────────────────────────────────────────────────────────────────

const manifestRecipes = [];

for (const a of AREAS) {
  const recipe = {
    version: "1.0.0",
    kind: "zivvy-zapier-catch-hook-recipe",
    name: a.name,
    area: a.area,
    docs: {
      zapier: [
        "https://help.zapier.com/hc/en-us/articles/8496288691469-Trigger-Zaps-from-webhooks",
        "https://help.zapier.com/hc/en-us/articles/8496257774221-Use-Code-by-Zapier"
      ],
      zivvy: [
        `${INTEGRATE}/docs`,
        "https://zivvy.xyz/integrations/zapier"
      ]
    },
    events: a.events,
    steps: [
      {
        step: 1,
        app: "Webhooks by Zapier",
        action: "Catch Hook",
        notes: [
          "Copy the Catch Hook URL",
          "In Zivvy Settings → Developer (or POST /v1/webhooks) register that URL",
          `Subscribe events: ${a.events.join(", ")}`,
          "Zapier owns hooks.zapier.com — HMAC is optional; URL secrecy is primary auth"
        ]
      },
      {
        step: 2,
        app: "Code by Zapier",
        action: "Run Javascript",
        input: {
          allowed_events: a.events.join(","),
          event: "{{1. event}}",
          resource: "{{1. resource}}",
          name: "{{1. data__name}}",
          customer: "{{1. data__customer}}",
          supplier: "{{1. data__supplier}}",
          employee: "{{1. data__employee}}",
          status: "{{1. data__status}}",
          grand_total: "{{1. data__grand_total}}",
          timestamp: "{{1. timestamp}}"
        },
        code_file: "_shared-filter-code.js"
      },
      {
        step: 3,
        app: "Filter by Zapier",
        action: "Only continue if…",
        conditions: [
          {
            field: "2. event",
            op: "(Text) Exactly matches",
            value: a.events[0],
            or_any_of: a.events
          }
        ],
        notes: ["Or skip Filter if Code step already enforces allowed_events"]
      },
      {
        step: 4,
        app: "Webhooks by Zapier",
        action: "GET",
        url: `${API}/v1/${a.resource}/{{2. name}}`,
        headers: {
          Authorization: "Bearer {{ZIVVY_API_KEY}}",
          Accept: "application/json"
        },
        notes: [
          "Optional enrich. Store zk_live_ key in Zapier Storage or a Zapier secret field.",
          "OpenAPI also documents X-API-Key — gateway accepts the integrate.zivvy.xyz key header."
        ]
      },
      {
        step: 5,
        app: "Slack",
        action: "Send Channel Message",
        message: a.slackText
          .replace(/\{\{(\w+)\}\}/g, "{{2. $1}}")
          .replace("{{2. event}}", "{{2. event}}"),
        notes: ["Swap Slack for Email, Sheets, HubSpot, etc."]
      }
    ],
    curl_register: `curl -X POST ${INTEGRATE}/v1/webhooks \\
  -H "Authorization: Bearer $ZIVVY_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://hooks.zapier.com/hooks/catch/XXXX/YYYY/",
    "events": ${JSON.stringify(a.events)},
    "label": "${a.area} Zap",
    "secret": "$ZIVVY_WEBHOOK_SECRET"
  }'`
  };

  const file = `${a.id}-${a.key.replace(/_/g, "-")}.json`;
  writeFileSync(join(ROOT, "recipes", file), JSON.stringify(recipe, null, 2) + "\n");

  const md = `# ${a.name}

**Area:** ${a.area}  
**Events:** ${a.events.map((e) => `\`${e}\``).join(", ")}

## Build in Zapier (Catch Hook — any plan)

1. **Trigger:** Webhooks by Zapier → **Catch Hook** → copy URL  
2. **Zivvy:** register webhook (Developer settings or API below) for the events listed  
3. **Code by Zapier:** paste \`recipes/_shared-filter-code.js\`, map fields from step 1  
4. **Filter (optional):** only continue when \`event\` is one of the listed events  
5. **Action:** Slack / Sheets / Email — use mapped fields from Code step  
6. **Optional enrich:** Webhooks by Zapier GET \`${API}/v1/${a.resource}/{{name}}\` with Bearer \`zk_live_\`

## Register webhook

\`\`\`bash
${recipe.curl_register}
\`\`\`

## Sample payload (production)

\`\`\`json
{
  "event": "${a.events[0]}",
  "resource": "${a.resource}",
  "data": {
    "name": "SAMPLE-0001",
    "doctype": "Example",
    "status": "Open"
  },
  "timestamp": "2026-07-25T12:00:00"
}
\`\`\`

## Native integration alternative

Import/push \`zapier-templates/integration\` (Platform CLI) for a first-class **${a.triggerLabel}** trigger — see root README.
`;

  writeFileSync(
    join(ROOT, "recipes", file.replace(/\.json$/, ".md")),
    md
  );

  manifestRecipes.push({
    file: `recipes/${file}`,
    guide: `recipes/${file.replace(/\.json$/, ".md")}`,
    name: a.name,
    area: a.area,
    events: a.events,
    integration_trigger: a.key
  });
}

// ─── Platform CLI integration ────────────────────────────────────────────────

const authJs = `// API Key auth — https://docs.zapier.com/integrations/build/apikeyauth
// Zivvy keys: zk_live_… from Settings → Developer
// Gateway accepts Authorization: Bearer (marketing) and X-API-Key (OpenAPI).

const testAuth = async (z, bundle) => {
  const response = await z.request({
    url: '${INTEGRATE}/v1/webhooks/events',
    method: 'GET',
  });
  return response.data;
};

module.exports = {
  type: 'custom',
  fields: [
    {
      key: 'api_key',
      label: 'Zivvy API Key',
      type: 'string',
      required: true,
      helpText:
        'Create a zk_live_ key in Zivvy → Settings → Developer. Used as Bearer token.',
    },
  ],
  test: testAuth,
  connectionLabel: 'Zivvy API',
};
`;

const middlewareJs = `// Attach auth on every request — Zapier CLI beforeRequest middleware
const includeApiKey = (request, z, bundle) => {
  const key = bundle.authData.api_key;
  if (!key) return request;
  request.headers = request.headers || {};
  request.headers.Authorization = \`Bearer \${key}\`;
  // Also set OpenAPI-documented header for gateways that prefer it
  request.headers['X-API-Key'] = key.replace(/^Bearer\\s+/i, '');
  return request;
};

module.exports = { includeApiKey };
`;

function triggerModule(a) {
  const eventsLiteral = JSON.stringify(a.events);
  return `// REST Hook trigger — https://docs.zapier.com/integrations/build/cli-hook-trigger
// Subscribe via POST ${INTEGRATE}/v1/webhooks

const EVENTS = ${eventsLiteral};

const subscribeHook = async (z, bundle) => {
  const response = await z.request({
    url: '${INTEGRATE}/v1/webhooks',
    method: 'POST',
    body: {
      url: bundle.targetUrl,
      events: EVENTS,
      label: \`Zapier: ${a.triggerLabel}\`,
      secret: bundle.inputData.webhook_secret || undefined,
    },
  });
  // Expect { id | name, ... }
  return response.data;
};

const unsubscribeHook = async (z, bundle) => {
  const id =
    bundle.subscribeData.id ||
    bundle.subscribeData.name ||
    bundle.subscribeData.webhook_id;
  if (!id) return {};
  await z.request({
    url: \`${INTEGRATE}/v1/webhooks/\${id}\`,
    method: 'DELETE',
  });
  return {};
};

const parsePayload = (z, bundle) => {
  const body = bundle.cleanedRequest || {};
  const data = body.data || {};
  const row = {
    id: data.name || body.delivery_id || z.hash('md5', JSON.stringify(body)),
    event: body.event,
    resource: body.resource,
    name: data.name,
    doctype: data.doctype,
    customer: data.customer || '',
    supplier: data.supplier || '',
    employee: data.employee || '',
    status: data.status || '',
    grand_total: data.grand_total || '',
    modified: data.modified || '',
    timestamp: body.timestamp || '',
    raw: body,
  };
  // perform MUST return an array
  return [row];
};

const performList = async (z, bundle) => {
  // Fallback sample poll for Zap editor mapping
  const response = await z.request({
    url: '${INTEGRATE}/v1/${a.resource}',
    method: 'GET',
    params: { limit: 3 },
  });
  const rows = response.data?.data || response.data?.results || response.data || [];
  const list = Array.isArray(rows) ? rows : [];
  if (!list.length) {
    return [
      {
        id: 'SAMPLE-0001',
        event: EVENTS[0],
        resource: '${a.resource}',
        name: 'SAMPLE-0001',
        status: 'Open',
        timestamp: new Date().toISOString(),
      },
    ];
  }
  return list.slice(0, 3).map((r) => ({
    id: r.name || r.id,
    event: EVENTS[0],
    resource: '${a.resource}',
    name: r.name || r.id,
    customer: r.customer || '',
    supplier: r.supplier || '',
    employee: r.employee || '',
    status: r.status || '',
    grand_total: r.grand_total || '',
    timestamp: r.modified || r.creation || '',
  }));
};

module.exports = {
  key: '${a.key}',
  noun: '${a.noun}',
  display: {
    label: '${a.triggerLabel}',
    description: '${a.triggerDesc.replace(/'/g, "\\\\'")}',
  },
  operation: {
    type: 'hook',
    inputFields: [
      {
        key: 'webhook_secret',
        label: 'Webhook signing secret (optional)',
        type: 'string',
        required: false,
        helpText:
          'Stored on the Zivvy webhook for HMAC. Zapier Catch URLs do not verify HMAC; useful if you later move to a custom URL.',
      },
    ],
    performSubscribe: subscribeHook,
    performUnsubscribe: unsubscribeHook,
    perform: parsePayload,
    performList,
    sample: {
      id: 'SAMPLE-0001',
      event: EVENTS[0],
      resource: '${a.resource}',
      name: 'SAMPLE-0001',
      doctype: 'Sample',
      customer: 'CUST-001',
      status: 'Open',
      grand_total: '100.00',
      timestamp: '2026-07-25T12:00:00Z',
    },
    outputFields: [
      { key: 'id', label: 'ID' },
      { key: 'event', label: 'Event' },
      { key: 'resource', label: 'Resource' },
      { key: 'name', label: 'Document Name' },
      { key: 'customer', label: 'Customer' },
      { key: 'supplier', label: 'Supplier' },
      { key: 'employee', label: 'Employee' },
      { key: 'status', label: 'Status' },
      { key: 'grand_total', label: 'Grand Total' },
      { key: 'timestamp', label: 'Timestamp' },
    ],
  },
};
`;
}

function createModule(a) {
  if (!a.createKey || !a.createFields) return null;
  const resource =
    a.createKey === "lead"
      ? "leads"
      : a.createKey === "item"
        ? "items"
        : a.createKey === "employee"
          ? "employees"
          : a.createKey === "task"
            ? "tasks"
            : a.resource;
  const fieldsCode = a.createFields
    .map(
      (f) => `      {
        key: '${f.key}',
        label: '${f.label}',
        type: 'string',
        required: ${!!f.required},
        ${f.default ? `default: '${f.default}',` : ""}
      }`
    )
    .join(",\n");

  return `// Create action — POST ${INTEGRATE}/v1/${resource}

const perform = async (z, bundle) => {
  const body = {};
  ${a.createFields.map((f) => `  if (bundle.inputData.${f.key} !== undefined && bundle.inputData.${f.key} !== '') body.${f.key} = bundle.inputData.${f.key};`).join("\n")}
  const response = await z.request({
    url: '${INTEGRATE}/v1/${resource}',
    method: 'POST',
    body,
  });
  return response.data?.data || response.data;
};

module.exports = {
  key: 'create_${a.createKey}',
  noun: '${a.noun}',
  display: {
    label: 'Create ${a.noun}',
    description: 'Create a ${a.noun.toLowerCase()} in Zivvy via REST.',
  },
  operation: {
    inputFields: [
${fieldsCode}
    ],
    perform,
    sample: {
      name: 'SAMPLE-CREATED',
      ${a.createFields[0].key}: 'Sample',
    },
  },
};
`;
}

const triggerRequires = [];
const createRequires = [];

for (const a of AREAS) {
  const tPath = join(ROOT, "integration", "triggers", `${a.key}.js`);
  writeFileSync(tPath, triggerModule(a));
  triggerRequires.push(`  ${a.key}: require('./triggers/${a.key}')`);

  const c = createModule(a);
  if (c) {
    const cPath = join(ROOT, "integration", "creates", `create_${a.createKey}.js`);
    writeFileSync(cPath, c);
    createRequires.push(
      `  create_${a.createKey}: require('./creates/create_${a.createKey}')`
    );
  }
}

writeFileSync(join(ROOT, "integration", "authentication.js"), authJs);
writeFileSync(join(ROOT, "integration", "middleware.js"), middlewareJs);

const indexJs = `const authentication = require('./authentication');
const { includeApiKey } = require('./middleware');

const App = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,

  authentication,

  beforeRequest: [includeApiKey],

  triggers: {
${triggerRequires.join(",\n")}
  },

  creates: {
${createRequires.join(",\n")}
  },

  searches: {},
};

module.exports = App;
`;

writeFileSync(join(ROOT, "integration", "index.js"), indexJs);

writeFileSync(
  join(ROOT, "integration", "package.json"),
  JSON.stringify(
    {
      name: "zivvy-zapier",
      version: "1.0.0",
      description:
        "Zivvy Zapier Platform CLI integration — REST Hook triggers for main ERP areas + create actions.",
      main: "index.js",
      scripts: {
        test: "jest --testTimeout=10000",
        validate: "zapier-platform validate",
        push: "zapier-platform push"
      },
      engines: { node: ">=18", npm: ">=9" },
      dependencies: {
        "zapier-platform-core": "17.9.1"
      },
      devDependencies: {
        jest: "^29.7.0",
        "zapier-platform-cli": "17.9.1"
      },
      private: true
    },
    null,
    2
  ) + "\n"
);

writeFileSync(
  join(ROOT, "integration", "test", "triggers.test.js"),
  `const zapier = require('zapier-platform-core');
const App = require('../index');
const appTester = zapier.createAppTester(App);

describe('Zivvy triggers parsePayload', () => {
  for (const [key, trigger] of Object.entries(App.triggers)) {
    test(key + ' perform returns array with id', async () => {
      const bundle = {
        cleanedRequest: {
          event: 'test.event',
          resource: 'test',
          data: { name: 'DOC-1', status: 'Open', customer: 'C1' },
          timestamp: '2026-07-25T12:00:00Z',
        },
      };
      const results = await appTester(trigger.operation.perform, bundle);
      expect(Array.isArray(results)).toBe(true);
      expect(results[0].name).toBe('DOC-1');
      expect(results[0].id).toBeTruthy();
    });
  }
});
`
);

writeFileSync(
  join(ROOT, "integration", ".zapierapprc"),
  JSON.stringify({ id: 0, key: "Zivvy" }, null, 2) + "\n"
);

writeFileSync(
  join(ROOT, "integration", ".gitignore"),
  `node_modules/\n.zapier*\n!.zapierapprc\n.env\n*.log\n`
);

// ─── README + compliance + manifest ─────────────────────────────────────────

const readme = `# Zivvy ↔ Zapier templates

Same coverage as [\`n8n-templates/\`](../n8n-templates): **10 main areas**, production event verbs, webhook + REST.

Two ways to use them (Zapier docs–compliant):

| Path | Who it's for | Docs |
|------|--------------|------|
| **A. Catch Hook recipes** (\`recipes/\`) | Any Zapier plan, no CLI | [Webhooks by Zapier](https://help.zapier.com/hc/en-us/articles/8496288691469) |
| **B. Platform CLI integration** (\`integration/\`) | Private/public Zivvy app with REST Hooks | [CLI overview](https://docs.zapier.com/integrations/build-cli/overview), [Hook triggers](https://docs.zapier.com/integrations/build/cli-hook-trigger) |

## Areas

| # | Area | Recipe | CLI trigger key |
|---|------|--------|-----------------|
${AREAS.map(
  (a) =>
    `| ${a.id} | ${a.area} | \`recipes/${a.id}-${a.key.replace(/_/g, "-")}.md\` | \`${a.key}\` |`
).join("\n")}

## Path A — Catch Hook (fastest)

1. Open the area \`.md\` under \`recipes/\`
2. Create Zap: **Webhooks by Zapier → Catch Hook**
3. Register the Catch URL in Zivvy (\`POST ${INTEGRATE}/v1/webhooks\` or Settings → Developer)
4. Add **Code by Zapier** using \`_shared-filter-code.js\`
5. Add Slack / Sheets / Email action

\`zk_live_\` key from Settings → Developer. Auth header: \`Authorization: Bearer zk_live_…\` (also send \`X-API-Key\` if your gateway requires OpenAPI style).

## Path B — Platform CLI (native triggers)

\`\`\`bash
cd zapier-templates/integration
npm install
npx zapier-platform login
npx zapier-platform register "Zivvy"
npx zapier-platform validate
npm test
npx zapier-platform push
\`\`\`

Then in Zapier: use private app **Zivvy** → pick e.g. **New Lead** / **Sales Order Submitted**.

Subscribe/unsubscribe calls:

- \`POST ${INTEGRATE}/v1/webhooks\` with \`bundle.targetUrl\`
- \`DELETE ${INTEGRATE}/v1/webhooks/:id\`

Creates included: Lead, Item, Employee, Task.

## Signature notes

Production signs \`X-Zivvy-Signature: sha256=<hmac(body)>\` (\`webhooks.py\`).

- **Catch Hook / REST Hook to hooks.zapier.com:** Zapier accepts the POST; URL secrecy is the trust boundary (standard for Zapier webhooks). Optional Code step \`_shared-hmac-code.js\` can attempt verify if you map headers + rebuild compact JSON.
- **Custom HTTPS endpoint:** verify HMAC like n8n templates.

## Event verbs (real)

\`created | updated | deleted | submitted | cancelled\` only — no fictional \`*.paid\` / \`*.approved\` until the backend emits them.

## Regenerate

\`\`\`bash
node zapier-templates/scripts/generate.mjs
\`\`\`
`;

writeFileSync(join(ROOT, "README.md"), readme);

const compliance = `# Docs compliance — Zapier templates

Checked 2026-07-25.

## Zapier

| Doc | Applied |
|-----|---------|
| [CLI overview](https://docs.zapier.com/integrations/build-cli/overview) | \`integration/\` Platform CLI app shape (\`index.js\`, triggers, creates, auth) |
| [Hook trigger](https://docs.zapier.com/integrations/build/cli-hook-trigger) | \`type: 'hook'\`, \`performSubscribe\` / \`performUnsubscribe\` / \`perform\` returns **array**, \`performList\` for editor samples |
| [API Key auth](https://docs.zapier.com/integrations/build/apikeyauth) | Custom fields + test call to \`/v1/webhooks/events\` |
| [Return types](https://github.com/zapier/zapier-platform/blob/master/packages/cli/README.md#return-types) | Hook \`perform\` always returns \`[row]\` |
| [Webhooks by Zapier](https://help.zapier.com/hc/en-us/articles/8496288691469) | Catch Hook recipes for any plan |
| [Code by Zapier](https://help.zapier.com/hc/en-us/articles/8496257774221) | Shared filter / HMAC scripts |

## Zivvy

| Source | Applied |
|--------|---------|
| \`POST ${INTEGRATE}/v1/webhooks\` OpenAPI \`CreateWebhookDto\` | \`url\`, \`events[]\`, optional \`secret\`, \`label\` |
| Auth | Bearer \`zk_live_\` + \`X-API-Key\` dual header |
| \`webhooks.py\` EVENT_MAP | Real verbs only |
| Payload | \`{ event, resource, data, timestamp }\` |

## Parity with n8n-templates

Same 10 areas and event lists as \`n8n-templates/manifest.json\`.
`;

writeFileSync(join(ROOT, "DOCS_COMPLIANCE.md"), compliance);

writeFileSync(
  join(ROOT, "manifest.json"),
  JSON.stringify(
    {
      generated_at: new Date().toISOString(),
      api_base: API,
      integrate_base: INTEGRATE,
      zapier_docs: [
        "https://docs.zapier.com/integrations/build-cli/overview",
        "https://docs.zapier.com/integrations/build/cli-hook-trigger",
        "https://docs.zapier.com/integrations/build/apikeyauth"
      ],
      recipes: manifestRecipes,
      integration: {
        path: "integration/",
        triggers: AREAS.map((a) => a.key),
        creates: AREAS.filter((a) => a.createKey).map((a) => `create_${a.createKey}`)
      }
    },
    null,
    2
  ) + "\n"
);

console.log("recipes", manifestRecipes.length);
console.log("triggers", AREAS.length);
console.log("creates", AREAS.filter((a) => a.createKey).length);
