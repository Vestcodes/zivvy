"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Boxes,
  Building2,
  ChartLine,
  Factory,
  GraduationCap,
  Headphones,
  LayoutDashboard,
  Layers,
  LockKeyhole,
  PackageOpen,
  ReceiptText,
  ScanBarcode,
  Search,
  ShieldCheck,
  Store,
  Ticket,
  Truck,
  Users,
  UsersRound,
  Wallet,
  X,
  type LucideIcon
} from "lucide-react";
import { getModuleByNavigationKey } from "@zivvy/module-registry";
import { APPS, CATEGORIES, type AppTile } from "@/components/app/app-launcher-data";
import { MODULE_NAVS } from "@/components/app/sidebar-nav";
import {
  readRecentWorkspaces,
  rememberWorkspace
} from "@/components/app/recent-workspaces";
import { useZivvyBoot } from "@/components/boot-provider";
import { useUpgradeDialog } from "@/components/billing/upgrade-affordance";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isItemGated, TIER_LABEL } from "@/lib/gating";
import { cn } from "@/lib/utils";

type WorkspaceGroup = "core" | "operations" | "team" | "insight";

interface WorkspaceDefinition {
  key: string;
  href: string;
  group: WorkspaceGroup;
  tone: "emerald" | "sky" | "amber" | "violet" | "rose" | "slate";
}

const WORKSPACES: WorkspaceDefinition[] = [
  { key: "sales", href: "/sales", group: "core", tone: "emerald" },
  { key: "crm", href: "/crm", group: "core", tone: "violet" },
  { key: "purchases", href: "/purchases", group: "core", tone: "amber" },
  { key: "stock", href: "/stock", group: "core", tone: "amber" },
  { key: "finance", href: "/finance", group: "core", tone: "sky" },
  { key: "shipping", href: "/shipping", group: "operations", tone: "sky" },
  { key: "pos", href: "/pos", group: "operations", tone: "rose" },
  { key: "manufacturing", href: "/manufacturing", group: "operations", tone: "rose" },
  { key: "quality", href: "/quality", group: "operations", tone: "rose" },
  { key: "assets", href: "/assets", group: "operations", tone: "amber" },
  { key: "projects", href: "/projects", group: "operations", tone: "sky" },
  { key: "hr", href: "/hr", group: "team", tone: "violet" },
  { key: "talent", href: "/talent", group: "team", tone: "violet" },
  { key: "service", href: "/service", group: "team", tone: "rose" },
  { key: "helpdesk", href: "/helpdesk", group: "team", tone: "amber" },
  { key: "wiki", href: "/wiki", group: "team", tone: "sky" },
  { key: "insights", href: "/insights", group: "insight", tone: "emerald" },
  { key: "webshop", href: "/webshop", group: "insight", tone: "rose" }
];

const GROUPS: Array<{ key: WorkspaceGroup; label: string; description: string }> = [
  { key: "core", label: "Sell, buy, and account", description: "The daily commercial loop." },
  { key: "operations", label: "Deliver the work", description: "Inventory, fulfilment, production, and delivery." },
  { key: "team", label: "People and service", description: "Run the team and support customers." },
  { key: "insight", label: "Learn and extend", description: "Analytics, storefronts, and connected systems." }
];

// Category eyebrows — mono uppercase labels shown above the module title.
// Deliberately short. Not "Sales & CRM Suite" — just SALES.
const CATEGORY_EYEBROW: Record<WorkspaceGroup, string> = {
  core: "Sell · buy · account",
  operations: "Deliver the work",
  team: "People & support",
  insight: "Learn & extend"
};

// One recognizable glyph per workspace. Chosen so silhouettes stay distinct
// at 20px — no two cards read as the same thing at a glance.
const WORKSPACE_ICON: Record<string, LucideIcon> = {
  sales: ReceiptText,
  crm: UsersRound,
  purchases: PackageOpen,
  stock: Boxes,
  finance: Wallet,
  shipping: Truck,
  pos: ScanBarcode,
  manufacturing: Factory,
  quality: ShieldCheck,
  assets: Building2,
  projects: Layers,
  hr: Users,
  talent: GraduationCap,
  service: Headphones,
  helpdesk: Ticket,
  wiki: BookOpen,
  insights: ChartLine,
  webshop: Store
};

// Tone tints — the glyph sits inside a rounded square filled with a subtle
// hue from the workspace's tone. Same in light and dark, chosen so each
// tone reads as itself without overpowering the mono type below.
const TONE_GLYPH: Record<WorkspaceDefinition["tone"], string> = {
  emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  sky:     "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300",
  amber:   "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  violet:  "bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
  rose:    "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
  slate:   "bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300"
};

function WorkspaceCard({ workspace }: { workspace: WorkspaceDefinition }) {
  const boot = useZivvyBoot();
  const nav = MODULE_NAVS[workspace.key];
  const spec = getModuleByNavigationKey(workspace.key);
  if (!nav || !spec) return null;

  const gates = nav.items.map((item) =>
    isItemGated({ module: item.module, minTier: item.minTier }, boot)
  );
  const locked = gates.length > 0 && gates.every((gate) => gate.gated);
  const availableCount = gates.filter((g) => !g.gated).length;
  const requiredTier = gates.find((gate) => gate.requiredTier)?.requiredTier;
  const Glyph = WORKSPACE_ICON[workspace.key] ?? LayoutDashboard;

  // Meta line — the single earned signal for this card. Prefer an available
  // workflow count over a static description because it says something true
  // about what the operator gets when they open the workspace.
  const meta = locked
    ? `Unlocks ${nav.items.length} workflow${nav.items.length === 1 ? "" : "s"}`
    : availableCount === nav.items.length
      ? `${nav.items.length} workflow${nav.items.length === 1 ? "" : "s"}`
      : `${availableCount} of ${nav.items.length} workflow${nav.items.length === 1 ? "" : "s"}`;

  return (
    <Link
      href={workspace.href}
      onClick={() => rememberWorkspace(workspace.key)}
      className={cn(
        "group relative flex min-h-36 flex-col rounded-xl border border-border/70 bg-card p-5 transition-[border-color,background-color] duration-[var(--duration-base)] ease-[var(--ease-out-quart)] hover:border-foreground/25 hover:bg-accent/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        locked && "opacity-90"
      )}
    >
      {/* Header: workspace glyph + category eyebrow (or lock badge) */}
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "grid size-10 place-items-center rounded-lg transition-colors",
            TONE_GLYPH[workspace.tone]
          )}
          aria-hidden
        >
          <Glyph className="size-5" strokeWidth={1.75} />
        </span>
        <div className="flex flex-col items-end gap-1 pt-1.5 text-right">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {CATEGORY_EYEBROW[workspace.group]}
          </p>
          {locked ? (
            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              <LockKeyhole className="size-3" />
              {TIER_LABEL[requiredTier ?? "pro"]}
            </span>
          ) : null}
        </div>
      </div>

      {/* Middle: title + one-line thesis */}
      <div className="mt-4">
        <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
          {spec.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-muted-foreground">
          {spec.primaryJob ?? spec.description}
        </p>
      </div>

      {/* Foot: hairline + workflow count + verb-with-arrow */}
      <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-3">
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
          {meta}
        </span>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground/85 transition-colors group-hover:text-primary">
          {locked ? "See plans" : "Open"}
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

function WorkflowResult({
  app,
  onGatedActivate
}: {
  app: AppTile;
  onGatedActivate: (feature: string, tier: "free" | "pro" | "business") => void;
}) {
  const boot = useZivvyBoot();
  const gate = isItemGated({ module: app.module, minTier: app.minTier }, boot);
  const Icon = app.icon;
  const category = CATEGORIES.find((item) => item.key === app.category)?.label ?? app.category;
  const content = (
    <>
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground">
        <Icon className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{app.label}</span>
        <span className="block truncate text-xs text-muted-foreground">{category}</span>
      </span>
      {gate.gated ? <LockKeyhole className="size-4 text-muted-foreground" /> : <ArrowRight className="size-4 text-muted-foreground" />}
    </>
  );

  if (gate.gated) {
    return (
      <button
        type="button"
        onClick={() => onGatedActivate(app.label, gate.requiredTier ?? "pro")}
        className="flex min-h-16 w-full items-center gap-3 rounded-xl border border-border/70 bg-card p-3 text-left hover:border-primary/30 hover:bg-accent/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={app.href}
      className="flex min-h-16 items-center gap-3 rounded-xl border border-border/70 bg-card p-3 hover:border-primary/30 hover:bg-accent/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      {content}
    </Link>
  );
}

export function AppLauncher() {
  const pathname = usePathname();
  const upgrade = useUpgradeDialog(pathname);
  const [query, setQuery] = useState("");
  const [recentKeys, setRecentKeys] = useState<string[]>([]);

  useEffect(() => {
    setRecentKeys(readRecentWorkspaces());
  }, []);

  const filteredApps = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return APPS.filter((app) => {
      const category = CATEGORIES.find((item) => item.key === app.category)?.label ?? "";
      return `${app.label} ${category} ${app.module ?? ""}`.toLowerCase().includes(normalized);
    }).slice(0, 36);
  }, [query]);

  const recent = recentKeys
    .map((key) => WORKSPACES.find((workspace) => workspace.key === key))
    .filter((workspace): workspace is WorkspaceDefinition => Boolean(workspace))
    .slice(0, 4);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-9">
      <header className="grid gap-5 border-b border-border/70 pb-7 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.72fr)] lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Your workspace</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            What are you working on?
          </h1>
          <p className="mt-2 max-w-2xl text-base leading-7 text-muted-foreground">
            Start with the job, then move through its records and next actions.
          </p>
        </div>
        <div className="relative">
          <label htmlFor="app-search" className="sr-only">Find a workflow</label>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="app-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find invoices, people, reports…"
            className="h-11 rounded-xl pl-10 pr-10"
          />
          {query ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-1.5 top-1/2 -translate-y-1/2"
            >
              <X className="size-4" />
            </Button>
          ) : null}
        </div>
      </header>

      {query.trim() ? (
        <section aria-labelledby="workflow-results" className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Search</p>
            <h2 id="workflow-results" className="mt-1 font-display text-xl font-semibold tracking-tight">
              {filteredApps.length > 0 ? `${filteredApps.length} matching workflows` : "No workflows found"}
            </h2>
          </div>
          {filteredApps.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {filteredApps.map((app) => (
                <WorkflowResult key={app.href} app={app} onGatedActivate={upgrade.open} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <p className="font-medium">Try a broader business term</p>
              <p className="mt-1 text-sm text-muted-foreground">For example: sales, stock, people, payment, or report.</p>
            </div>
          )}
        </section>
      ) : (
        <>
          {recent.length > 0 ? (
            <section aria-labelledby="continue-working" className="space-y-3">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Recent</p>
                  <h2 id="continue-working" className="mt-1 font-display text-xl font-semibold tracking-tight">
                    Continue working
                  </h2>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/dashboard">Dashboard <ArrowRight className="size-3.5" /></Link>
                </Button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {recent.map((workspace) => (
                  <WorkspaceCard key={`recent-${workspace.key}`} workspace={workspace} />
                ))}
              </div>
            </section>
          ) : null}

          {GROUPS.map((group) => {
            const workspaces = WORKSPACES.filter((workspace) => workspace.group === group.key);
            return (
              <section key={group.key} aria-labelledby={`group-${group.key}`} className="space-y-3">
                <div>
                  <h2 id={`group-${group.key}`} className="font-display text-lg font-semibold tracking-tight">{group.label}</h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">{group.description}</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {workspaces.map((workspace) => (
                    <WorkspaceCard key={workspace.key} workspace={workspace} />
                  ))}
                </div>
              </section>
            );
          })}
        </>
      )}
      {upgrade.element}
    </div>
  );
}
