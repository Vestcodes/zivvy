"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Lock } from "lucide-react";
import { APPS, CATEGORIES, type AppTile } from "@/components/app/app-launcher-data";
import { useZivvyBoot } from "@/components/boot-provider";
import { isItemGated } from "@/lib/gating";
import { useUpgradeDialog } from "@/components/billing/upgrade-affordance";
import { cn } from "@/lib/utils";
import type { ZivvyTier } from "@/lib/boot-types";

function Tile({
  app,
  gated,
  requiredTier,
  onGatedActivate
}: {
  app: AppTile;
  gated: boolean;
  requiredTier?: ZivvyTier;
  onGatedActivate: (feature: string, tier: ZivvyTier) => void;
}) {
  const Icon = app.icon;

  const inner = (
    <>
      <div
        className={cn(
          "relative grid size-20 place-items-center overflow-hidden rounded-2xl bg-linear-to-br text-white shadow-md transition-all duration-[var(--duration-base)] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:-translate-y-1 group-hover:shadow-lg group-active:scale-[0.98] group-active:translate-y-0 sm:size-24",
          app.gradient,
          gated && "grayscale-[0.5] opacity-70"
        )}
      >
        <Icon className="size-8 sm:size-9 transition-transform group-hover:scale-110" strokeWidth={1.75} />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(ellipse 100% 60% at 30% 0%, rgba(255,255,255,0.32), transparent 60%)"
          }}
        />
        {gated && (
          <div className="absolute right-1.5 top-1.5 grid size-5 place-items-center rounded-full bg-black/60 text-white shadow-sm">
            <Lock className="size-3" />
          </div>
        )}
      </div>
      <span className="text-center text-sm font-medium leading-tight">
        {app.label}
      </span>
    </>
  );

  if (gated) {
    return (
      <button
        type="button"
        onClick={() => onGatedActivate(app.label, requiredTier ?? "pro")}
        className="group flex flex-col items-center gap-2 rounded-lg p-3 text-left transition-colors hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        {inner}
      </button>
    );
  }

  return (
    <Link
      href={app.href}
      className="group flex flex-col items-center gap-2 rounded-lg p-3 transition-colors hover:bg-secondary/60"
    >
      {inner}
    </Link>
  );
}

export function AppLauncher() {
  const boot = useZivvyBoot();
  const pathname = usePathname();
  const upgrade = useUpgradeDialog(pathname);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <header>
        <h1 className="font-display text-3xl tracking-tight sm:text-4xl">Apps</h1>
        <p className="mt-1 text-muted-foreground">
          Everything Zivvy can do. Click a tile to jump in.
        </p>
      </header>

      {CATEGORIES.map((cat) => {
        const items = APPS.filter((a) => a.category === cat.key);
        if (items.length === 0) return null;
        return (
          <section key={cat.key} className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {cat.label}
            </h2>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7">
              {items.map((app) => {
                const gate = isItemGated(
                  { module: app.module, minTier: app.minTier },
                  boot
                );
                return (
                  <Tile
                    key={app.href}
                    app={app}
                    gated={gate.gated}
                    requiredTier={gate.requiredTier}
                    onGatedActivate={upgrade.open}
                  />
                );
              })}
            </div>
          </section>
        );
      })}
      {upgrade.element}
    </div>
  );
}
