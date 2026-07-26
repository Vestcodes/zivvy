"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type StatusLevel = "operational" | "partial" | "degraded";

type ProbeResult = { ok: boolean };

const PROBES: string[] = [
  "https://zivvy.xyz/",
  "https://api.zivvy.xyz/api/method/frappe.ping",
  "https://integrate.zivvy.xyz/health",
];

const PROBE_TIMEOUT_MS = 5000;
const REFRESH_INTERVAL_MS = 60_000;

async function probe(url: string): Promise<ProbeResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "HEAD",
      mode: "no-cors",
      cache: "no-store",
      signal: controller.signal,
    });
    // no-cors gives opaque responses where res.ok is always false.
    // A completed fetch (no throw) means the server responded — treat as up.
    return { ok: true };
  } catch {
    return { ok: false };
  } finally {
    clearTimeout(timer);
  }
}

function aggregate(results: ProbeResult[]): StatusLevel {
  const ups = results.filter((r) => r.ok).length;
  if (ups === results.length) return "operational";
  if (ups === 0) return "degraded";
  return "partial";
}

const LABELS: Record<StatusLevel, string> = {
  operational: "All systems go",
  partial: "Partial outage",
  degraded: "Degraded",
};

const DOT_CLASSES: Record<StatusLevel, string> = {
  operational: "bg-emerald-500",
  partial: "bg-amber-500",
  degraded: "bg-rose-500",
};

export function StatusDot({
  level = "operational",
  className,
}: {
  level?: StatusLevel;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn("size-1.5 rounded-full", DOT_CLASSES[level], className)}
    />
  );
}

export function SystemStatus({ className }: { className?: string }) {
  const [level, setLevel] = useState<StatusLevel>("operational");

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const results = await Promise.all(PROBES.map((u) => probe(u)));
      if (cancelled) return;
      setLevel(aggregate(results));
    }

    void check();
    const interval = window.setInterval(check, REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <a
      href="/status"
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/60 px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground",
        className,
      )}
      aria-label={`System status: ${LABELS[level]}. Opens status page.`}
    >
      <StatusDot level={level} />
      {LABELS[level]}
    </a>
  );
}
