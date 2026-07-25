"use client";

import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  Headphones,
  Kanban,
  UserPlus,
  Workflow
} from "lucide-react";
import type { HubCardItem } from "@/lib/marketing-content";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedList } from "@/components/ui/animated-list";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { MagicCard } from "@/components/ui/magic-card";
import { Marquee } from "@/components/ui/marquee";
import { ShineBorder } from "@/components/ui/shine-border";
import { TextAnimate } from "@/components/ui/text-animate";
import { cn } from "@/lib/utils";

type Tier = "Free" | "Pro" | "Business";

const TIER_BADGE: Record<Tier, string> = {
  Free: "bg-muted text-foreground border-transparent",
  Pro: "bg-primary-gradient text-primary-foreground border-transparent",
  Business: "bg-foreground text-background border-transparent"
};

const USE_CASE_META: Record<
  string,
  { Icon: React.ElementType; category: string; tier: Tier }
> = {
  "project-management": { Icon: Kanban, category: "Ops", tier: "Pro" },
  "employee-onboarding": { Icon: UserPlus, category: "HR", tier: "Pro" },
  "customer-support": { Icon: Headphones, category: "Support", tier: "Pro" },
  "content-planning": { Icon: ClipboardList, category: "Marketing", tier: "Free" },
  "crm-automation": { Icon: Workflow, category: "Sales", tier: "Free" }
};

const WORKFLOW_VERBS = [
  "Qualify",
  "Assign",
  "Approve",
  "Fulfill",
  "Invoice",
  "Reconcile",
  "Escalate",
  "Report"
];

const BEFORE_AFTER = [
  {
    before: "Sales pings ops in Slack: “stock for SO-482?”",
    after: "SO reservation event fires → picker gets it in the queue",
    tag: "stock.reserved"
  },
  {
    before: "Finance chases the invoice PDF over email",
    after: "invoice.settled webhook posts to the ledger automatically",
    tag: "invoice.settled"
  },
  {
    before: "HR mails a checklist for new hires",
    after: "onboarding.started event triggers seat + role assignment",
    tag: "onboarding.started"
  },
  {
    before: "CX loses track of the P1 escalation thread",
    after: "ticket.escalated webhook opens a triage bridge in one call",
    tag: "ticket.escalated"
  },
  {
    before: "Marketing debates who owns the campaign brief",
    after: "task.assigned event routes it to the on-call planner",
    tag: "task.assigned"
  }
];

type Props = {
  items: HubCardItem[];
};

export function UseCasesHubPage({ items }: Props) {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(ellipse 70% 55% at 50% -10%, color-mix(in oklab, var(--primary) 12%, transparent), transparent 75%)"
            }}
          />
          <div className="relative mx-auto max-w-5xl px-6 pb-4 pt-20 text-center sm:pt-24">
            <BlurFade>
              <div className="mb-5 inline-flex items-center justify-center rounded-full border border-border/60 bg-background/70 px-3 py-1 backdrop-blur">
                <AnimatedShinyText className="text-xs font-medium text-muted-foreground">
                  Use cases · jobs to be done · playbooks
                </AnimatedShinyText>
              </div>
              <TextAnimate
                as="h1"
                by="word"
                animation="blurInUp"
                className="font-display text-4xl font-bold tracking-tight sm:text-5xl"
              >
                Before Zivvy, and after
              </TextAnimate>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Each play maps to REST resources you can automate against and webhook events you can
                subscribe to. Same tenant. No extra pipeline.
              </p>
            </BlurFade>
          </div>

          <div className="relative mx-auto mt-10 max-w-3xl px-6">
            <BlurFade delay={0.1}>
              <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-5">
                <ShineBorder shineColor={["#34d399", "#0f766e"]} duration={14} />
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Real handoffs · before → after
                  </p>
                  <Badge variant="outline" className="text-[10px]">webhook stream</Badge>
                </div>
                <div className="min-h-[18rem]">
                  <AnimatedList delay={1600} className="gap-3">
                    {BEFORE_AFTER.map((row) => (
                      <div
                        key={row.tag}
                        className="w-full rounded-xl border border-border/60 bg-background/80 p-3 text-left shadow-sm"
                      >
                        <p className="text-xs text-muted-foreground line-through decoration-destructive/50">
                          {row.before}
                        </p>
                        <p className="mt-1 text-sm font-medium">{row.after}</p>
                        <span className="mt-2 inline-flex items-center rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[10px] text-primary">
                          {row.tag}
                        </span>
                      </div>
                    ))}
                  </AnimatedList>
                </div>
              </div>
            </BlurFade>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-8 pt-14">
          <BlurFade>
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Playbooks by job
            </h2>
            <p className="mt-2 text-muted-foreground">
              Owners, records, and events already wired inside the product.
            </p>
          </BlurFade>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => {
              const meta = USE_CASE_META[item.slug] ?? {
                Icon: Workflow,
                category: "Ops",
                tier: "Pro" as Tier
              };
              const Icon = meta.Icon;
              return (
                <BlurFade key={item.slug} delay={0.04 + index * 0.04}>
                  <Link href={`/use-cases/${item.slug}`} className="group block h-full">
                    <MagicCard
                      className="relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card/70 p-5"
                      gradientFrom="#34d399"
                      gradientTo="#0f766e"
                      gradientColor="rgba(27, 152, 114, 0.1)"
                    >
                      {index === 0 ? (
                        <BorderBeam size={60} duration={7} colorFrom="#34d399" colorTo="#0f766e" />
                      ) : null}
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <Icon className="size-5 text-primary" />
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className="text-[10px] font-medium">
                            {meta.category}
                          </Badge>
                          <Badge className={cn("text-[10px]", TIER_BADGE[meta.tier])}>
                            {meta.tier}
                          </Badge>
                        </div>
                      </div>
                      <h3 className="mt-1 font-display text-lg font-semibold group-hover:text-primary">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                        Open playbook
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </MagicCard>
                  </Link>
                </BlurFade>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-8">
          <BlurFade>
            <p className="mb-3 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Verbs inside every playbook
            </p>
          </BlurFade>
          <div className="relative overflow-hidden rounded-xl border border-border/60 bg-background/40 py-2">
            <Marquee pauseOnHover className="[--duration:28s]">
              {WORKFLOW_VERBS.map((verb) => (
                <div
                  key={verb}
                  className="mx-2 rounded-lg border border-border/70 bg-card/80 px-4 py-2 text-sm font-medium shadow-sm"
                >
                  {verb}
                </div>
              ))}
            </Marquee>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-14 bg-gradient-to-r from-background to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-background to-transparent" />
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-20 pt-4 sm:pb-24">
          <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 px-6 py-8 text-center">
            <ShineBorder shineColor={["#34d399", "#0f766e"]} duration={14} />
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Bring your own workflow?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
              If it&apos;s not in this list, it&apos;s still a REST resource and a webhook event.
              Wire it in with the workflow builder or the API — we&apos;ll help.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild variant="polished">
                <Link href="/features/workflow-builder">Open workflow builder</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/support/docs">Read the API docs</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
