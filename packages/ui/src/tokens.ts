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

export const statusToneTokens = {
  success: "status-success",
  warning: "status-warning",
  danger: "status-danger",
  info: "status-info",
  neutral: "status-neutral",
  progress: "status-progress"
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
