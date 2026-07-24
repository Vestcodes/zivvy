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
import { Button } from "@/components/ui/button";
import { AnimatedList } from "@/components/ui/animated-list";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { MagicCard } from "@/components/ui/magic-card";
import { Marquee } from "@/components/ui/marquee";
import { RetroGrid } from "@/components/ui/retro-grid";
import { ShineBorder } from "@/components/ui/shine-border";
import { TextAnimate } from "@/components/ui/text-animate";

const USE_CASE_ICONS: Record<string, React.ElementType> = {
  "project-management": Kanban,
  "employee-onboarding": UserPlus,
  "customer-support": Headphones,
  "content-planning": ClipboardList,
  "crm-automation": Workflow
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

const LIVE_STEPS = [
  "Lead captured → owner assigned",
  "Quote approved → order created",
  "Stock reserved → pick list ready",
  "Invoice sent → payment tracked",
  "Exception raised → owner notified"
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
          <RetroGrid className="opacity-35" />
          <div className="relative mx-auto max-w-5xl px-6 pb-10 pt-20 text-center sm:pt-24">
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
                Workflows teams search for
              </TextAnimate>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Concrete operating patterns — from onboarding to CRM automation — mapped to Zivvy
                records, owners, and approvals.
              </p>
            </BlurFade>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((item, index) => {
              const Icon = USE_CASE_ICONS[item.slug] ?? Workflow;
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
                      <Icon className="size-5 text-primary" />
                      <h2 className="mt-3 font-display text-lg font-semibold group-hover:text-primary">
                        {item.title}
                      </h2>
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

          <BlurFade delay={0.1}>
            <div className="relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-5">
              <ShineBorder shineColor={["#34d399", "#0f766e"]} duration={14} />
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Live handoff stream
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                What a healthy Zivvy day looks like across sales, stock, and finance.
              </p>
              <div className="mt-5 min-h-[16rem]">
                <AnimatedList delay={1200} className="gap-2">
                  {LIVE_STEPS.map((step) => (
                    <div
                      key={step}
                      className="w-full rounded-xl border border-border/60 bg-background/70 px-3 py-2.5 text-left text-sm shadow-sm"
                    >
                      {step}
                    </div>
                  ))}
                </AnimatedList>
              </div>
            </div>
          </BlurFade>
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
              Prefer a team-shaped path?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
              Browse solutions by role, or start free and pick a playbook inside the product.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild variant="polished">
                <Link href="/login#signup">Start with a use case</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/solutions">Browse solutions</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
