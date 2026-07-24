"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import type { MarketingDetail } from "@/lib/marketing-content";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { AnimatedList } from "@/components/ui/animated-list";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { MagicCard } from "@/components/ui/magic-card";
import { NumberTicker } from "@/components/ui/number-ticker";
import { ShineBorder } from "@/components/ui/shine-border";
import { TextAnimate } from "@/components/ui/text-animate";
import { cn } from "@/lib/utils";

type Props = {
  entry: MarketingDetail;
};

export function SolutionsDetailPage({ entry }: Props) {
  const canonicalPath = `/solutions/${entry.slug}`;
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entry.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a }
    }))
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://zivvy.xyz/" },
      { "@type": "ListItem", position: 2, name: "Solutions", item: "https://zivvy.xyz/solutions" },
      {
        "@type": "ListItem",
        position: 3,
        name: entry.title,
        item: `https://zivvy.xyz${canonicalPath}`
      }
    ]
  };

  return (
    <>
      <SiteHeader />
      <main>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />

        <section className="relative overflow-hidden">
          <AnimatedGridPattern
            numSquares={28}
            maxOpacity={0.1}
            className={cn(
              "pointer-events-none absolute inset-0 -z-10 fill-primary/10 stroke-primary/15",
              "[mask-image:radial-gradient(520px_circle_at_15%_0%,white,transparent)]"
            )}
          />
          <div className="mx-auto max-w-3xl px-6 pb-10 pt-20 sm:pt-24">
            <BlurFade>
              <Link
                href="/solutions"
                className="text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground"
              >
                Solutions
              </Link>
              <TextAnimate
                as="h1"
                by="word"
                animation="blurInUp"
                className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl"
              >
                {entry.title}
              </TextAnimate>
              <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{entry.description}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="polished" size="lg">
                  <Link href={entry.ctaHref}>
                    {entry.ctaLabel}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/product-tour">See product tour</Link>
                </Button>
              </div>
            </BlurFade>
          </div>
        </section>

        <section className="mx-auto grid max-w-5xl gap-6 px-6 py-6 md:grid-cols-2">
          <BlurFade>
            <div className="relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-6">
              <ShineBorder shineColor={["#34d399", "#0f766e", "#34d399"]} duration={12} />
              <h2 className="font-display text-xl font-semibold">The snag</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{entry.problem}</p>
            </div>
          </BlurFade>
          <BlurFade delay={0.08}>
            <div className="relative h-full overflow-hidden rounded-2xl">
              <MagicCard
                className="h-full rounded-2xl border border-border/70 bg-card/70 p-6"
                gradientFrom="#34d399"
                gradientTo="#0f766e"
                gradientColor="rgba(27, 152, 114, 0.1)"
              >
                <BorderBeam size={70} duration={7} colorFrom="#34d399" colorTo="#0f766e" />
                <h2 className="font-display text-xl font-semibold">How Zivvy helps</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{entry.solution}</p>
              </MagicCard>
            </div>
          </BlurFade>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                What you get
              </h2>
              <ul className="mt-6 space-y-3">
                {entry.benefits.map((benefit, idx) => (
                  <BlurFade key={benefit} delay={0.03 + idx * 0.03}>
                    <li className="flex items-start gap-3 rounded-xl border border-border/50 bg-background/40 px-4 py-3">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span className="text-sm text-muted-foreground">{benefit}</span>
                    </li>
                  </BlurFade>
                ))}
              </ul>
            </div>
            <BlurFade delay={0.1}>
              <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-5">
                <ShineBorder shineColor={["#0f766e", "#34d399"]} duration={16} />
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Live capability stream
                </p>
                <div className="mt-4 min-h-[11rem]">
                  <AnimatedList delay={1400} className="gap-2">
                    {entry.useCases.map((useCase) => (
                      <div
                        key={useCase}
                        className="w-full rounded-xl border border-border/60 bg-background/70 px-3 py-2.5 text-left text-sm text-foreground/90 shadow-sm"
                      >
                        {useCase}
                      </div>
                    ))}
                  </AnimatedList>
                </div>
              </div>
            </BlurFade>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-6">
          <h2 className="font-display text-2xl font-semibold tracking-tight">Common uses</h2>
          <ol className="mt-6 grid gap-3 sm:grid-cols-3">
            {entry.useCases.slice(0, 3).map((useCase, idx) => (
              <BlurFade key={useCase} delay={0.04 + idx * 0.04}>
                <li className="relative h-full overflow-hidden rounded-xl border border-border/60 bg-card/50 p-4">
                  {idx === 0 ? (
                    <BorderBeam size={50} duration={6} colorFrom="#34d399" colorTo="#0f766e" />
                  ) : null}
                  <p className="font-mono text-xs text-muted-foreground">
                    {String(idx + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-2 text-sm text-foreground/90">{useCase}</p>
                </li>
              </BlurFade>
            ))}
          </ol>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-8">
          <BlurFade>
            <div className="grid gap-3 rounded-2xl border border-border/70 bg-card/50 p-5 sm:grid-cols-3 sm:p-6">
              <div className="rounded-xl border border-border/50 bg-background/50 px-4 py-4 text-center">
                <p className="font-display text-3xl font-semibold tracking-tight">
                  <NumberTicker value={2} />
                </p>
                <p className="mt-1 text-xs text-muted-foreground">free seats forever</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-background/50 px-4 py-4 text-center">
                <p className="font-display text-3xl font-semibold tracking-tight">
                  <NumberTicker value={0} />
                </p>
                <p className="mt-1 text-xs text-muted-foreground">card required to start</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-background/50 px-4 py-4 text-center">
                <p className="font-display text-3xl font-semibold tracking-tight">1</p>
                <p className="mt-1 text-xs text-muted-foreground">workspace to run ops</p>
              </div>
            </div>
          </BlurFade>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-10">
          <h2 className="text-center font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Questions
          </h2>
          <Accordion
            type="single"
            collapsible
            className="mt-8 rounded-xl border border-border/70 bg-card/60 px-2"
          >
            {entry.faqs.map((faq) => (
              <AccordionItem key={faq.q} value={faq.q} className="border-border/60 last:border-b-0">
                <AccordionTrigger className="px-4 text-left text-sm font-medium">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="px-4 text-sm text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-20 pt-4 text-center">
          <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 px-6 py-8">
            <ShineBorder shineColor={["#34d399", "#0f766e"]} duration={14} />
            <h2 className="font-display text-3xl font-semibold tracking-tight">Ready to try it?</h2>
            <p className="mt-3 text-muted-foreground">Free plan. Two seats. No card.</p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild variant="polished" size="lg">
                <Link href={entry.ctaHref}>{entry.ctaLabel}</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/pricing">See pricing</Link>
              </Button>
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
              <Link href="/solutions" className="hover:text-foreground">
                More solutions
              </Link>
              <span>·</span>
              <Link href="/compare" className="hover:text-foreground">
                Compare
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
