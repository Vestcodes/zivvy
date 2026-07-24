"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { AnimatedList } from "@/components/ui/animated-list";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { DotPattern } from "@/components/ui/dot-pattern";
import { MagicCard } from "@/components/ui/magic-card";
import { Marquee } from "@/components/ui/marquee";
import { ShineBorder } from "@/components/ui/shine-border";
import { TextAnimate } from "@/components/ui/text-animate";
import { cn } from "@/lib/utils";

const POSTS = [
  {
    title: "How to move from spreadsheet ops to structured workflows",
    category: "Tutorial",
    summary: "A practical rollout plan for replacing manual trackers without breaking daily execution.",
    href: "/resources#guides"
  },
  {
    title: "What high-performing finance and ops teams review every week",
    category: "Best practices",
    summary: "A repeatable review ritual that improves cash control, delivery speed, and accountability.",
    href: "/resources#reports"
  },
  {
    title: "Inside a 30-day migration from fragmented tools to one operating stack",
    category: "Customer story",
    summary: "How a growing team unified CRM, billing, and operations without disrupting revenue workflows.",
    href: "/resources#case-studies"
  },
  {
    title: "Seat-based pricing that matches how teams actually grow",
    category: "Product",
    summary: "Why Free / Pro / Business maps to modules you turn on — not SKUs you regret buying.",
    href: "/pricing"
  }
];

const CATEGORIES = [
  "Tutorials",
  "Industry insights",
  "Product updates",
  "Customer success",
  "Case studies",
  "Best practices"
];

const HEADLINES = POSTS.map((p) => p.title);

export function BlogPageContent() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <DotPattern
            className={cn(
              "pointer-events-none absolute inset-0 -z-10 text-primary/25",
              "[mask-image:radial-gradient(480px_circle_at_40%_-5%,white,transparent)]"
            )}
          />
          <div className="relative mx-auto max-w-4xl px-6 pb-8 pt-20 text-center sm:pt-24">
            <BlurFade>
              <div className="mb-5 inline-flex items-center justify-center rounded-full border border-border/60 bg-background/70 px-3 py-1 backdrop-blur">
                <AnimatedShinyText className="text-xs font-medium text-muted-foreground">
                  Blog · operators · practical writing
                </AnimatedShinyText>
              </div>
              <TextAnimate
                as="h1"
                by="word"
                animation="blurInUp"
                className="font-display text-4xl font-bold tracking-tight sm:text-5xl"
              >
                Notes for people who run the work
              </TextAnimate>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Tutorials, product updates, and operating practice — no fake star ratings or invented
                customer counts.
              </p>
            </BlurFade>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-4">
          <div className="relative mb-8 overflow-hidden rounded-xl border border-border/60 bg-card/40 py-2">
            <Marquee pauseOnHover className="[--duration:32s]">
              {CATEGORIES.map((cat) => (
                <div
                  key={cat}
                  className="mx-2 rounded-full border border-border/70 bg-background/80 px-4 py-1.5 text-sm font-medium"
                >
                  {cat}
                </div>
              ))}
            </Marquee>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-14 bg-gradient-to-r from-background to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-background to-transparent" />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="grid gap-4">
              {POSTS.map((post, index) => (
                <BlurFade key={post.title} delay={0.04 + index * 0.04}>
                  <Link href={post.href} className="group block">
                    <MagicCard
                      className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 p-5"
                      gradientFrom="#34d399"
                      gradientTo="#0f766e"
                      gradientColor="rgba(27, 152, 114, 0.08)"
                    >
                      {index === 0 ? (
                        <BorderBeam size={70} duration={8} colorFrom="#34d399" colorTo="#0f766e" />
                      ) : null}
                      <p className="text-xs font-medium uppercase tracking-wide text-primary">
                        {post.category}
                      </p>
                      <h2 className="mt-2 font-display text-xl font-semibold group-hover:text-primary">
                        {post.title}
                      </h2>
                      <p className="mt-2 text-sm text-muted-foreground">{post.summary}</p>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                        Read
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </MagicCard>
                  </Link>
                </BlurFade>
              ))}
            </div>

            <BlurFade delay={0.1}>
              <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-5 lg:sticky lg:top-24">
                <ShineBorder shineColor={["#34d399", "#0f766e"]} duration={16} />
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Latest headlines
                </p>
                <div className="mt-4 min-h-[14rem]">
                  <AnimatedList delay={1600} className="gap-2">
                    {HEADLINES.map((title) => (
                      <div
                        key={title}
                        className="w-full rounded-xl border border-border/60 bg-background/70 px-3 py-2.5 text-left text-sm shadow-sm"
                      >
                        {title}
                      </div>
                    ))}
                  </AnimatedList>
                </div>
                <Link
                  href="/resources"
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary"
                >
                  Browse resource center
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </BlurFade>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-20 pt-10 text-center">
          <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 px-6 py-8">
            <ShineBorder shineColor={["#34d399", "#0f766e"]} duration={14} />
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Prefer a guided tour?
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Watch the product tour, or start free and learn inside the workspace.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/product-tour"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground"
              >
                Product tour
              </Link>
              <Link
                href="/login#signup"
                className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-5 text-sm font-medium"
              >
                Start free
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
