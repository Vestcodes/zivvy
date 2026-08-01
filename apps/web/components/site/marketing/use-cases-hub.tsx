"use client";

import dynamic from "next/dynamic";
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
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { MagicCard } from "@/components/ui/magic-card";
import { Marquee } from "@/components/ui/marquee";
import { ShineBorder } from "@/components/ui/shine-border";
import { TextAnimate } from "@/components/ui/text-animate";
import { cn } from "@/lib/utils";

const Meteors = dynamic(
  () => import("@/components/ui/aceternity/meteors").then((m) => m.Meteors),
  { ssr: false }
);

const StickyScroll = dynamic(
  () =>
    import("@/components/ui/aceternity/sticky-scroll-reveal").then(
      (m) => m.StickyScroll
    ),
  { ssr: false }
);

type Tier = "Free" | "Pro" | "Business";

const TIER_BADGE: Record<Tier, string> = {
  Free: "bg-muted text-foreground border-transparent",
  Pro: "bg-primary-gradient text-primary-foreground border-transparent",
  Business: "bg-foreground text-background border-transparent"
};

type UseCaseMeta = {
  Icon: React.ElementType;
  category: string;
  tier: Tier;
  event: string;
  bullets: string[];
};

const USE_CASE_META: Record<string, UseCaseMeta> = {
  "project-management": {
    Icon: Kanban,
    category: "Ops",
    tier: "Pro",
    event: "task.status.changed",
    bullets: [
      "Kanban tied to /projects and /tasks",
      "task.status.changed webhook",
      "Timesheets + budget rollup"
    ]
  },
  "employee-onboarding": {
    Icon: UserPlus,
    category: "HR",
    tier: "Pro",
    event: "onboarding.started",
    bullets: [
      "Seat + role assigned on hire",
      "onboarding.started webhook",
      "Checklist + doc-e-sign inline"
    ]
  },
  "customer-support": {
    Icon: Headphones,
    category: "Support",
    tier: "Pro",
    event: "ticket.escalated",
    bullets: [
      "/tickets with SLA timers",
      "ticket.escalated webhook",
      "Bridge to Slack in one call"
    ]
  },
  "content-planning": {
    Icon: ClipboardList,
    category: "Marketing",
    tier: "Free",
    event: "task.assigned",
    bullets: [
      "Editorial calendar tied to tasks",
      "task.assigned webhook",
      "Approvals routed by role"
    ]
  },
  "crm-automation": {
    Icon: Workflow,
    category: "Sales",
    tier: "Free",
    event: "lead.qualified",
    bullets: [
      "Lead scoring via /leads",
      "lead.qualified webhook",
      "Auto-route to sales owner"
    ]
  }
};

const DEFAULT_META: UseCaseMeta = {
  Icon: Workflow,
  category: "Ops",
  tier: "Pro",
  event: "workflow.completed",
  bullets: ["REST resource per step", "Webhook per state change", "Roles by scope"]
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

type Props = {
  items: HubCardItem[];
};

function StickyVisual({ item, meta }: { item: HubCardItem; meta: UseCaseMeta }) {
  const Icon = meta.Icon;
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-6">
      <div className="flex size-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur">
        <Icon className="size-8 text-white" />
      </div>
      <div className="rounded-lg border border-white/20 bg-black/30 px-3 py-1.5 font-mono text-[11px] text-white/90">
        POST /webhooks · {meta.event}
      </div>
      <div className="grid w-full gap-1.5 text-left text-[11px] text-white/85">
        {meta.bullets.map((b) => (
          <div
            key={b}
            className="rounded-md border border-white/15 bg-white/5 px-2.5 py-1.5"
          >
            {b}
          </div>
        ))}
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-wide text-white/60">
        {item.title}
      </div>
    </div>
  );
}

export function UseCasesHubPage({ items }: Props) {
  const primary = items.slice(0, 4);
  const rest = items.slice(4);

  const stickyContent = primary.map((item) => {
    const meta = USE_CASE_META[item.slug] ?? DEFAULT_META;
    return {
      title: item.title,
      description: `${item.description} Every step is a REST resource, and every state change fires a webhook you can subscribe to.`,
      content: <StickyVisual item={item} meta={meta} />
    };
  });

  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <Meteors number={22} />
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-20"
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
                Real workflows. Real events.
              </TextAnimate>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Each play maps to REST resources you can automate against and webhook events you can
                subscribe to. Same tenant. No extra pipeline.
              </p>
            </BlurFade>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pt-14">
          <BlurFade>
            <div className="mb-6 flex flex-wrap items-baseline gap-3">
              <Badge className="bg-primary-gradient text-primary-foreground border-transparent">
                Top 4
              </Badge>
              <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                The playbooks operators keep coming back to
              </h2>
            </div>
            <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
              Scroll the panel — each stage keeps its description on the left while the tenant-side
              artefact stays sticky on the right.
            </p>
          </BlurFade>
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/40">
            <StickyScroll
              content={stickyContent}
              backgroundColors={["#022c22", "#052e16", "#064e3b", "#0f172a"]}
              linearGradients={[
                "linear-gradient(135deg, #34d399, #0f766e)",
                "linear-gradient(135deg, #22d3ee, #0f766e)",
                "linear-gradient(135deg, #0ea5e9, #0f766e)",
                "linear-gradient(135deg, #34d399, #22d3ee)"
              ]}
            />
          </div>
        </section>

        {rest.length > 0 && (
          <section className="mx-auto max-w-6xl px-6 pb-8 pt-14">
            <BlurFade>
              <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                More playbooks
              </h2>
              <p className="mt-2 text-muted-foreground">
                Owners, records, and events already wired inside the product.
              </p>
            </BlurFade>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((item, index) => {
                const meta = USE_CASE_META[item.slug] ?? DEFAULT_META;
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
        )}

        <section className="mx-auto max-w-6xl px-6 py-10">
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
                <a
                  href="https://integrate.zivvy.xyz/docs"
                  target="_blank"
                  rel="noreferrer"
                >
                  Read the API docs
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
