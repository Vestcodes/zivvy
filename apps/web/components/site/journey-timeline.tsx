"use client";

import { CheckCircle2 } from "lucide-react";
import { Timeline } from "@/components/ui/aceternity";

const MILESTONES = [
  {
    title: "Day 1",
    content: (
      <TimelineContent
        headline="Sign up and import"
        bullets={[
          "Workspace live in India, EU, or US",
          "Customers and items imported from CSV",
          "Two seats free · no card",
        ]}
      />
    ),
  },
  {
    title: "Week 1",
    content: (
      <TimelineContent
        headline="First invoice out the door"
        bullets={[
          "Quote → sales order → invoice flow",
          "Stock reserved and picked",
          "Bank feed live · reconciliation started",
        ]}
      />
    ),
  },
  {
    title: "Month 1",
    content: (
      <TimelineContent
        headline="Fully migrated"
        bullets={[
          "Payroll and HR moved off spreadsheets",
          "Integrations wired to Slack and Stripe",
          "Reports replace the nightly export cron",
        ]}
      />
    ),
  },
  {
    title: "Month 3",
    content: (
      <TimelineContent
        headline="Automating"
        bullets={[
          "Webhooks push events into your product",
          "Approval routes replace back-and-forth",
          "Manufacturing BOMs on Business tier",
        ]}
      />
    ),
  },
];

function TimelineContent({
  headline,
  bullets,
}: {
  headline: string;
  bullets: string[];
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/60 p-5">
      <h4 className="font-display text-lg font-semibold text-foreground">
        {headline}
      </h4>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {bullets.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function JourneyTimeline() {
  return (
    <section className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-6xl px-6 pt-16 sm:pt-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Where teams get to in 90 days
          </h2>
          <p className="mt-3 text-muted-foreground">
            No 12-week implementations. This is what live customers look like
            at each milestone.
          </p>
        </div>
      </div>
      <Timeline data={MILESTONES} />
    </section>
  );
}
