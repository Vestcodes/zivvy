"use client";

import Link from "next/link";
import { ArrowUpRight, Code2, ListChecks, ShieldCheck, Webhook } from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const DEV_CAPABILITIES = [
  {
    Icon: Code2,
    title: "130+ REST endpoints",
    body: "Full CRUD on every doctype — sales, stock, ledgers, HR. Auto-generated docs, stable versioning."
  },
  {
    Icon: Webhook,
    title: "HMAC-signed webhooks",
    body: "Event pushes for creates, updates and submissions. Signed with your workspace secret, retried with backoff."
  },
  {
    Icon: ListChecks,
    title: "Queryable event log",
    body: "Every mutation lands on an append-only log. Replay from any point, audit anything, back-fill downstream stores."
  }
];

/**
 * "Built for developers too" — a compact landing-page block that surfaces
 * Zivvy's platform side. Pushes prospects to the integration docs; the
 * marketing hero targets operators, this one targets the founder-engineer.
 */
export function DeveloperBlock() {
  return (
    <section
      id="developers"
      className="mx-auto max-w-6xl px-6 py-16 sm:py-20"
      aria-labelledby="developers-heading"
    >
      <BlurFade>
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <ShieldCheck className="size-3.5 text-primary" />
            Built for developers too
          </div>
          <h2
            id="developers-heading"
            className="font-display text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            An ERP with real edges you can build on
          </h2>
          <p className="mt-4 text-muted-foreground">
            Zivvy exposes the same primitives your product team already ships against.
            No screen-scraping, no CSV export cron jobs.
          </p>
        </div>
      </BlurFade>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {DEV_CAPABILITIES.map((cap, i) => (
          <BlurFade key={cap.title} delay={0.05 + i * 0.05}>
            <Card className="h-full border-border/70 bg-card/60">
              <CardHeader>
                <div className="flex size-9 items-center justify-center rounded-lg border border-border/70 bg-background/70 text-primary">
                  <cap.Icon className="size-4" />
                </div>
                <CardTitle className="mt-3 font-display text-lg">{cap.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">{cap.body}</CardDescription>
              </CardContent>
            </Card>
          </BlurFade>
        ))}
      </div>

      <BlurFade delay={0.2}>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild variant="polished">
            <a
              href="https://integrate.zivvy.xyz/docs"
              target="_blank"
              rel="noopener noreferrer"
            >
              Read the docs
              <ArrowUpRight className="size-4" />
            </a>
          </Button>
          <Button asChild variant="outline">
            <Link href="/integrations">Browse integrations</Link>
          </Button>
        </div>
      </BlurFade>
    </section>
  );
}
