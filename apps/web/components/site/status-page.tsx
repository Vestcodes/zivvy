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
    name: "Backend (api.zivvy.xyz)",
    href: "https://api.zivvy.xyz/api/method/frappe.ping",
    note: "Frappe / ERP backend APIs"
  },
  {
    name: "Integration API (integrate.zivvy.xyz)",
    href: "https://integrate.zivvy.xyz/health",
    note: "Public REST API and developer docs"
  }
] as const;

const DATACENTERS = [
  { code: "IN", label: "India", region: "ap-south-1" },
  { code: "EU", label: "Europe", region: "eu-central-1" },
  { code: "US", label: "United States", region: "us-east-1" },
] as const;

const PROBE_TIMEOUT_MS = 5000;

async function probeService(url: string): Promise<StatusLevel> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  try {
    await fetch(url, {
      method: "HEAD",
      mode: "no-cors",
      cache: "no-store",
      signal: controller.signal
    });
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

  const allOperational = statuses.every((s) => s.level === "operational");
  const allDegraded = statuses.every((s) => s.level === "degraded");
  const overallLevel: StatusLevel = allOperational
    ? "operational"
    : allDegraded
      ? "degraded"
      : "partial";

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
          Live health checks for all Zivvy services. For incidents, email{" "}
          <a className="underline underline-offset-2" href="mailto:support@zivvy.xyz">
            support@zivvy.xyz
          </a>
          .
        </p>

        <div className="mt-8 flex items-center gap-2 rounded-2xl border border-border/70 bg-card/40 px-5 py-4">
          <StatusDot level={overallLevel} className="size-2.5" />
          <span className="text-lg font-semibold">
            {overallLevel === "operational"
              ? "All systems operational"
              : overallLevel === "degraded"
                ? "Major outage"
                : "Partial disruption"}
          </span>
        </div>

        <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Services
        </h2>
        <ul className="mt-3 space-y-3">
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

        <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Datacenters
        </h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-3">
          {DATACENTERS.map((dc) => (
            <li
              key={dc.code}
              className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card/40 px-4 py-4"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-bold">
                {dc.code}
              </span>
              <div>
                <p className="text-sm font-medium">{dc.label}</p>
                <p className="text-xs text-muted-foreground">{dc.region}</p>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-sm text-muted-foreground">
          Your workspace data stays in the region you chose at signup. See the
          live status probe on every page in the footer.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
