"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { StatusDot } from "@/components/site/system-status";

type StatusLevel = "operational" | "partial" | "degraded";
type ServiceStatus = { name: string; href: string; note: string; level: StatusLevel };

const SERVICES = [
  {
    name: "App (zivvy.xyz)",
    href: "https://zivvy.xyz/",
    note: "Marketing site and product shell"
  },
  {
    name: "API (api.zivvy.xyz)",
    href: "https://api.zivvy.xyz/api/method/frappe.ping",
    note: "Frappe / ERP APIs"
  },
  {
    name: "Docs (integrate.zivvy.xyz)",
    href: "https://integrate.zivvy.xyz/health",
    note: "OpenAPI and developer docs"
  }
] as const;

const PROBE_TIMEOUT_MS = 4000;

async function probeService(url: string): Promise<StatusLevel> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "HEAD",
      mode: "no-cors",
      cache: "no-store",
      signal: controller.signal
    });
    if (res.type !== "opaque") {
      return res.ok ? "operational" : "degraded";
    }
    return "operational";
  } catch {
    return "degraded";
  } finally {
    clearTimeout(timer);
  }
}

export function StatusPageContent() {
  const [statuses, setStatuses] = useState<ServiceStatus[]>(
    SERVICES.map((svc) => ({ ...svc, level: "operational" as StatusLevel }))
  );

  useEffect(() => {
    let cancelled = false;
    async function check() {
      const results = await Promise.all(
        SERVICES.map(async (svc) => {
          const level = await probeService(svc.href);
          return { ...svc, level };
        })
      );
      if (!cancelled) setStatuses(results);
    }
    void check();
    const interval = setInterval(check, 30_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const LEVEL_LABELS: Record<StatusLevel, string> = {
    operational: "Operational",
    partial: "Partial outage",
    degraded: "Down"
  };

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Status
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          System status
        </h1>
        <p className="mt-3 text-muted-foreground">
          Probe-backed overview of Zivvy surfaces. For incidents, email{" "}
          <a className="underline underline-offset-2" href="mailto:support@zivvy.xyz">
            support@zivvy.xyz
          </a>
          .
        </p>

        <ul className="mt-10 space-y-3">
          {statuses.map((svc) => (
            <li
              key={svc.name}
              className="flex items-start justify-between gap-4 rounded-2xl border border-border/70 bg-card/40 px-4 py-4"
            >
              <div>
                <p className="font-medium">{svc.name}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{svc.note}</p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/60 px-2.5 py-1 text-[11px] text-muted-foreground">
                <StatusDot level={svc.level} />
                {LEVEL_LABELS[svc.level]}
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-sm text-muted-foreground">
          Prefer a footer pill? See the live probe on every page, or{" "}
          <Link href="/support" className="underline underline-offset-2">
            open Support
          </Link>
          .
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
