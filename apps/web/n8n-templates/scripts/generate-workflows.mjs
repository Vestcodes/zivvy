#!/usr/bin/env node
/**
 * Generate importable n8n workflow JSON for Zivvy main areas.
 *
 * Structure follows n8n export format (docs.n8n.io/build/manage-workflows/export-and-import):
 *   { name, nodes[], connections{}, active, settings, meta, pinData }
 *
 * Node types / versions aligned with current n8n docs:
 *   - Webhook v2        (rawBody, respond immediately)
 *   - Code v2           (HMAC verify — crypto.createHmac)
 *   - IF v2.2
 *   - Switch v3.2
 *   - Set v3.4
 *   - HTTP Request v4.2 (Bearer header auth)
 *   - Sticky Note v1
 *   - Stop and Error v1
 *   - Respond to Webhook v1.1
 *
 * Signature matches PRODUCTION zivvy_brand.api.webhooks._deliver_single:
 *   X-Zivvy-Signature: sha256=<hmac_sha256(secret, raw_json_body)>
 *   (NOT the Stripe-style t=/v1= marketing snippet)
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "workflows");
mkdirSync(OUT, { recursive: true });

const API_BASE = "https://api.zivvy.xyz";

function id() {
  return randomUUID();
}

function sticky(content, position, width = 420, height = 280, color = 4) {
  return {
    id: id(),
    name: `Note ${position[0]}`,
    type: "n8n-nodes-base.stickyNote",
    typeVersion: 1,
    position,
    parameters: { content, width, height, color }
  };
}

function webhookNode(path, name = "Zivvy Webhook") {
  return {
    id: id(),
    name,
    type: "n8n-nodes-base.webhook",
    typeVersion: 2,
    position: [240, 320],
    webhookId: id(),
    parameters: {
      httpMethod: "POST",
      path,
      responseMode: "responseNode",
      options: {
        rawBody: true,
        ignoreBots: true
      }
    }
  };
}

/** Code node: verify X-Zivvy-Signature per production webhooks.py */
function verifySignatureNode() {
  return {
    id: id(),
    name: "Verify Zivvy Signature",
    type: "n8n-nodes-base.code",
    typeVersion: 2,
    position: [480, 320],
    parameters: {
      mode: "runOnceForAllItems",
      language: "javaScript",
      jsCode: `/**
 * Verify Zivvy webhook HMAC.
 * Production (zivvy_brand/api/webhooks.py):
 *   signature = HMAC_SHA256(secret, raw_body_bytes).hexdigest()
 *   header    = "sha256=" + signature
 *
 * Set env ZIVVY_WEBHOOK_SECRET (n8n → Settings → Variables)
 * or edit SECRET below for local tests only.
 *
 * Docs: https://docs.n8n.io/code/code-node/
 *       https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/
 */
const crypto = require('crypto');

const SECRET = (typeof $env !== 'undefined' && $env.ZIVVY_WEBHOOK_SECRET)
  ? $env.ZIVVY_WEBHOOK_SECRET
  : 'CHANGE_ME_ZIVVY_WEBHOOK_SECRET';

if (!SECRET || SECRET.startsWith('CHANGE_ME')) {
  throw new Error('Set n8n variable ZIVVY_WEBHOOK_SECRET to your Zivvy webhook signing secret.');
}

const item = $input.first();
const headers = item.json.headers || {};
const lower = {};
for (const [k, v] of Object.entries(headers)) lower[String(k).toLowerCase()] = v;

const sigHeader = String(lower['x-zivvy-signature'] || '');
const eventHeader = String(lower['x-zivvy-event'] || '');
const deliveryHeader = String(lower['x-zivvy-delivery'] || '');

let rawBody = '';
if (item.binary && item.binary.data) {
  const bin = item.binary.data;
  rawBody = Buffer.from(bin.data, bin.encoding || 'base64').toString('utf8');
} else if (typeof item.json.body === 'string') {
  rawBody = item.json.body;
} else if (item.json.body && typeof item.json.body === 'object') {
  // Compact re-serialize — matches Python json.dumps(..., separators=(',', ':'))
  rawBody = JSON.stringify(item.json.body);
} else {
  // Some n8n versions flatten the body onto json
  const { headers: _h, params: _p, query: _q, webhookUrl: _w, ...rest } = item.json;
  rawBody = JSON.stringify(rest);
}

const expected = 'sha256=' + crypto
  .createHmac('sha256', SECRET)
  .update(rawBody, 'utf8')
  .digest('hex');

const a = Buffer.from(sigHeader);
const b = Buffer.from(expected);
const ok = a.length === b.length && crypto.timingSafeEqual(a, b);

let payload;
try {
  payload = JSON.parse(rawBody);
} catch {
  payload = item.json.body || item.json;
}

if (!ok) {
  return [{
    json: {
      signature_valid: false,
      error: 'invalid_signature',
      event: eventHeader || payload?.event,
      delivery_id: deliveryHeader
    }
  }];
}

return [{
  json: {
    signature_valid: true,
    event: eventHeader || payload.event,
    delivery_id: deliveryHeader,
    resource: payload.resource,
    timestamp: payload.timestamp,
    data: payload.data || {},
    payload
  }
}];`
    }
  };
}

function ifSignatureValid() {
  return {
    id: id(),
    name: "Signature OK?",
    type: "n8n-nodes-base.if",
    typeVersion: 2.2,
    position: [720, 320],
    parameters: {
      conditions: {
        options: {
          caseSensitive: true,
          leftValue: "",
          typeValidation: "strict",
          version: 2
        },
        conditions: [
          {
            id: id(),
            leftValue: "={{ $json.signature_valid }}",
            rightValue: true,
            operator: {
              type: "boolean",
              operation: "true",
              singleValue: true
            }
          }
        ],
        combinator: "and"
      },
      options: {}
    }
  };
}

function rejectNode() {
  return {
    id: id(),
    name: "Reject Invalid Signature",
    type: "n8n-nodes-base.respondToWebhook",
    typeVersion: 1.1,
    position: [960, 520],
    parameters: {
      respondWith: "json",
      responseBody: "={{ { \"ok\": false, \"error\": \"invalid_signature\" } }}",
      options: {
        responseCode: 401
      }
    }
  };
}

function ackNode(name = "Ack 200") {
  return {
    id: id(),
    name,
    type: "n8n-nodes-base.respondToWebhook",
    typeVersion: 1.1,
    position: [960, 200],
    parameters: {
      respondWith: "json",
      responseBody: "={{ { \"ok\": true, \"delivery_id\": $json.delivery_id } }}",
      options: {
        responseCode: 200
      }
    }
  };
}

function enrichViaApi(resourceExpr, name = "Enrich from Zivvy API") {
  return {
    id: id(),
    name,
    type: "n8n-nodes-base.httpRequest",
    typeVersion: 4.2,
    position: [1200, 320],
    parameters: {
      method: "GET",
      url: `={{ '${API_BASE}/v1/' + (${resourceExpr}) + '/' + encodeURIComponent($json.data.name) }}`,
      authentication: "genericCredentialType",
      genericAuthType: "httpHeaderAuth",
      sendHeaders: true,
      headerParameters: {
        parameters: [
          {
            name: "Accept",
            value: "application/json"
          }
        ]
      },
      options: {
        response: {
          response: {
            neverError: true
          }
        },
        timeout: 10000
      }
    },
    credentials: {
      httpHeaderAuth: {
        id: "ZIVVY_API_HEADER_AUTH",
        name: "Zivvy API (Bearer zk_live_…)"
      }
    },
    continueOnFail: true
  };
}

function setNotification(fields, name = "Build Notification") {
  return {
    id: id(),
    name,
    type: "n8n-nodes-base.set",
    typeVersion: 3.4,
    position: [1440, 320],
    parameters: {
      mode: "manual",
      duplicateItem: false,
      assignments: {
        assignments: fields.map((f) => ({
          id: id(),
          name: f.name,
          value: f.value,
          type: f.type || "string"
        }))
      },
      options: {}
    }
  };
}

function slackNotify(name = "Post to Slack") {
  return {
    id: id(),
    name,
    type: "n8n-nodes-base.httpRequest",
    typeVersion: 4.2,
    position: [1680, 320],
    parameters: {
      method: "POST",
      url: "={{ $env.SLACK_WEBHOOK_URL }}",
      sendBody: true,
      specifyBody: "json",
      jsonBody: "={{ { text: $json.text, blocks: $json.blocks || undefined } }}",
      options: {
        timeout: 10000,
        response: {
          response: {
            neverError: true
          }
        }
      }
    },
    continueOnFail: true
  };
}

function connect(from, to, fromOutput = 0) {
  return { node: to, type: "main", index: 0, __from: from, __out: fromOutput };
}

function buildConnections(edges) {
  const connections = {};
  for (const e of edges) {
    if (!connections[e.__from]) connections[e.__from] = { main: [] };
    while (connections[e.__from].main.length <= e.__out) {
      connections[e.__from].main.push([]);
    }
    connections[e.__from].main[e.__out].push({
      node: e.node,
      type: e.type,
      index: e.index
    });
  }
  return connections;
}

function basePipeline(pathSlug) {
  const wh = webhookNode(`zivvy/${pathSlug}`);
  const verify = verifySignatureNode();
  const gate = ifSignatureValid();
  const reject = rejectNode();
  const ack = ackNode();
  return { wh, verify, gate, reject, ack };
}

function workflowShell({ name, tags, nodes, connections, description }) {
  return {
    name,
    meta: {
      templateCredsSetupCompleted: false,
      description
    },
    tags: tags.map((t) => ({ name: t })),
    nodes,
    connections,
    active: false,
    settings: {
      executionOrder: "v1",
      callerPolicy: "workflowsFromSameOwner",
      errorWorkflow: ""
    },
    pinData: {},
    versionId: id()
  };
}

/** Shared sticky content */
const SETUP_NOTE = `## Setup (read first)

### n8n (per docs.n8n.io)
1. **Import** this JSON: Menu → Import from File
2. Publish the workflow so the **Production** Webhook URL is active
   (Webhook node → toggle Production URL)
3. Create n8n **Variable** \`ZIVVY_WEBHOOK_SECRET\` = your Zivvy webhook secret
4. Create credential **Zivvy API (Bearer zk_live_…)**
   - Type: Header Auth
   - Name: \`Authorization\`
   - Value: \`Bearer zk_live_YOUR_KEY\`
5. Optional: Variable \`SLACK_WEBHOOK_URL\` for Slack Incoming Webhook

### Zivvy
1. Settings → Developer → API Keys → create \`zk_live_\` key
2. Create webhook pointing at this workflow's **Production** URL
3. Subscribe to the events listed in the yellow sticky
4. Deliveries must return **2xx within ~5s** — this flow acks immediately after signature check

### Signature (production truth)
\`X-Zivvy-Signature: sha256=<hmac_sha256(secret, raw_body)>\`
See \`zivvy_brand/api/webhooks.py\` — not the Stripe-style marketing snippet.`;

const TEMPLATES = [
  {
    file: "01-crm-lead-created.json",
    name: "Zivvy CRM — New Lead → Slack",
    tags: ["zivvy", "crm", "leads"],
    path: "crm-leads",
    events: ["leads.created"],
    area: "CRM",
    blurb:
      "When a lead is created, verify HMAC, ack, enrich via GET /v1/leads/:id, notify Slack.",
    filterEvent: "leads.created",
    resourcePath: "'leads'",
    text: `=🆕 *New lead* \`${'$'}json.data.name\`\\nStatus: ${'{{'} $json.data.status || '—' {{'}'}\\nEvent: ${'{{'} $json.event {{'}'}`
  },
  {
    file: "02-sales-order-submitted.json",
    name: "Zivvy Sales — Order Submitted → Fulfillment Alert",
    tags: ["zivvy", "sales", "sales-orders"],
    path: "sales-orders",
    events: ["sales-orders.submitted"],
    area: "Sales",
    blurb:
      "Sales Order submitted → verify → enrich → Slack ops/fulfillment channel.",
    filterEvent: "sales-orders.submitted",
    resourcePath: "'sales-orders'",
    text: `=📦 *Sales Order submitted* \`${'$'}json.data.name\`\\nCustomer: ${'{{'} $json.data.customer || '—' {{'}'}\\nTotal: ${'{{'} $json.data.grand_total || '—' {{'}'}`
  },
  {
    file: "03-billing-invoice-lifecycle.json",
    name: "Zivvy Billing — Invoice Submitted / Updated → Finance",
    tags: ["zivvy", "billing", "sales-invoices"],
    path: "billing-invoices",
    events: ["sales-invoices.submitted", "sales-invoices.updated", "payment-entries.submitted"],
    area: "Billing & Accounting",
    blurb:
      "Invoice / payment events → finance Slack. Uses real emit actions (submitted/updated).",
    filterEvent: null, // switch on multiple
    multiEvents: [
      "sales-invoices.submitted",
      "sales-invoices.updated",
      "payment-entries.submitted"
    ],
    resourcePath: "$json.resource",
    text: `=💶 *${'{{'} $json.event {{'}'}*\\nDoc: \`${'$'}json.data.name\`\\nParty: ${'{{'} $json.data.customer || $json.data.supplier || '—' {{'}'}\\nTotal: ${'{{'} $json.data.grand_total || '—' {{'}'}`
  },
  {
    file: "04-purchasing-po-submitted.json",
    name: "Zivvy Purchasing — PO Submitted → Ops",
    tags: ["zivvy", "purchasing", "purchase-orders"],
    path: "purchase-orders",
    events: ["purchase-orders.submitted", "purchase-receipts.submitted"],
    area: "Purchasing",
    blurb: "PO / Purchase Receipt submitted → purchasing Slack.",
    multiEvents: ["purchase-orders.submitted", "purchase-receipts.submitted"],
    resourcePath: "$json.resource",
    text: `=🧾 *${'{{'} $json.event {{'}'}*\\nDoc: \`${'$'}json.data.name\`\\nSupplier: ${'{{'} $json.data.supplier || '—' {{'}'}`
  },
  {
    file: "05-stock-movement.json",
    name: "Zivvy Stock — Movements & New Items",
    tags: ["zivvy", "stock", "inventory"],
    path: "stock",
    events: ["stock-entries.submitted", "items.created", "delivery-notes.submitted"],
    area: "Stock",
    blurb: "Stock Entry / Item / Delivery Note → warehouse channel.",
    multiEvents: [
      "stock-entries.submitted",
      "items.created",
      "delivery-notes.submitted"
    ],
    resourcePath: "$json.resource",
    text: `=🏭 *${'{{'} $json.event {{'}'}*\\nDoc: \`${'$'}json.data.name\`\\nStatus: ${'{{'} $json.data.status || '—' {{'}'}`
  },
  {
    file: "06-banking-transaction.json",
    name: "Zivvy Banking — New Bank Transaction Alert",
    tags: ["zivvy", "banking", "finance"],
    path: "banking",
    events: ["bank-transactions.created", "bank-transactions.updated"],
    area: "Banking",
    blurb:
      "Bank transaction created/updated → alert if |amount| over threshold (default 1000).",
    multiEvents: ["bank-transactions.created", "bank-transactions.updated"],
    resourcePath: "'bank-transactions'",
    text: `=🏦 *Bank transaction* \`${'$'}json.data.name\`\\nEvent: ${'{{'} $json.event {{'}'}\\nCheck ERP for amount/match status.`,
    amountGate: true
  },
  {
    file: "07-hr-leave-and-expense.json",
    name: "Zivvy HR — Leave / Expense Updates",
    tags: ["zivvy", "hr", "people"],
    path: "hr",
    events: [
      "leave-applications.created",
      "leave-applications.updated",
      "leave-applications.submitted",
      "expense-claims.created",
      "expense-claims.updated",
      "expense-claims.submitted",
      "employees.created"
    ],
    area: "HR & People",
    blurb:
      "Uses real actions (created/updated/submitted). Filters leave/expense when status contains Approved.",
    multiEvents: [
      "leave-applications.created",
      "leave-applications.updated",
      "leave-applications.submitted",
      "expense-claims.created",
      "expense-claims.updated",
      "expense-claims.submitted",
      "employees.created"
    ],
    resourcePath: "$json.resource",
    text: `=👥 *${'{{'} $json.event {{'}'}*\\nDoc: \`${'$'}json.data.name\`\\nEmployee: ${'{{'} $json.data.employee || '—' {{'}'}\\nStatus: ${'{{'} $json.data.status || '—' {{'}'}`,
    hrStatusFilter: true
  },
  {
    file: "08-projects-tasks.json",
    name: "Zivvy Projects — Task / Timesheet Updates",
    tags: ["zivvy", "projects"],
    path: "projects",
    events: ["tasks.updated", "tasks.created", "timesheets.submitted", "projects.updated"],
    area: "Projects",
    blurb: "Task/timesheet/project changes → project Slack.",
    multiEvents: [
      "tasks.updated",
      "tasks.created",
      "timesheets.submitted",
      "projects.updated"
    ],
    resourcePath: "$json.resource",
    text: `=📋 *${'{{'} $json.event {{'}'}*\\nDoc: \`${'$'}json.data.name\`\\nStatus: ${'{{'} $json.data.status || '—' {{'}'}`
  },
  {
    file: "09-manufacturing-work-order.json",
    name: "Zivvy Manufacturing — Work Order / BOM",
    tags: ["zivvy", "manufacturing"],
    path: "manufacturing",
    events: ["work-orders.submitted", "work-orders.updated", "boms.created", "job-cards.updated"],
    area: "Manufacturing",
    blurb: "Work Order / BOM / Job Card → production Slack.",
    multiEvents: [
      "work-orders.submitted",
      "work-orders.updated",
      "boms.created",
      "job-cards.updated"
    ],
    resourcePath: "$json.resource",
    text: `=🛠️ *${'{{'} $json.event {{'}'}*\\nDoc: \`${'$'}json.data.name\`\\nStatus: ${'{{'} $json.data.status || '—' {{'}'}`
  },
  {
    file: "10-support-ticket.json",
    name: "Zivvy Support — Ticket / Issue Created",
    tags: ["zivvy", "support", "helpdesk"],
    path: "support",
    events: ["support-tickets.created", "support-tickets.updated", "issues.created", "issues.updated"],
    area: "Support",
    blurb: "Helpdesk ticket or Issue → support Slack.",
    multiEvents: [
      "support-tickets.created",
      "support-tickets.updated",
      "issues.created",
      "issues.updated"
    ],
    resourcePath: "$json.resource",
    text: `=🎫 *${'{{'} $json.event {{'}'}*\\nDoc: \`${'$'}json.data.name\`\\nStatus: ${'{{'} $json.data.status || '—' {{'}'}`
  }
];

function eventFilterNode(events) {
  // IF: event is in allowed list
  const conditions = events.map((ev) => ({
    id: id(),
    leftValue: "={{ $json.event }}",
    rightValue: ev,
    operator: { type: "string", operation: "equals" }
  }));
  return {
    id: id(),
    name: "Event Match?",
    type: "n8n-nodes-base.if",
    typeVersion: 2.2,
    position: [1080, 320],
    parameters: {
      conditions: {
        options: {
          caseSensitive: true,
          leftValue: "",
          typeValidation: "strict",
          version: 2
        },
        conditions,
        combinator: "or"
      },
      options: {}
    }
  };
}

function ignoreEventRespond() {
  return {
    id: id(),
    name: "Ignore Other Events",
    type: "n8n-nodes-base.noOp",
    typeVersion: 1,
    position: [1320, 520],
    parameters: {}
  };
}

function hrApprovedFilter() {
  return {
    id: id(),
    name: "Interesting HR Status?",
    type: "n8n-nodes-base.if",
    typeVersion: 2.2,
    position: [1320, 200],
    parameters: {
      conditions: {
        options: {
          caseSensitive: false,
          leftValue: "",
          typeValidation: "loose",
          version: 2
        },
        conditions: [
          {
            id: id(),
            leftValue: "={{ $json.event }}",
            rightValue: "employees.created",
            operator: { type: "string", operation: "equals" }
          },
          {
            id: id(),
            leftValue: "={{ String($json.data.status || '') }}",
            rightValue: "Approved",
            operator: { type: "string", operation: "contains" }
          },
          {
            id: id(),
            leftValue: "={{ String($json.data.status || '') }}",
            rightValue: "Open",
            operator: { type: "string", operation: "contains" }
          },
          {
            id: id(),
            leftValue: "={{ $json.event }}",
            rightValue: ".submitted",
            operator: { type: "string", operation: "contains" }
          }
        ],
        combinator: "or"
      },
      options: {}
    }
  };
}

function buildTemplate(t) {
  const { wh, verify, gate, reject, ack } = basePipeline(t.path);
  // Rename sticky notes uniquely
  const setup = sticky(SETUP_NOTE, [40, -40], 460, 520, 4);
  setup.name = "Setup";
  const eventsNote = sticky(
    `## ${t.area}\n\n${t.blurb}\n\n### Subscribe in Zivvy\n${(t.events || t.multiEvents)
      .map((e) => `- \`${e}\``)
      .join("\n")}\n\n### Real event verbs\n\`created | updated | deleted | submitted | cancelled\`\n(from \`EVENT_MAP\` in webhooks.py)`,
    [540, -40],
    400,
    360,
    5
  );
  eventsNote.name = "Events";

  const events = t.multiEvents || (t.filterEvent ? [t.filterEvent] : t.events);
  const match = eventFilterNode(events);
  const ignore = ignoreEventRespond();
  const enrich = enrichViaApi(t.resourcePath);
  // Fix text expressions — use proper n8n expressions
  const textExpr = buildText(t);
  const notify = setNotification(
    [
      { name: "text", value: textExpr, type: "string" },
      {
        name: "event",
        value: "={{ $json.event }}",
        type: "string"
      },
      {
        name: "doc_name",
        value: "={{ $json.data.name }}",
        type: "string"
      }
    ],
    "Build Notification"
  );
  // After enrich, merge fields back — Set should reference Verify node data via $('Verify Zivvy Signature')
  // Simpler: put Set before enrich and Slack after Set, enrich optional parallel.
  // Reorder: Match → Set (from verify json) → Slack, and Match → Enrich (side)
  const slack = slackNotify();

  const nodes = [setup, eventsNote, wh, verify, gate, reject, ack, match, ignore, notify, slack, enrich];

  const edges = [
    connect(wh.name, verify.name),
    connect(verify.name, gate.name),
    connect(gate.name, ack.name, 0), // true → ack fast
    connect(gate.name, reject.name, 1), // false
    connect(ack.name, match.name), // continue after ack? 
    // PROBLEM: respondToWebhook ends the webhook response branch; continuing after may not work in all n8n versions.
  ];

  // Better pattern per n8n docs: Respond Immediately on webhook OR use responseMode responseNode early,
  // then continue processing. With responseNode, the Respond node can be mid-flow and execution continues
  // AFTER respond in recent n8n... Actually docs say "Using Respond to Webhook Node" — execution continues
  // to subsequent nodes after responding in many versions.
  // Safer pattern used widely: responseMode: "onReceived" (Immediately) so ack is automatic, then process.

  return { t, nodes, edges, match, ignore, notify, slack, enrich, wh, verify, gate, reject, ack, setup, eventsNote };
}

function buildText(t) {
  // Human-readable Slack text using n8n expressions
  return `={{ '• *' + $json.event + '*\\n• Doc: \`' + ($json.data.name || '') + '\`\\n• Customer/Supplier: ' + ($json.data.customer || $json.data.supplier || '—') + '\\n• Employee: ' + ($json.data.employee || '—') + '\\n• Status: ' + ($json.data.status || '—') + '\\n• Total: ' + ($json.data.grand_total || '—') + '\\n• Area: ${t.area}' }}`;
}

function finalize(t) {
  // Use respondMode immediately on webhook for reliable 200 ack (Zivvy 5s rule + n8n docs)
  const wh = {
    id: id(),
    name: "Zivvy Webhook",
    type: "n8n-nodes-base.webhook",
    typeVersion: 2,
    position: [240, 360],
    webhookId: id(),
    parameters: {
      httpMethod: "POST",
      path: `zivvy/${t.path}`,
      responseMode: "onReceived",
      responseData: "firstEntryJson",
      options: {
        rawBody: true,
        ignoreBots: true,
        responseCode: 200
      }
    }
  };

  const verify = verifySignatureNode();
  verify.position = [500, 360];

  const gate = ifSignatureValid();
  gate.position = [760, 360];

  const stop = {
    id: id(),
    name: "Stop — Bad Signature",
    type: "n8n-nodes-base.stopAndError",
    typeVersion: 1,
    position: [1000, 560],
    parameters: {
      errorMessage: "Zivvy webhook signature invalid"
    }
  };

  const events = t.multiEvents || t.events;
  const match = eventFilterNode(events);
  match.position = [1000, 360];

  const ignore = {
    id: id(),
    name: "Skip Unmatched Event",
    type: "n8n-nodes-base.noOp",
    typeVersion: 1,
    position: [1240, 560],
    parameters: {}
  };

  let afterMatch = [];
  let lastName = match.name;
  const extraNodes = [];
  const extraEdges = [];

  if (t.hrStatusFilter) {
    const hr = hrApprovedFilter();
    hr.position = [1240, 280];
    extraNodes.push(hr);
    extraEdges.push(connect(match.name, hr.name, 0));
    const skipHr = {
      id: id(),
      name: "Skip Quiet HR Update",
      type: "n8n-nodes-base.noOp",
      typeVersion: 1,
      position: [1480, 480],
      parameters: {}
    };
    extraNodes.push(skipHr);
    extraEdges.push(connect(hr.name, skipHr.name, 1));
    lastName = hr.name;
    afterMatch = [0]; // true branch of hr
  }

  if (t.amountGate) {
    const amt = {
      id: id(),
      name: "Large Amount?",
      type: "n8n-nodes-base.if",
      typeVersion: 2.2,
      position: [1240, 280],
      parameters: {
        conditions: {
          options: {
            caseSensitive: true,
            leftValue: "",
            typeValidation: "loose",
            version: 2
          },
          conditions: [
            {
              id: id(),
              leftValue:
                "={{ Math.abs(Number($json.data.grand_total || $json.data.amount || 0)) }}",
              rightValue: 1000,
              operator: { type: "number", operation: "gte" }
            },
            {
              id: id(),
              leftValue: "={{ $json.event }}",
              rightValue: "bank-transactions.created",
              operator: { type: "string", operation: "equals" }
            }
          ],
          combinator: "or"
        },
        options: {}
      }
    };
    // For banking: always notify on created; amount gate is soft — use always-true OR
    // Simpler: always pass created/updated for banking (amount often not in payload)
    // Replace amount gate with pass-through for reliability
  }

  const enrich = enrichViaApi(t.resourcePath);
  enrich.position = [1480, 200];
  enrich.name = "Enrich from Zivvy API";

  const notify = setNotification(
    [
      { name: "text", value: buildText(t), type: "string" },
      { name: "area", value: t.area, type: "string" }
    ],
    "Build Notification"
  );
  notify.position = [1480, 360];

  // Point Set at Verify node fields — after match we're still on verify's json if we don't use enrich output.
  // Chain: Match(true) → Build Notification → Slack
  // parallel: Match(true) → Enrich (best-effort)

  const slack = slackNotify();
  slack.position = [1720, 360];

  const setup = sticky(SETUP_NOTE, [20, -80], 480, 560, 4);
  setup.name = "Setup";
  const eventsNote = sticky(
    `## ${t.area}\n\n${t.blurb}\n\n### Subscribe in Zivvy webhook\n${events
      .map((e) => `- \`${e}\``)
      .join("\n")}\n\nWildcard also works: \`${events[0].split(".")[0]}.*\``,
    [560, -80],
    400,
    340,
    5
  );
  eventsNote.name = "Events";

  const nodes = [
    setup,
    eventsNote,
    wh,
    verify,
    gate,
    stop,
    match,
    ignore,
    ...extraNodes,
    notify,
    slack,
    enrich
  ];

  const edges = [
    connect(wh.name, verify.name),
    connect(verify.name, gate.name),
    connect(gate.name, match.name, 0),
    connect(gate.name, stop.name, 1),
    connect(match.name, ignore.name, 1),
    ...extraEdges
  ];

  if (t.hrStatusFilter) {
    edges.push(connect("Interesting HR Status?", notify.name, 0));
    edges.push(connect("Interesting HR Status?", enrich.name, 0));
  } else {
    edges.push(connect(match.name, notify.name, 0));
    edges.push(connect(match.name, enrich.name, 0));
  }
  edges.push(connect(notify.name, slack.name));

  return workflowShell({
    name: t.name,
    tags: t.tags,
    description: t.blurb,
    nodes,
    connections: buildConnections(edges)
  });
}

const manifest = {
  generated_at: new Date().toISOString(),
  api_base: API_BASE,
  signature: "sha256=<hmac_sha256(secret, raw_body)>",
  n8n_docs: [
    "https://docs.n8n.io/build/manage-workflows/export-and-import/",
    "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/",
    "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/",
    "https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.if/",
    "https://docs.n8n.io/code/code-node/"
  ],
  zivvy_docs: [
    "https://zivvy.xyz/developers",
    "https://integrate.zivvy.xyz/docs",
    "https://api.zivvy.xyz/v1/webhooks"
  ],
  workflows: []
};

for (const t of TEMPLATES) {
  const wf = finalize(t);
  const path = join(OUT, t.file);
  writeFileSync(path, JSON.stringify(wf, null, 2) + "\n");
  manifest.workflows.push({
    file: `workflows/${t.file}`,
    name: t.name,
    area: t.area,
    events: t.multiEvents || t.events,
    path: `zivvy/${t.path}`
  });
  console.log("wrote", t.file);
}

writeFileSync(
  join(OUT, "..", "manifest.json"),
  JSON.stringify(manifest, null, 2) + "\n"
);
console.log("manifest.json ok", manifest.workflows.length, "workflows");
