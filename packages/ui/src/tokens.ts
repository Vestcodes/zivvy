export const brandTokens = {
  radius: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem"
  },
  color: {
    background: "var(--background)",
    foreground: "var(--foreground)",
    primary: "var(--primary)",
    primaryForeground: "var(--primary-foreground)",
    border: "var(--border)"
  }
} as const;

/**
 * Product typography roles. These are semantic contracts rather than raw
 * Tailwind classes so every app can map the same hierarchy to its renderer.
 */
export const typeScaleTokens = {
  marketingHero: { min: "2.75rem", preferred: "7vw", max: "5.75rem", lineHeight: "0.94" },
  pageTitle: { min: "1.75rem", preferred: "3vw", max: "2.5rem", lineHeight: "1.08" },
  sectionTitle: { size: "1.125rem", lineHeight: "1.4" },
  body: { size: "1rem", lineHeight: "1.6" },
  tableBody: { size: "0.875rem", lineHeight: "1.45" },
  caption: { size: "0.75rem", lineHeight: "1.4", letterSpacing: "0.02em" }
} as const;

/** Shared app-shell measurements used by the web app and future clients. */
export const appLayoutTokens = {
  sidebarWidth: "16rem",
  topbarHeight: "3rem",
  contentMaxWidth: "80rem",
  readingMaxWidth: "44rem",
  tableRowHeight: "3.25rem",
  touchTarget: "2.75rem"
} as const;

export const motionTokens = {
  fast: "120ms",
  base: "180ms",
  slow: "260ms",
  easeOut: "cubic-bezier(0.25, 1, 0.5, 1)",
  easeState: "cubic-bezier(0.4, 0, 0.2, 1)"
} as const;

export const statusToneTokens = {
  success: "status-success",
  warning: "status-warning",
  danger: "status-danger",
  info: "status-info",
  neutral: "status-neutral",
  progress: "status-progress"
} as const;

/** Canonical workflow language → semantic tone. */
export const workflowStatusTokens = {
  draft: statusToneTokens.neutral,
  pending: statusToneTokens.warning,
  sent: statusToneTokens.info,
  inProgress: statusToneTokens.progress,
  overdue: statusToneTokens.danger,
  failed: statusToneTokens.danger,
  cancelled: statusToneTokens.neutral,
  paid: statusToneTokens.success,
  completed: statusToneTokens.success,
  synced: statusToneTokens.success
} as const;

/**
 * Required content contracts for module surfaces. Kept as data so automated
 * checks can verify that every client implements the same UX baseline.
 */
export const componentContracts = {
  moduleHome: ["health", "attention", "recentActivity", "primaryAction", "nextAction", "integrations"],
  listPage: ["search", "filters", "savedViews", "sort", "pagination", "rowActions", "responsiveRows"],
  detailPage: ["status", "owner", "primaryAction", "overview", "activity", "relatedRecords"],
  asyncState: ["empty", "loading", "error", "retry"]
} as const;

export const moduleToneTokens = {
  sales: "emerald",
  crm: "sky",
  finance: "blue",
  stock: "amber",
  procurement: "violet",
  projects: "indigo",
  people: "rose",
  manufacturing: "orange",
  support: "cyan",
  analytics: "slate",
  integrations: "teal",
  admin: "neutral"
} as const;
