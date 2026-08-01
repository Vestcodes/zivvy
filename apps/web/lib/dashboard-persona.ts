import type { Bootinfo } from "@/lib/boot-types";

export type Persona = "owner" | "sales" | "finance" | "ops" | "hr" | "member";

interface PersonaCopy {
  eyebrow: string;
  focusLabel: string;
  focusHint: string;
}

const PERSONA_COPY: Record<Persona, PersonaCopy> = {
  owner: {
    eyebrow: "Workspace overview",
    focusLabel: "Your business today",
    focusHint: "Revenue, cash, and where things are stuck across the whole workspace."
  },
  sales: {
    eyebrow: "Sales workspace",
    focusLabel: "Your pipeline today",
    focusHint: "Close the gap between quote and paid — leads, deals, and invoices in one view."
  },
  finance: {
    eyebrow: "Finance workspace",
    focusLabel: "Your books today",
    focusHint: "Cash in, cash out, and every open receivable that still needs a chase."
  },
  ops: {
    eyebrow: "Operations workspace",
    focusLabel: "Your floor today",
    focusHint: "Stock at hand, dispatches in flight, and what will run out this week."
  },
  hr: {
    eyebrow: "People workspace",
    focusLabel: "Your team today",
    focusHint: "Attendance, time off, and every joiner still working through onboarding."
  },
  member: {
    eyebrow: "Your workspace",
    focusLabel: "Today's overview",
    focusHint: "Everything on your plate — no more scrolling five tabs to catch up."
  }
};

/**
 * Pick a persona from the current session. Preference order runs
 * highest-signal first: an ops role wins over 'Employee' because ops is
 * a strictly narrower job description. Owner wins over everything else so
 * founders / tenant owners always see the wide view.
 */
export function resolvePersona(boot: Bootinfo): Persona {
  const roles = new Set(boot.user?.roles ?? []);
  const isOwner = Boolean(boot.zivvy?.tenant?.owner_user === boot.user?.name);
  if (isOwner || roles.has("System Manager") || roles.has("Zivvy Ops")) return "owner";
  if (roles.has("Sales Manager") || roles.has("Sales User") || roles.has("Sales Master Manager"))
    return "sales";
  if (
    roles.has("Accounts Manager") ||
    roles.has("Accounts User") ||
    roles.has("Auditor")
  )
    return "finance";
  if (roles.has("Stock Manager") || roles.has("Stock User") || roles.has("Manufacturing Manager"))
    return "ops";
  if (roles.has("HR Manager") || roles.has("HR User")) return "hr";
  return "member";
}

export function personaCopy(p: Persona): PersonaCopy {
  return PERSONA_COPY[p];
}
