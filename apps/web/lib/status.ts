/**
 * Semantic status tone system.
 * Maps free-text Frappe status labels (workflow_state, status field, docstatus)
 * into a small, consistent set of semantic tones with associated colors.
 */

export type StatusTone =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "progress"
  | "neutral";

interface ToneConfig {
  bg: string;
  fg: string;
  ring: string;
  dot: string;
}

export const STATUS_TONE_CLASSES: Record<StatusTone, ToneConfig> = {
  success: {
    bg: "bg-status-success-bg",
    fg: "text-status-success-fg",
    ring: "ring-status-success-ring/40",
    dot: "bg-status-success-fg"
  },
  warning: {
    bg: "bg-status-warning-bg",
    fg: "text-status-warning-fg",
    ring: "ring-status-warning-ring/40",
    dot: "bg-status-warning-fg"
  },
  danger: {
    bg: "bg-status-danger-bg",
    fg: "text-status-danger-fg",
    ring: "ring-status-danger-ring/40",
    dot: "bg-status-danger-fg"
  },
  info: {
    bg: "bg-status-info-bg",
    fg: "text-status-info-fg",
    ring: "ring-status-info-ring/40",
    dot: "bg-status-info-fg"
  },
  progress: {
    bg: "bg-status-progress-bg",
    fg: "text-status-progress-fg",
    ring: "ring-status-progress-ring/40",
    dot: "bg-status-progress-fg"
  },
  neutral: {
    bg: "bg-status-neutral-bg",
    fg: "text-status-neutral-fg",
    ring: "ring-status-neutral-ring/40",
    dot: "bg-status-neutral-fg"
  }
};

/**
 * Case-insensitive substring keyword → tone map.
 * Order matters: first match wins, so more specific keywords sit first.
 */
const KEYWORD_TONES: Array<[RegExp, StatusTone]> = [
  // Danger / failures (checked first because "cancelled" contains "-l-")
  [/\b(cancel(?:led|ed)?|rejected|failed|overdue|expired|error|blocked|lost)\b/i, "danger"],
  // Warning / pending action
  [/\b(pending|on hold|hold|awaiting|to bill|to deliver|to pay|to receive|partial|unpaid)\b/i, "warning"],
  // Success / terminal-good
  [/\b(paid|completed|closed won|closed|delivered|received|approved|active|published|success|done|resolved)\b/i, "success"],
  // Progress / in-flight
  [/\b(in progress|working|processing|running|open|new lead|contacted|qualified|proposal)\b/i, "progress"],
  // Info / informational-neutral
  [/\b(submitted|scheduled|planned|forecast)\b/i, "info"],
  // Neutral / draft-y
  [/\b(draft|unsaved|not started)\b/i, "neutral"]
];

export function toneForStatus(status: string | number | null | undefined): StatusTone {
  if (status === null || status === undefined || status === "") return "neutral";
  const s = String(status);
  for (const [re, tone] of KEYWORD_TONES) {
    if (re.test(s)) return tone;
  }
  return "neutral";
}

/**
 * Frappe's numeric `docstatus` field: 0 draft, 1 submitted, 2 cancelled.
 */
export function toneForDocstatus(docstatus: number): StatusTone {
  if (docstatus === 1) return "success";
  if (docstatus === 2) return "danger";
  return "neutral";
}

export function docstatusLabel(docstatus: number): string {
  if (docstatus === 1) return "Submitted";
  if (docstatus === 2) return "Cancelled";
  return "Draft";
}

/**
 * Field names that should render their Select/Data value as a StatusBadge
 * rather than a neutral pill.
 */
export const STATUS_FIELD_NAMES = new Set([
  "status",
  "workflow_state",
  "docstatus",
  "delivery_status",
  "billing_status",
  "payment_status",
  "approval_status"
]);
