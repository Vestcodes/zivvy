"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Check,
  Clock,
  Copy,
  ExternalLink,
  KeyRound,
  RefreshCcw,
  ShieldCheck,
  Webhook,
  Wifi
} from "lucide-react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BlurFade } from "@/components/ui/blur-fade";
import { ShineBorder } from "@/components/ui/shine-border";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const API_BASE = "https://api.zivvy.xyz";

/**
 * Curated event catalog — grouped by resource. The event slugs match the
 * `RESOURCES` registry in zivvy-api (`src/registry/resources.ts`), which is
 * the source of truth. We list the resources integrators care about first;
 * the wildcard `*` subscription (documented below) is the way to catch
 * everything, and the full machine-readable catalog lives at
 * `GET /v1/webhooks/events` once the endpoint is public.
 */

type SampleField = { key: string; type: string; example: string };

type EventRow = {
  event: string;
  description: string;
  sample: SampleField[];
};

type ResourceGroup = {
  key: string;
  label: string;
  blurb: string;
  events: EventRow[];
};

const CATALOG: ResourceGroup[] = [
  {
    key: "crm",
    label: "CRM",
    blurb: "Pipeline motion — leads and opportunities as they move.",
    events: [
      {
        event: "leads.created",
        description: "A new lead was captured (form, import, or API).",
        sample: [
          { key: "id", type: "string", example: '"LEAD-0007"' },
          { key: "lead_name", type: "string", example: '"Jane Smith"' },
          { key: "email_id", type: "string", example: '"jane@acme.com"' },
          { key: "status", type: "string", example: '"Open"' }
        ]
      },
      {
        event: "leads.updated",
        description: "Any field on the lead changed.",
        sample: [
          { key: "id", type: "string", example: '"LEAD-0007"' },
          { key: "status", type: "string", example: '"Contacted"' }
        ]
      },
      {
        event: "leads.converted",
        description: "Lead was converted into a customer + opportunity.",
        sample: [
          { key: "id", type: "string", example: '"LEAD-0007"' },
          { key: "customer_id", type: "string", example: '"CUST-0012"' },
          { key: "opportunity_id", type: "string", example: '"OPP-0031"' }
        ]
      },
      {
        event: "opportunities.won",
        description: "An opportunity was marked Won.",
        sample: [
          { key: "id", type: "string", example: '"OPP-0031"' },
          { key: "opportunity_amount", type: "number", example: "48250" },
          { key: "currency", type: "string", example: '"USD"' }
        ]
      },
      {
        event: "opportunities.lost",
        description: "An opportunity was marked Lost.",
        sample: [
          { key: "id", type: "string", example: '"OPP-0031"' },
          { key: "lost_reason", type: "string", example: '"Price"' }
        ]
      }
    ]
  },
  {
    key: "sales",
    label: "Sales",
    blurb: "Quotes, orders, and shipments moving through the pipeline.",
    events: [
      {
        event: "quotations.submitted",
        description: "Quotation was submitted (locked, sent to buyer).",
        sample: [
          { key: "id", type: "string", example: '"QTN-0102"' },
          { key: "customer", type: "string", example: '"CUST-0012"' },
          { key: "grand_total", type: "number", example: "1250.00" }
        ]
      },
      {
        event: "sales-orders.submitted",
        description: "Sales order accepted — start fulfillment.",
        sample: [
          { key: "id", type: "string", example: '"SO-0451"' },
          { key: "customer", type: "string", example: '"CUST-0012"' },
          { key: "delivery_date", type: "string", example: '"2026-08-04"' }
        ]
      },
      {
        event: "sales-orders.cancelled",
        description: "Sales order was cancelled after submission.",
        sample: [
          { key: "id", type: "string", example: '"SO-0451"' },
          { key: "cancelled_at", type: "string", example: '"2026-07-25T10:14:00Z"' }
        ]
      },
      {
        event: "delivery-notes.submitted",
        description: "Goods left the warehouse against a sales order.",
        sample: [
          { key: "id", type: "string", example: '"DN-0223"' },
          { key: "sales_order", type: "string", example: '"SO-0451"' },
          { key: "posting_date", type: "string", example: '"2026-07-25"' }
        ]
      }
    ]
  },
  {
    key: "billing",
    label: "Billing & Invoicing",
    blurb: "Invoicing lifecycle — issued, paid, or credited.",
    events: [
      {
        event: "sales-invoices.submitted",
        description: "Invoice was issued to the customer.",
        sample: [
          { key: "id", type: "string", example: '"SINV-0801"' },
          { key: "customer", type: "string", example: '"CUST-0012"' },
          { key: "grand_total", type: "number", example: "1250.00" },
          { key: "due_date", type: "string", example: '"2026-08-24"' }
        ]
      },
      {
        event: "sales-invoices.paid",
        description: "Invoice was fully settled.",
        sample: [
          { key: "id", type: "string", example: '"SINV-0801"' },
          { key: "outstanding_amount", type: "number", example: "0" },
          { key: "paid_at", type: "string", example: '"2026-08-11T14:02:00Z"' }
        ]
      },
      {
        event: "purchase-invoices.submitted",
        description: "Supplier bill was recorded.",
        sample: [
          { key: "id", type: "string", example: '"PINV-0334"' },
          { key: "supplier", type: "string", example: '"SUP-0004"' }
        ]
      },
      {
        event: "payment-entries.submitted",
        description: "A payment was posted against one or more invoices.",
        sample: [
          { key: "id", type: "string", example: '"PE-0912"' },
          { key: "paid_amount", type: "number", example: "1250.00" },
          { key: "references", type: "array", example: '[{ "sales_invoice": "SINV-0801" }]' }
        ]
      },
      {
        event: "payment-requests.paid",
        description: "A hosted payment request was completed by the payer.",
        sample: [
          { key: "id", type: "string", example: '"PR-0087"' },
          { key: "gateway", type: "string", example: '"stripe"' },
          { key: "amount", type: "number", example: "1250.00" }
        ]
      }
    ]
  },
  {
    key: "buying",
    label: "Purchasing",
    blurb: "Purchase orders and inbound receipts.",
    events: [
      {
        event: "purchase-orders.submitted",
        description: "PO was issued to the supplier.",
        sample: [
          { key: "id", type: "string", example: '"PO-0119"' },
          { key: "supplier", type: "string", example: '"SUP-0004"' }
        ]
      },
      {
        event: "purchase-receipts.submitted",
        description: "Goods received against a PO — stock has increased.",
        sample: [
          { key: "id", type: "string", example: '"PREC-0281"' },
          { key: "purchase_order", type: "string", example: '"PO-0119"' }
        ]
      }
    ]
  },
  {
    key: "stock",
    label: "Stock",
    blurb: "Movement, transfers, and inventory events.",
    events: [
      {
        event: "items.created",
        description: "A new item was added to the catalog.",
        sample: [
          { key: "id", type: "string", example: '"ITM-0455"' },
          { key: "item_code", type: "string", example: '"WIDGET-BLK-L"' },
          { key: "item_group", type: "string", example: '"Widgets"' }
        ]
      },
      {
        event: "stock-entries.submitted",
        description: "Stock was moved, issued, or received internally.",
        sample: [
          { key: "id", type: "string", example: '"SE-0621"' },
          { key: "stock_entry_type", type: "string", example: '"Material Transfer"' }
        ]
      },
      {
        event: "pick-lists.submitted",
        description: "A pick list was generated for warehouse fulfillment.",
        sample: [
          { key: "id", type: "string", example: '"PL-0034"' },
          { key: "purpose", type: "string", example: '"Delivery"' }
        ]
      },
      {
        event: "shipments.submitted",
        description: "A shipment was booked with a carrier.",
        sample: [
          { key: "id", type: "string", example: '"SH-0088"' },
          { key: "delivery_note", type: "string", example: '"DN-0223"' }
        ]
      }
    ]
  },
  {
    key: "banking",
    label: "Banking",
    blurb: "Bank feeds, reconciliation, and balance changes.",
    events: [
      {
        event: "bank-transactions.created",
        description: "A new bank transaction landed in a feed.",
        sample: [
          { key: "id", type: "string", example: '"BT-2026-0000451"' },
          { key: "bank_account", type: "string", example: '"BA-DE-DKB-01"' },
          { key: "amount", type: "number", example: "1250.00" },
          { key: "date", type: "string", example: '"2026-07-25"' }
        ]
      },
      {
        event: "bank-transactions.matched",
        description: "A bank transaction was matched to a payment or invoice.",
        sample: [
          { key: "id", type: "string", example: '"BT-2026-0000451"' },
          { key: "matched_to", type: "string", example: '"PE-0912"' }
        ]
      },
      {
        event: "bank-transactions.reconciled",
        description: "A bank transaction was reconciled and closed.",
        sample: [
          { key: "id", type: "string", example: '"BT-2026-0000451"' }
        ]
      },
      {
        event: "bank-accounts.balance_updated",
        description: "The running balance on a bank account changed.",
        sample: [
          { key: "id", type: "string", example: '"BA-DE-DKB-01"' },
          { key: "balance", type: "number", example: "48250.00" },
          { key: "currency", type: "string", example: '"EUR"' }
        ]
      },
      {
        event: "bank-statement-imports.completed",
        description: "A statement file finished importing.",
        sample: [
          { key: "id", type: "string", example: '"BSI-0011"' },
          { key: "imported_rows", type: "number", example: "84" }
        ]
      }
    ]
  },
  {
    key: "hr",
    label: "HR & People",
    blurb: "Joiners, leavers, leave, expenses, and payroll.",
    events: [
      {
        event: "employees.created",
        description: "A new employee record was added.",
        sample: [
          { key: "id", type: "string", example: '"EMP-0033"' },
          { key: "employee_name", type: "string", example: '"Priya Patel"' }
        ]
      },
      {
        event: "leave-applications.approved",
        description: "A leave request was approved.",
        sample: [
          { key: "id", type: "string", example: '"LA-0142"' },
          { key: "employee", type: "string", example: '"EMP-0033"' },
          { key: "from_date", type: "string", example: '"2026-08-05"' },
          { key: "to_date", type: "string", example: '"2026-08-09"' }
        ]
      },
      {
        event: "attendance.submitted",
        description: "Attendance was recorded for a day.",
        sample: [
          { key: "id", type: "string", example: '"ATT-2026-07-25-0033"' },
          { key: "status", type: "string", example: '"Present"' }
        ]
      },
      {
        event: "expense-claims.approved",
        description: "An expense claim was approved for reimbursement.",
        sample: [
          { key: "id", type: "string", example: '"EC-0077"' },
          { key: "total_claimed_amount", type: "number", example: "142.50" }
        ]
      },
      {
        event: "salary-slips.submitted",
        description: "A payroll slip was finalized for the period.",
        sample: [
          { key: "id", type: "string", example: '"SAL-2026-07-EMP-0033"' },
          { key: "net_pay", type: "number", example: "3820.00" }
        ]
      }
    ]
  },
  {
    key: "projects",
    label: "Projects",
    blurb: "Projects, tasks, and time tracking.",
    events: [
      {
        event: "projects.completed",
        description: "A project was marked complete.",
        sample: [
          { key: "id", type: "string", example: '"PROJ-0018"' },
          { key: "project_name", type: "string", example: '"Website refresh"' }
        ]
      },
      {
        event: "tasks.completed",
        description: "A task moved to Completed.",
        sample: [
          { key: "id", type: "string", example: '"TASK-0221"' },
          { key: "project", type: "string", example: '"PROJ-0018"' }
        ]
      },
      {
        event: "timesheets.submitted",
        description: "A timesheet was submitted for approval.",
        sample: [
          { key: "id", type: "string", example: '"TS-0089"' },
          { key: "total_hours", type: "number", example: "37.5" }
        ]
      }
    ]
  },
  {
    key: "manufacturing",
    label: "Manufacturing",
    blurb: "Production plans, work orders, and BOMs.",
    events: [
      {
        event: "boms.submitted",
        description: "A BOM was submitted (active).",
        sample: [
          { key: "id", type: "string", example: '"BOM-WIDGET-001"' },
          { key: "item", type: "string", example: '"ITM-0455"' }
        ]
      },
      {
        event: "work-orders.completed",
        description: "A work order finished production.",
        sample: [
          { key: "id", type: "string", example: '"WO-0154"' },
          { key: "produced_qty", type: "number", example: "500" }
        ]
      },
      {
        event: "production-plans.completed",
        description: "A production plan closed out.",
        sample: [
          { key: "id", type: "string", example: '"PP-0022"' }
        ]
      }
    ]
  },
  {
    key: "support",
    label: "Support & Assets",
    blurb: "Tickets and asset lifecycle.",
    events: [
      {
        event: "issues.created",
        description: "A new support ticket was opened.",
        sample: [
          { key: "id", type: "string", example: '"ISS-0409"' },
          { key: "customer", type: "string", example: '"CUST-0012"' },
          { key: "priority", type: "string", example: '"High"' }
        ]
      },
      {
        event: "issues.resolved",
        description: "A ticket was marked Resolved.",
        sample: [
          { key: "id", type: "string", example: '"ISS-0409"' },
          { key: "resolution_time_seconds", type: "number", example: "18420" }
        ]
      },
      {
        event: "assets.scrapped",
        description: "An asset was scrapped from the register.",
        sample: [
          { key: "id", type: "string", example: '"ASSET-0044"' },
          { key: "scrap_date", type: "string", example: '"2026-07-25"' }
        ]
      }
    ]
  }
];

const ENVELOPE_SNIPPET = `{
  "event": "sales-invoices.paid",
  "resource": "sales-invoices",
  "delivery_id": "whd_2026_07_25_a91f24",
  "timestamp": "2026-07-25T14:02:11.428Z",
  "data": {
    "id": "SINV-0801",
    "customer": "CUST-0012",
    "grand_total": 1250.00,
    "outstanding_amount": 0,
    "paid_at": "2026-07-25T14:02:00Z"
  }
}`;

const HEADERS_SNIPPET = `POST /your/endpoint  HTTP/1.1
Host: hooks.example.com
Content-Type: application/json
User-Agent: Zivvy-Webhooks/1.0
X-Zivvy-Event: sales-invoices.paid
X-Zivvy-Delivery: whd_2026_07_25_a91f24
X-Zivvy-Timestamp: 1753452131
X-Zivvy-Signature: t=1753452131, v1=6f1c...bd94`;

const NODE_VERIFY = `import crypto from "node:crypto";
import express from "express";

const app = express();
const SECRET = process.env.ZIVVY_WEBHOOK_SECRET!;

// Zivvy signs the raw body. Use express.raw() so req.body stays
// as a Buffer — do NOT run JSON parsing before verification.
app.post(
  "/webhooks/zivvy",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const signatureHeader = req.header("X-Zivvy-Signature") || "";
    const timestamp = req.header("X-Zivvy-Timestamp") || "";

    // Reject payloads older than 5 minutes to blunt replay attacks.
    const age = Math.abs(Date.now() / 1000 - Number(timestamp));
    if (!Number.isFinite(age) || age > 300) {
      return res.status(400).send("stale timestamp");
    }

    const payload = \`\${timestamp}.\${req.body.toString("utf8")}\`;
    const expected = crypto
      .createHmac("sha256", SECRET)
      .update(payload)
      .digest("hex");

    // "t=…, v1=<hex>" — accept any v1 sig in the header.
    const v1 = /v1=([a-f0-9]+)/.exec(signatureHeader)?.[1] ?? "";

    const ok =
      v1.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(v1), Buffer.from(expected));

    if (!ok) return res.status(400).send("bad signature");

    const event = JSON.parse(req.body.toString("utf8"));
    // Ack fast (2xx within 5s), then process in a background job.
    res.status(200).send("ok");
  }
);`;

const PYTHON_VERIFY = `import hmac, hashlib, json, re, time
from flask import Flask, request, abort

SECRET = os.environ["ZIVVY_WEBHOOK_SECRET"].encode()
app = Flask(__name__)

@app.post("/webhooks/zivvy")
def receive():
    signature_header = request.headers.get("X-Zivvy-Signature", "")
    timestamp = request.headers.get("X-Zivvy-Timestamp", "")

    # Reject stale payloads (>5 minutes off) to blunt replay attacks.
    try:
        age = abs(time.time() - float(timestamp))
    except ValueError:
        abort(400, "bad timestamp")
    if age > 300:
        abort(400, "stale timestamp")

    body = request.get_data()  # bytes — do NOT re-encode
    payload = f"{timestamp}.".encode() + body

    expected = hmac.new(SECRET, payload, hashlib.sha256).hexdigest()
    match = re.search(r"v1=([a-f0-9]+)", signature_header)
    v1 = match.group(1) if match else ""

    if not hmac.compare_digest(v1, expected):
        abort(400, "bad signature")

    event = json.loads(body)
    # Ack fast (2xx within 5s), then hand off to a worker.
    return "ok", 200`;

const CURL_REGISTER = `curl -X POST ${API_BASE}/v1/webhooks \\
  -H "Authorization: Bearer $ZIVVY_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://hooks.example.com/webhooks/zivvy",
    "events": [
      "sales-invoices.paid",
      "sales-orders.submitted",
      "bank-transactions.matched"
    ],
    "secret": "whsec_your_generated_shared_secret",
    "label": "Production billing sync"
  }'`;

const CURL_DELIVERIES = `curl ${API_BASE}/v1/webhooks/whk_01H8.../deliveries \\
  -H "Authorization: Bearer $ZIVVY_API_KEY"`;

function CopyableBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Copied to clipboard");
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <div className="relative">
      {label ? (
        <div className="flex items-center justify-between border-b border-border/60 bg-muted/50 px-4 py-2 text-[11.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          <span>{label}</span>
        </div>
      ) : null}
      <button
        type="button"
        onClick={onCopy}
        className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-background/85 px-2 py-1 text-xs font-medium text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
        aria-label="Copy snippet"
      >
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        {copied ? "Copied" : "Copy"}
      </button>
      <pre className="max-h-[520px] overflow-auto rounded-b-xl bg-muted/60 p-4 pr-16 font-mono text-[12.5px] leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function SamplePayload({ fields }: { fields: SampleField[] }) {
  return (
    <pre className="mt-2 overflow-auto rounded-md border border-border/50 bg-background/60 p-2 font-mono text-[11.5px] leading-relaxed text-muted-foreground">
      <code>
        {"{\n"}
        {fields.map((f, i) => (
          <span key={f.key}>
            {`  "${f.key}": ${f.example}`}
            {i < fields.length - 1 ? "," : ""}
            {"\n"}
          </span>
        ))}
        {"}"}
      </code>
    </pre>
  );
}

function EventCatalog() {
  return (
    <div className="space-y-10">
      {CATALOG.map((group) => (
        <BlurFade key={group.key} delay={0.05}>
          <div>
            <div className="flex items-baseline justify-between gap-4 border-b border-border/60 pb-3">
              <div>
                <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">
                  {group.label}
                </h3>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  {group.blurb}
                </p>
              </div>
              <Badge variant="outline" className="shrink-0 border-border/70">
                {group.events.length} events
              </Badge>
            </div>
            <div className="mt-4 overflow-hidden rounded-xl border border-border/60 bg-card/40">
              <div className="grid grid-cols-1 divide-y divide-border/60 md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] md:divide-x md:divide-y-0">
                <div className="hidden bg-muted/40 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground md:block">
                  Event
                </div>
                <div className="hidden bg-muted/40 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground md:block">
                  Description &amp; sample payload
                </div>
              </div>
              <ul className="divide-y divide-border/60">
                {group.events.map((ev) => (
                  <li
                    key={ev.event}
                    className="grid grid-cols-1 gap-3 px-4 py-4 md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] md:gap-6"
                  >
                    <div className="min-w-0">
                      <code className="inline-block break-all rounded-md border border-border/70 bg-background/70 px-2 py-0.5 font-mono text-[12.5px] text-foreground">
                        {ev.event}
                      </code>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13.5px] leading-relaxed text-foreground">
                        {ev.description}
                      </p>
                      <details className="group mt-2">
                        <summary className="cursor-pointer select-none text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground">
                          Sample payload
                          <span className="ml-1 text-muted-foreground/70 group-open:hidden">
                            (show)
                          </span>
                          <span className="ml-1 hidden text-muted-foreground/70 group-open:inline">
                            (hide)
                          </span>
                        </summary>
                        <SamplePayload fields={ev.sample} />
                      </details>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </BlurFade>
      ))}
    </div>
  );
}

export function WebhooksPageContent() {
  const totalEvents = CATALOG.reduce((sum, g) => sum + g.events.length, 0);

  return (
    <>
      <SiteHeader />
      <main>
        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(ellipse 55% 45% at 50% -5%, color-mix(in oklab, var(--primary) 16%, transparent), transparent 75%)"
            }}
          />
          <div className="relative mx-auto max-w-4xl px-6 pb-12 pt-20 text-center sm:pt-24">
            <BlurFade>
              <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl border border-primary/40 bg-primary/10">
                <Webhook className="size-8 text-primary" />
              </div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1">
                <span className="inline-block size-1.5 animate-pulse rounded-full bg-primary" />
                <AnimatedShinyText className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  Live
                </AnimatedShinyText>
              </div>
              <h1 className="font-display text-4xl font-bold tracking-tight sm:text-6xl">
                Real-time events from your workspace
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Subscribe once, receive HMAC-signed POSTs for every meaningful
                change across CRM, sales, billing, banking, stock, HR, projects,
                and manufacturing.
              </p>
              <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
                100+ event types across 40+ resources. At-least-once delivery
                with exponential retry. Available on Free and every paid plan —
                register your first endpoint in the dashboard.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild variant="polished">
                  <Link href="/settings/developer">
                    Register a webhook
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <a
                    href="https://integrate.zivvy.xyz/docs"
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    API reference
                    <ExternalLink className="size-3.5" />
                  </a>
                </Button>
              </div>
            </BlurFade>
          </div>
        </section>

        {/* ── Announcement bar ─────────────────────────────────────── */}
        <section className="mx-auto max-w-4xl px-6 pb-10">
          <div className="flex flex-col items-start gap-3 rounded-xl border border-primary/30 bg-primary/[0.04] px-4 py-3 text-sm sm:flex-row sm:items-center">
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-primary">
                <Bell className="size-3" />
                Live
              </span>
            </div>
            <p className="text-[13.5px] leading-relaxed text-muted-foreground">
              Every event below is deliverable today. Register endpoints in{" "}
              <Link
                href="/settings/developer"
                className="text-foreground underline-offset-2 hover:underline"
              >
                Settings → Developer
              </Link>{" "}
              or via <code className="rounded bg-muted px-1 font-mono text-[12px]">POST /v1/webhooks</code>.
              Every delivery is signed <code className="rounded bg-muted px-1 font-mono text-[12px]">X-Zivvy-Signature: sha256=…</code>.
            </p>
          </div>
        </section>

        {/* ── Payload envelope ─────────────────────────────────────── */}
        <section
          id="envelope"
          className="mx-auto max-w-5xl scroll-mt-24 px-6 pb-16"
          aria-labelledby="envelope-title"
        >
          <BlurFade>
            <h2
              id="envelope-title"
              className="font-display text-3xl font-semibold tracking-tight"
            >
              Payload envelope
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Every delivery wraps the resource payload in a stable envelope.
              The envelope shape does not change per event — only the{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11.5px]">
                data
              </code>{" "}
              body does.
            </p>
          </BlurFade>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="overflow-hidden rounded-xl border border-border/70">
              <CopyableBlock code={ENVELOPE_SNIPPET} label="POST body" />
            </div>
            <div className="overflow-hidden rounded-xl border border-border/70">
              <CopyableBlock code={HEADERS_SNIPPET} label="Request headers" />
            </div>
          </div>
          <dl className="mt-6 grid gap-3 rounded-xl border border-border/60 bg-card/40 p-5 sm:grid-cols-2">
            {[
              {
                key: "event",
                d: "Fully-qualified event name — <resource>.<verb>."
              },
              {
                key: "resource",
                d: "Slug of the resource that triggered the event."
              },
              {
                key: "delivery_id",
                d: "Unique per delivery attempt. Use it for idempotency on your side."
              },
              {
                key: "timestamp",
                d: "ISO 8601, server-side. Included in the signature."
              },
              {
                key: "data",
                d: "The resource payload — same shape as the corresponding GET response."
              }
            ].map((f) => (
              <div key={f.key} className="flex flex-col gap-1">
                <dt>
                  <code className="rounded bg-background/70 px-1.5 py-0.5 font-mono text-[12px] text-foreground">
                    {f.key}
                  </code>
                </dt>
                <dd className="text-[13px] text-muted-foreground">{f.d}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ── Event catalog ────────────────────────────────────────── */}
        <section
          id="events"
          className="mx-auto max-w-5xl scroll-mt-24 px-6 pb-16"
          aria-labelledby="catalog-title"
        >
          <BlurFade>
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2
                id="catalog-title"
                className="font-display text-3xl font-semibold tracking-tight"
              >
                Event catalog
              </h2>
              <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                {totalEvents}+ events across {CATALOG.length} resource groups
              </span>
            </div>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Subscribe to specific events, a resource wildcard
              (<code className="rounded bg-muted px-1 py-0.5 font-mono text-[11.5px]">sales-orders.*</code>),
              or all events with{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11.5px]">
                *
              </code>
              . The machine-readable list is at{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11.5px]">
                GET /v1/webhooks/events
              </code>{" "}
              once outbound delivery is live.
            </p>
          </BlurFade>
          <div className="mt-8">
            <EventCatalog />
          </div>
        </section>

        {/* ── Signature verification ───────────────────────────────── */}
        <section
          id="verify"
          className="mx-auto max-w-5xl scroll-mt-24 px-6 pb-16"
          aria-labelledby="verify-title"
        >
          <BlurFade>
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg border border-border/70 bg-background/70 text-primary">
                <KeyRound className="size-4" />
              </div>
              <h2
                id="verify-title"
                className="font-display text-3xl font-semibold tracking-tight"
              >
                Signature verification
              </h2>
            </div>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Every delivery is signed with an HMAC-SHA256 of{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11.5px]">
                {"<timestamp>.<raw-body>"}
              </code>{" "}
              using the shared secret you supplied on the subscription. The
              signature travels in the{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11.5px]">
                X-Zivvy-Signature
              </code>{" "}
              header. Verify against the raw request body — do not parse JSON
              first.
            </p>
          </BlurFade>
          <div className="mt-6 rounded-xl border border-border/70">
            <Tabs defaultValue="node" className="w-full">
              <div className="border-b border-border/60 px-3 pt-3">
                <TabsList>
                  <TabsTrigger value="node">Node.js (Express)</TabsTrigger>
                  <TabsTrigger value="python">Python (Flask)</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="node" className="m-0">
                <CopyableBlock code={NODE_VERIFY} />
              </TabsContent>
              <TabsContent value="python" className="m-0">
                <CopyableBlock code={PYTHON_VERIFY} />
              </TabsContent>
            </Tabs>
          </div>
          <ul className="mt-4 grid gap-2 text-[13px] text-muted-foreground sm:grid-cols-2">
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>
                Compare with a constant-time function (
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11.5px]">
                  timingSafeEqual
                </code>
                /
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11.5px]">
                  hmac.compare_digest
                </code>
                ).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>
                Reject payloads with a timestamp more than 5 minutes off.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>
                Rotate the secret from the dashboard — both keys stay valid
                during a 24-hour overlap window.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>
                Return a 2xx quickly (under 5 seconds), then queue the work.
              </span>
            </li>
          </ul>
        </section>

        {/* ── Delivery guarantees ──────────────────────────────────── */}
        <section
          id="delivery"
          className="mx-auto max-w-5xl scroll-mt-24 px-6 pb-16"
          aria-labelledby="delivery-title"
        >
          <BlurFade>
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg border border-border/70 bg-background/70 text-primary">
                <RefreshCcw className="size-4" />
              </div>
              <h2
                id="delivery-title"
                className="font-display text-3xl font-semibold tracking-tight"
              >
                Delivery guarantees
              </h2>
            </div>
          </BlurFade>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              {
                Icon: RefreshCcw,
                title: "At-least-once delivery",
                body:
                  "Every event is delivered at least once. Design idempotently — de-duplicate on delivery_id, which is stable across retries."
              },
              {
                Icon: Clock,
                title: "Exponential backoff",
                body:
                  "Non-2xx or timeout (>10s) triggers a retry with jittered exponential backoff — up to 24 hours, 12 attempts."
              },
              {
                Icon: ShieldCheck,
                title: "Ordering is not guaranteed",
                body:
                  "Two events can arrive out of order. Trust the timestamp on the envelope, not the arrival order."
              }
            ].map((row) => (
              <div
                key={row.title}
                className="rounded-xl border border-border/60 bg-card/40 p-5"
              >
                <div className="mb-3 flex size-9 items-center justify-center rounded-lg border border-border/60 bg-background/70 text-primary">
                  <row.Icon className="size-4" />
                </div>
                <p className="font-medium text-foreground">{row.title}</p>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">
                  {row.body}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-border/60 bg-card/40 p-5">
            <p className="font-medium text-foreground">Delivery log</p>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">
              Every attempt — status code, latency, response body preview, and
              error — is retained for 30 days. Fetch it any time to debug:
            </p>
            <div className="mt-3 overflow-hidden rounded-xl border border-border/70">
              <CopyableBlock code={CURL_DELIVERIES} label="GET" />
            </div>
          </div>
        </section>

        {/* ── Register a webhook ───────────────────────────────────── */}
        <section
          id="register"
          className="mx-auto max-w-5xl scroll-mt-24 px-6 pb-16"
          aria-labelledby="register-title"
        >
          <BlurFade>
            <h2
              id="register-title"
              className="font-display text-3xl font-semibold tracking-tight"
            >
              Register a webhook
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Management endpoints (
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11.5px]">
                POST /v1/webhooks
              </code>
              ,{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11.5px]">
                GET /v1/webhooks
              </code>
              ,{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11.5px]">
                DELETE /v1/webhooks/:id
              </code>
              ) are already live. Registrations you make today will start
              receiving events automatically when outbound delivery ships — no
              re-registration needed.
            </p>
          </BlurFade>
          <div className="mt-6 overflow-hidden rounded-xl border border-border/70">
            <CopyableBlock code={CURL_REGISTER} label="POST" />
          </div>
        </section>

        {/* ── IP allowlist ─────────────────────────────────────────── */}
        <section className="mx-auto max-w-5xl px-6 pb-16">
          <div className="rounded-xl border border-dashed border-border/60 bg-card/30 p-5">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background/70 text-muted-foreground">
                <Wifi className="size-4" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  IP allowlist{" "}
                  <span className="ml-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    · pending
                  </span>
                </p>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">
                  A stable set of egress IPs will be published at launch so you
                  can pin firewall rules. Until then, rely on the HMAC
                  signature as the primary authenticity check — signature
                  verification is enough on its own, and remains the
                  recommended approach even once IPs are pinned.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Ship your first webhook CTA ─────────────────────────── */}
        <section className="mx-auto max-w-3xl px-6 pb-20 text-center">
          <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 px-6 py-8">
            <ShineBorder shineColor={["#34d399", "#0f766e"]} duration={14} />
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Ship your first webhook in under a minute
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Register an endpoint, subscribe to the events you care about,
              and get signed POSTs the moment something happens in your workspace.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild variant="polished">
                <Link href="/settings/developer">
                  Register a webhook
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <a
                  href="https://integrate.zivvy.xyz/docs"
                  target="_blank"
                  rel="noreferrer noopener"
                  className={cn("inline-flex items-center gap-1")}
                >
                  API reference
                  <ExternalLink className="size-3.5" />
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
