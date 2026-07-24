"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, FileText, Mic2, Newspaper, ScrollText, Shapes } from "lucide-react";
import { resourceCollections } from "@/lib/marketing-content";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { BlurFade } from "@/components/ui/blur-fade";
import { MagicCard } from "@/components/ui/magic-card";
import { Marquee } from "@/components/ui/marquee";
import { RetroGrid } from "@/components/ui/retro-grid";
import { ShineBorder } from "@/components/ui/shine-border";
import { TextAnimate } from "@/components/ui/text-animate";

const SECTION_ICONS = [BookOpen, Shapes, Newspaper, Mic2, ScrollText, FileText];

const SECTIONS: { id: string; title: string; body: string }[] = [
  {
    id: "guides",
    title: "Guides",
    body: "Step-by-step guides for lead-to-cash, month-close, onboarding, and inventory operations."
  },
  {
    id: "templates",
    title: "Templates",
    body: "Practical templates for CRM workflows, budget planning, onboarding checklists, and campaign planning."
  },
  {
    id: "case-studies",
    title: "Case studies",
    body: "Implementation stories with rollout notes and lessons learned — no invented vanity metrics."
  },
  {
    id: "webinars",
    title: "Webinars",
    body: "Recorded product tours, feature launch sessions, and operator deep dives with transcripts."
  },
  {
    id: "glossary",
    title: "Glossary",
    body: "Definitions for core operations, finance, and workflow terms to support faster team alignment."
  },
  {
    id: "reports",
    title: "Research reports",
    body: "Benchmark snapshots and execution insights for teams planning their next operating milestone."
  }
];

const TOPICS = [
  "Lead-to-cash",
  "Month-close",
  "Inventory",
  "Onboarding",
  "Approvals",
  "Migrations",
  "API patterns"
];

export function ResourcesPageContent() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <RetroGrid className="opacity-30" />
          <div className="relative mx-auto max-w-4xl px-6 pb-8 pt-20 text-center sm:pt-24">
            <BlurFade>
              <div className="mb-5 inline-flex items-center justify-center rounded-full border border-border/60 bg-background/70 px-3 py-1 backdrop-blur">
                <AnimatedShinyText className="text-xs font-medium text-muted-foreground">
                  Resources · guides · templates · playbooks
                </AnimatedShinyText>
              </div>
              <TextAnimate
                as="h1"
                by="word"
                animation="blurInUp"
                className="font-display text-4xl font-bold tracking-tight sm:text-5xl"
              >
                Resource center
              </TextAnimate>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Practical content for teams evaluating, deploying, and scaling Zivvy — written for
                operators, not slide decks.
              </p>
            </BlurFade>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {resourceCollections.map((collection, index) => {
              const Icon = SECTION_ICONS[index % SECTION_ICONS.length];
              return (
                <BlurFade key={collection.title} delay={0.03 + index * 0.03}>
                  <Link href={collection.href} className="group block h-full">
                    <MagicCard
                      className="h-full rounded-2xl border border-border/70 bg-card/70 p-5"
                      gradientFrom="#34d399"
                      gradientTo="#0f766e"
                      gradientColor="rgba(27, 152, 114, 0.1)"
                    >
                      <Icon className="size-5 text-primary" />
                      <h2 className="mt-3 font-display text-xl font-semibold group-hover:text-primary">
                        {collection.title}
                      </h2>
                      <p className="mt-2 text-sm text-muted-foreground">{collection.description}</p>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                        Explore
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </MagicCard>
                  </Link>
                </BlurFade>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-6">
          <div className="relative overflow-hidden rounded-xl border border-border/60 bg-card/40 py-2">
            <Marquee pauseOnHover className="[--duration:28s]">
              {TOPICS.map((topic) => (
                <div
                  key={topic}
                  className="mx-2 rounded-lg border border-border/70 bg-background/80 px-4 py-2 text-sm font-medium shadow-sm"
                >
                  {topic}
                </div>
              ))}
            </Marquee>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-14 bg-gradient-to-r from-background to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-background to-transparent" />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-8 sm:py-12">
          <div className="grid gap-4 md:grid-cols-2">
            {SECTIONS.map((section, index) => (
              <BlurFade key={section.id} delay={0.03 + index * 0.03}>
                <div
                  id={section.id}
                  className="scroll-mt-24 rounded-2xl border border-border/70 bg-card/60 p-6"
                >
                  <h2 className="font-display text-2xl font-semibold">{section.title}</h2>
                  <p className="mt-3 text-sm text-muted-foreground">{section.body}</p>
                </div>
              </BlurFade>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-20 pt-4 text-center">
          <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 px-6 py-8">
            <ShineBorder shineColor={["#34d399", "#0f766e"]} duration={14} />
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Need help applying this to your team?
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Tell us your workflow and we&apos;ll suggest the fastest rollout path.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild variant="polished">
                <Link href="/contact">Talk to us</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/blog">Read the blog</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
