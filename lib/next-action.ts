/**
 * Next-action inference.
 *
 * The USP of Zivvy's UX is that every screen tells you what to do next
 * instead of dumping a wall of fields. This module derives a single
 * recommended action from a doctype's meta + current doc state.
 *
 * Rules are deliberately generic — they read `docstatus`, a `status` field
 * if present, and doctype flags like `is_submittable`. That means the same
 * logic applies to every one of ERPNext's ~200 doctypes without per-doctype
 * code. When a doctype needs a custom rule (e.g. Sales Invoice → Record
 * payment when overdue), it's a one-line addition to DOCTYPE_OVERRIDES.
 */

import type { DoctypeMeta } from "@/lib/frappe-meta";

export type ActionTone = "primary" | "warning" | "danger" | "info" | "neutral";
export type ActionKind = "submit" | "cancel" | "amend" | "link" | "fill" | "review" | "empty";

export interface NextAction {
  /** Short verb-first label: "Submit to lock in", "Record payment", "Add contact info". */
  label: string;
  /** Longer explanation shown as helper copy under the label. */
  hint?: string;
  /** How to render the CTA — matches shadcn variant vocabulary. */
  tone: ActionTone;
  /** What the click should do — the client wraps this into a button. */
  kind: ActionKind;
  /** For kind='link' actions — target URL. */
  href?: string;
  /** For kind='fill' actions — the fieldname the user should scroll to + focus. */
  targetField?: string;
}

interface Ctx {
  meta: DoctypeMeta;
  doc: Record<string, unknown>;
  isNew: boolean;
  basePath: string;
}

const DOCSTATUS_DRAFT = 0;
const DOCSTATUS_SUBMITTED = 1;
const DOCSTATUS_CANCELLED = 2;

/** Field names that count as "the customer/contact link" — heuristic. */
const LINK_FIELDS = ["customer", "supplier", "party", "contact", "lead"];

/** Field names that suggest a monetary status — heuristic. */
const STATUS_FIELD_NAMES = new Set([
  "status",
  "workflow_state",
  "delivery_status",
  "billing_status",
  "payment_status",
  "approval_status"
]);

function pickStatus(doc: Record<string, unknown>): string | null {
  for (const name of STATUS_FIELD_NAMES) {
    const v = doc[name];
    if (typeof v === "string" && v.length > 0) return v;
  }
  return null;
}

function requiredEmptyField(ctx: Ctx): string | null {
  const { meta, doc } = ctx;
  for (const f of meta.fields) {
    if (f.hidden || f.read_only) continue;
    if (!f.reqd) continue;
    if (LINK_FIELDS.includes(f.fieldname) || f.fieldtype === "Link" || f.fieldtype === "Data") {
      const v = doc[f.fieldname];
      if (v === null || v === undefined || v === "") return f.fieldname;
    }
  }
  return null;
}

function hasEmptyChildTable(ctx: Ctx): string | null {
  // Sales Invoice / Purchase Order / Quotation etc. all keep items in an
  // `items` child table. Non-empty is a create prerequisite that Frappe
  // enforces on submit — surface it before the user tries.
  const items = ctx.doc.items;
  if (Array.isArray(items) && items.length === 0) return "items";
  return null;
}

function isSubmittable(meta: DoctypeMeta): boolean {
  return meta.is_submittable === 1;
}

// ---------------------------------------------------------------------------
// Per-doctype overrides: called BEFORE the generic rules. Return null to fall
// through. Keep the list short — the generic rules should cover 95%.

const DOCTYPE_OVERRIDES: Record<string, (ctx: Ctx) => NextAction | null> = {
  "Sales Invoice": (ctx) => {
    const status = pickStatus(ctx.doc);
    const outstanding = Number(ctx.doc.outstanding_amount ?? 0);
    if (status === "Overdue" && outstanding > 0) {
      return {
        label: "Send reminder",
        hint: "Payment is overdue. Nudge the customer via email.",
        tone: "warning",
        kind: "review"
      };
    }
    if (status === "Unpaid" && Number(ctx.doc.docstatus) === DOCSTATUS_SUBMITTED) {
      return {
        label: "Record payment",
        hint: "Mark this invoice paid when the funds land.",
        tone: "primary",
        kind: "review"
      };
    }
    return null;
  },
  Lead: (ctx) => {
    const status = pickStatus(ctx.doc);
    if (status === "New Lead" || status === "Contacted") {
      return {
        label: "Qualify this lead",
        hint: "Add a next-step note and move the stage forward.",
        tone: "primary",
        kind: "review"
      };
    }
    return null;
  },

  // Helpdesk — customer tickets need a clear next step at every stage.
  "HD Ticket": (ctx) => {
    const status = pickStatus(ctx.doc);
    const assignee = ctx.doc._assign;
    if (status === "Open" && (!assignee || assignee === "[]")) {
      return {
        label: "Assign to a teammate",
        hint: "Nobody owns this ticket yet — pick an agent so nothing sits.",
        tone: "warning",
        kind: "fill",
        targetField: "_assign"
      };
    }
    if (status === "Open") {
      return {
        label: "Reply to the customer",
        hint: "Send the first response — SLAs start ticking from ticket creation.",
        tone: "primary",
        kind: "review"
      };
    }
    if (status === "Replied" || status === "On Hold") {
      return {
        label: "Waiting on the customer",
        hint: "Ball's in their court. Set a reminder if they don't respond.",
        tone: "info",
        kind: "review"
      };
    }
    if (status === "Resolved") {
      return {
        label: "Close the ticket",
        hint: "Customer confirmed resolution. Mark closed to free the queue.",
        tone: "primary",
        kind: "review"
      };
    }
    return null;
  },

  // Helpdesk knowledge base — drafts are the failure mode.
  "HD Article": (ctx) => {
    if (ctx.doc.status === "Draft") {
      return {
        label: "Publish this article",
        hint: "Drafts don't help customers. Publish when the content is ready.",
        tone: "primary",
        kind: "review"
      };
    }
    return null;
  },

  // Wiki — same draft-blocker as HD Article.
  "Wiki Page": (ctx) => {
    if (ctx.doc.published === 0 || ctx.doc.published === false) {
      return {
        label: "Publish this page",
        hint: "Only your team can see unpublished pages. Publish when it's ready.",
        tone: "primary",
        kind: "fill",
        targetField: "published"
      };
    }
    return null;
  },

  // Insights — dashboards need charts, charts need queries.
  "Insights Dashboard": (ctx) => {
    const charts = ctx.doc.charts;
    if (Array.isArray(charts) && charts.length === 0) {
      return {
        label: "Add your first chart",
        hint: "An empty dashboard has nothing to show. Start with one chart.",
        tone: "primary",
        kind: "fill",
        targetField: "charts"
      };
    }
    return null;
  },
  "Insights Query": (ctx) => {
    if (!ctx.doc.data_source) {
      return {
        label: "Pick a data source",
        hint: "Queries need a database to run against. Choose one to continue.",
        tone: "warning",
        kind: "fill",
        targetField: "data_source"
      };
    }
    return null;
  },

  // Webshop — items aren't visible to shoppers until published.
  "Website Item": (ctx) => {
    if (ctx.doc.published === 0 || ctx.doc.published === false) {
      return {
        label: "Publish to storefront",
        hint: "Customers can't buy this until it's published. Toggle when ready.",
        tone: "primary",
        kind: "fill",
        targetField: "published"
      };
    }
    if (!ctx.doc.website_image) {
      return {
        label: "Add a product image",
        hint: "Items with a cover image convert 3× better. Upload one before publishing.",
        tone: "warning",
        kind: "fill",
        targetField: "website_image"
      };
    }
    return null;
  },

  // Raven Channel — the "empty channel" case.
  "Raven Channel": (ctx) => {
    if (!ctx.doc.channel_description && !ctx.doc.last_message_details) {
      return {
        label: "Send the first message",
        hint: "Empty channels feel dead. Kick things off with a hello or purpose.",
        tone: "primary",
        kind: "review"
      };
    }
    return null;
  }
};

// ---------------------------------------------------------------------------

export function computeNextAction(ctx: Ctx): NextAction | null {
  const { meta, doc, isNew } = ctx;

  // New docs → guide toward the first required field.
  if (isNew) {
    const missing = requiredEmptyField(ctx);
    if (missing) {
      const field = meta.fields.find((f) => f.fieldname === missing);
      const label = field?.label ?? missing;
      return {
        label: `Add ${label.toLowerCase()}`,
        hint: `Every new ${meta.name.toLowerCase()} needs a ${label.toLowerCase()}.`,
        tone: "primary",
        kind: "fill",
        targetField: missing
      };
    }
    return {
      label: `Save this ${meta.name.toLowerCase()}`,
      hint: "Everything checks out — save to keep going.",
      tone: "primary",
      kind: "submit"
    };
  }

  // Per-doctype rules first.
  const override = DOCTYPE_OVERRIDES[meta.name]?.(ctx);
  if (override) return override;

  const docstatus = Number(doc.docstatus ?? 0);

  // Empty required field on existing doc → guide.
  if (docstatus === DOCSTATUS_DRAFT) {
    const missing = requiredEmptyField(ctx);
    if (missing) {
      const field = meta.fields.find((f) => f.fieldname === missing);
      return {
        label: `Add ${(field?.label ?? missing).toLowerCase()}`,
        hint: "This record is missing a required field.",
        tone: "warning",
        kind: "fill",
        targetField: missing
      };
    }

    const missingTable = hasEmptyChildTable(ctx);
    if (missingTable) {
      return {
        label: "Add line items",
        hint: "You can't submit an empty record. Add at least one line.",
        tone: "warning",
        kind: "fill",
        targetField: missingTable
      };
    }

    if (isSubmittable(meta)) {
      return {
        label: "Submit to lock in",
        hint: "Draft is ready. Submitting freezes the numbers and posts to the ledger.",
        tone: "primary",
        kind: "submit"
      };
    }
  }

  if (docstatus === DOCSTATUS_SUBMITTED) {
    // Submitted + no override → nothing urgent. Suggest amend as the safe path.
    return {
      label: "Amend if you need to change something",
      hint: "Submitted records are locked. Amend creates a corrected copy that supersedes this one.",
      tone: "info",
      kind: "amend"
    };
  }

  if (docstatus === DOCSTATUS_CANCELLED) {
    return {
      label: "Duplicate to a new draft",
      hint: "This record was cancelled. Start a fresh copy if you need it back.",
      tone: "neutral",
      kind: "review"
    };
  }

  return null;
}

/**
 * List-level next action — surfaced at the top of every AutoList. Looks at
 * the overall roster and picks the most-important prompt: "3 overdue invoices",
 * "no records yet, create your first", etc.
 */
export interface ListActionCtx {
  meta: DoctypeMeta;
  total: number;
  basePath: string;
  title: string;
}

export function computeListAction(ctx: ListActionCtx): NextAction | null {
  const { total, basePath, meta, title } = ctx;

  if (total === 0) {
    return {
      label: `Create your first ${singular(title).toLowerCase()}`,
      hint: `${title} appear here as you add them. Start with one.`,
      tone: "primary",
      kind: "link",
      href: `${basePath}/new`
    };
  }

  // Draft submittables that have been sitting for a while — future extension
  // once we plumb a "count of drafts" through from the list query.
  if (meta.is_submittable === 1) {
    return {
      label: `Create a ${singular(title).toLowerCase()}`,
      hint: `${total} ${plural(title, total).toLowerCase()} in this workspace so far.`,
      tone: "neutral",
      kind: "link",
      href: `${basePath}/new`
    };
  }

  return null;
}

function singular(s: string): string {
  if (s.endsWith("ies")) return s.slice(0, -3) + "y";
  if (s.endsWith("es") && !s.endsWith("ses")) return s.slice(0, -2);
  if (s.endsWith("s")) return s.slice(0, -1);
  return s;
}

function plural(s: string, n: number): string {
  return n === 1 ? singular(s) : s;
}
