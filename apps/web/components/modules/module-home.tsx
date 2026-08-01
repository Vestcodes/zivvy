import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Layers3,
  LockKeyhole,
  PlugZap,
  Sparkles
} from "lucide-react";
import { getModuleByNavigationKey } from "@zivvy/module-registry";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { MODULE_NAVS } from "@/components/app/sidebar-nav";
import { fetchBootinfo } from "@/lib/boot-server";
import { isItemGated, TIER_LABEL } from "@/lib/gating";
import { frappeGetCount, reportviewGet } from "@/lib/frappe-meta";
import { slugToDoctype } from "@/lib/doctype-slugs";
import { cn } from "@/lib/utils";

const PRIMARY_ROUTES: Record<string, string> = {
  sales: "/sales/invoices?new=1",
  crm: "/crm/leads?new=1",
  pos: "/pos/invoices?new=1",
  purchases: "/purchases/orders?new=1",
  stock: "/stock/items?new=1",
  shipping: "/shipping/shipments?new=1",
  finance: "/finance/banking/reconciliation",
  hr: "/hr/employees?new=1",
  talent: "/talent/openings?new=1",
  projects: "/projects/all?new=1",
  manufacturing: "/manufacturing/work-orders?new=1",
  quality: "/quality/inspections?new=1",
  assets: "/assets/register?new=1",
  service: "/service/tickets?new=1",
  helpdesk: "/helpdesk/tickets?new=1",
  wiki: "/wiki/pages?new=1",
  webshop: "/webshop/products?new=1",
  insights: "/insights/dashboards?new=1"
};

function doctypeForHref(href: string): string | null {
  const [path] = href.split("?");
  const [moduleKey, doctypeKey] = path.split("/").filter(Boolean);
  if (!moduleKey || !doctypeKey) return null;
  return slugToDoctype(moduleKey, doctypeKey);
}

function formatDate(value: unknown): string {
  if (!value) return "Recently updated";
  const date = new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return "Recently updated";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() === new Date().getFullYear() ? undefined : "numeric"
  }).format(date);
}

export async function ModuleHome({ moduleKey }: { moduleKey: string }) {
  const nav = MODULE_NAVS[moduleKey];
  const spec = getModuleByNavigationKey(moduleKey);
  if (!nav || !spec) return null;

  const boot = await fetchBootinfo();
  const moduleGate = isItemGated({ minTier: spec.minTier }, boot.zivvy);
  const dataItem = nav.items.find((item) => doctypeForHref(item.href));
  const dataDoctype = dataItem ? doctypeForHref(dataItem.href) : null;

  const [recent, count] = dataDoctype && !moduleGate.gated
    ? await Promise.all([
        reportviewGet({
          doctype: dataDoctype,
          fields: ["name", "modified"],
          order_by: "modified DESC",
          page_length: 4
        }),
        frappeGetCount(dataDoctype)
      ])
    : [null, 0] as const;

  const primaryHref = PRIMARY_ROUTES[moduleKey] ?? nav.items[0]?.href ?? "/apps";
  const HomeIcon = nav.items[0]?.icon ?? Layers3;
  const liveRows = recent?.values ?? [];
  const hasDataAccess = Boolean(recent);
  const availableWorkflows = nav.items.filter(
    (item) => !isItemGated({ module: item.module, minTier: item.minTier }, boot.zivvy).gated
  ).length;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <header className="border-b border-border/70 pb-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
                <HomeIcon className="size-4" />
              </span>
              Module workspace
            </div>
            <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {spec.title}
            </h1>
            <p className="mt-2 max-w-2xl text-base leading-7 text-muted-foreground">
              {spec.primaryJob}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="lg">
              <Link href={nav.items[0]?.href ?? "/apps"}>Browse records</Link>
            </Button>
            <Button asChild variant="polished" size="lg">
              <Link href={moduleGate.gated ? "/billing" : primaryHref}>
                {moduleGate.gated ? `Upgrade to ${TIER_LABEL[moduleGate.requiredTier ?? spec.minTier]}` : spec.primaryCta}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section aria-labelledby={`${moduleKey}-health`}>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Today</p>
            <h2 id={`${moduleKey}-health`} className="mt-1 font-display text-xl font-semibold tracking-tight">
              Workspace health
            </h2>
          </div>
          <StatusBadge
            status={moduleGate.gated ? "Upgrade required" : hasDataAccess ? "Ready" : "Needs setup"}
            tone={moduleGate.gated ? "warning" : hasDataAccess ? "success" : "danger"}
          />
        </div>
        <div className="divide-y rounded-xl border border-border/70 bg-card md:grid md:grid-cols-3 md:divide-x md:divide-y-0">
          <div className="flex min-h-28 gap-3 p-5">
            {moduleGate.gated ? <LockKeyhole className="mt-0.5 size-5 text-status-warning-fg" /> : <CheckCircle2 className="mt-0.5 size-5 text-primary" />}
            <div>
              <p className="font-medium">Plan access</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {moduleGate.gated
                  ? `${TIER_LABEL[spec.minTier]} unlocks this workspace.`
                  : `${TIER_LABEL[boot.zivvy?.tier ?? "free"]} includes this module.`}
              </p>
            </div>
          </div>
          <div className="flex min-h-28 gap-3 p-5">
            <Layers3 className="mt-0.5 size-5 text-primary" />
            <div>
              <p className="font-medium">{availableWorkflows} of {nav.items.length} workflows ready</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {hasDataAccess ? `${count.toLocaleString()} records in ${dataDoctype}.` : "Live data will appear after setup is complete."}
              </p>
            </div>
          </div>
          <div className="flex min-h-28 gap-3 p-5">
            <PlugZap className="mt-0.5 size-5 text-primary" />
            <div>
              <p className="font-medium">{spec.integrations.length} integration options</p>
              <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                {spec.integrations.slice(0, 3).join(", ")}
                {spec.integrations.length > 3 ? " and more" : ""}.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(19rem,0.75fr)]">
        <section aria-labelledby={`${moduleKey}-workflows`}>
          <div className="mb-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Workflows</p>
            <h2 id={`${moduleKey}-workflows`} className="mt-1 font-display text-xl font-semibold tracking-tight">
              Start where the work is
            </h2>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {nav.items.map((item) => {
              const gate = isItemGated({ module: item.module, minTier: item.minTier }, boot.zivvy);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={gate.gated ? "/billing" : item.href}
                  className="group flex min-h-20 items-center gap-3 rounded-xl border border-border/70 bg-card p-4 transition-[border-color,background-color,transform] duration-[var(--duration-base)] ease-[var(--ease-out-quart)] hover:-translate-y-0.5 hover:border-primary/35 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground group-hover:bg-primary/10 group-hover:text-primary">
                    <Icon className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{item.label}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {gate.gated ? `${TIER_LABEL[gate.requiredTier ?? "pro"]} plan` : "Open workspace"}
                    </span>
                  </span>
                  {gate.gated ? <LockKeyhole className="size-4 text-muted-foreground" /> : <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />}
                </Link>
              );
            })}
          </div>
        </section>

        <div className="space-y-6">
          <section aria-labelledby={`${moduleKey}-attention`}>
            <div className="mb-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Next action</p>
              <h2 id={`${moduleKey}-attention`} className="mt-1 font-display text-xl font-semibold tracking-tight">
                Needs attention
              </h2>
            </div>
            <div className={cn(
              "rounded-xl border p-5",
              moduleGate.gated || !hasDataAccess
                ? "border-status-warning-ring bg-status-warning-bg/55"
                : "border-border/70 bg-card"
            )}>
              {moduleGate.gated || !hasDataAccess ? (
                <AlertTriangle className="size-5 text-status-warning-fg" />
              ) : (
                <CheckCircle2 className="size-5 text-primary" />
              )}
              <p className="mt-3 font-medium">
                {moduleGate.gated ? "Plan access is blocking this module" : !hasDataAccess ? "Finish workspace setup" : liveRows.length === 0 ? "Create the first record" : "No setup blockers"}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {moduleGate.gated
                  ? `Move to ${TIER_LABEL[spec.minTier]} to use ${spec.title.toLowerCase()}.`
                  : !hasDataAccess
                    ? "The live record service is not available for this workspace yet. Check permissions and installed apps."
                    : liveRows.length === 0
                      ? spec.emptyState
                      : "Your next step is ready. Open a workflow or continue with the primary action."}
              </p>
            </div>
          </section>

          <section aria-labelledby={`${moduleKey}-recent`}>
            <div className="mb-3 flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">History</p>
                <h2 id={`${moduleKey}-recent`} className="mt-1 font-display text-xl font-semibold tracking-tight">
                  Recent activity
                </h2>
              </div>
              <Clock3 className="size-4 text-muted-foreground" />
            </div>
            <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
              {liveRows.length > 0 && dataItem ? (
                <ul className="divide-y divide-border/70">
                  {liveRows.map((row) => (
                    <li key={row.name}>
                      <Link
                        href={`${dataItem.href.split("?")[0]}/${encodeURIComponent(row.name)}`}
                        className="flex min-h-14 items-center justify-between gap-3 px-4 py-3 hover:bg-muted/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/50"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">{row.name}</span>
                          <span className="block text-xs text-muted-foreground">{dataDoctype}</span>
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">{formatDate(row.modified)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-5">
                  <p className="text-sm font-medium">Nothing recent yet</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{spec.emptyState}</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <section aria-labelledby={`${moduleKey}-assist`} className="rounded-xl border border-border/70 bg-secondary/35 p-5 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start">
          <div>
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="size-4" />
              <p className="text-xs font-semibold uppercase tracking-[0.14em]">Assisted work</p>
            </div>
            <h2 id={`${moduleKey}-assist`} className="mt-2 font-display text-xl font-semibold tracking-tight">
              Help that stays reversible
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Suggested actions explain their work and leave the final decision with your team.
            </p>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {spec.aiCapabilities.slice(0, 4).map((capability) => (
              <li key={capability} className="flex gap-2 rounded-lg bg-background/80 px-3 py-2.5 text-sm">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                <span className="first-letter:uppercase">{capability}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
