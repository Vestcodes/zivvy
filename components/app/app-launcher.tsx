"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { APPS, CATEGORIES, type AppTile } from "@/components/app/app-launcher-data";
import { useZivvyBoot } from "@/components/boot-provider";
import { tierAtLeast } from "@/lib/boot-types";
import { cn } from "@/lib/utils";

function Tile({ app, gated }: { app: AppTile; gated: boolean }) {
  const Icon = app.icon;
  const href = gated ? "/billing" : app.href;
  return (
    <Link
      href={href}
      className="group flex flex-col items-center gap-2 rounded-lg p-3 transition-colors hover:bg-secondary/60"
    >
      <div
        className={cn(
          "relative grid size-20 place-items-center overflow-hidden rounded-2xl bg-linear-to-br text-white shadow-md transition-all group-hover:-translate-y-0.5 group-hover:shadow-lg sm:size-24",
          app.gradient,
          gated && "grayscale-[0.5] opacity-70"
        )}
      >
        <Icon className="size-8 sm:size-9" strokeWidth={1.75} />
        {/* Glossy highlight */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(ellipse 100% 60% at 30% 0%, rgba(255,255,255,0.32), transparent 60%)"
          }}
        />
        {gated && (
          <div className="absolute right-1.5 top-1.5 grid size-5 place-items-center rounded-full bg-black/60 text-white">
            <Lock className="size-3" />
          </div>
        )}
      </div>
      <span className="text-center text-sm font-medium leading-tight">
        {app.label}
      </span>
    </Link>
  );
}

export function AppLauncher() {
  const boot = useZivvyBoot();
  const blocked = new Set(boot?.blocked_modules ?? []);
  const tier = boot?.tier ?? "free";

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
                const gated =
                  (app.module && blocked.has(app.module)) ||
                  (app.minTier && !tierAtLeast(tier, app.minTier));
                return <Tile key={app.href} app={app} gated={Boolean(gated)} />;
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
