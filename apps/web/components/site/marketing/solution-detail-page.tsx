"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import type { SolutionProfile } from "@/lib/solutions-content";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { CountrySolutionHero } from "@/components/site/marketing/solutions/country-solution-hero";
import { IndustrySolutionHero } from "@/components/site/marketing/solutions/industry-solution-hero";
import { TeamSolutionHero } from "@/components/site/marketing/solutions/team-solution-hero";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { MagicCard } from "@/components/ui/magic-card";
import { ShineBorder } from "@/components/ui/shine-border";
import { AnimatedList } from "@/components/ui/animated-list";

type Props = {
  profile: SolutionProfile;
};

function SolutionHero({ profile }: Props) {
  switch (profile.type) {
    case "country":
      return <CountrySolutionHero profile={profile} />;
    case "industry":
      return <IndustrySolutionHero profile={profile} />;
    case "team":
      return <TeamSolutionHero profile={profile} />;
    default:
      // Exhaustiveness — TS ensures this is unreachable.
      return null;
  }
}

export function SolutionDetailPage({ profile }: Props) {
  const canonicalPath = `/solutions/${profile.slug}`;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: profile.faqs.map((faq) => ({
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
        name: profile.title,
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

        {/* Variant-aware hero + variant-specific metadata block */}
        <SolutionHero profile={profile} />

        {/* --------------------------------------------------------------
         * Shared body — problem / solution
         * -------------------------------------------------------------- */}
        <section className="mx-auto grid max-w-5xl gap-6 px-6 py-10 md:grid-cols-2">
          <BlurFade>
            <div className="relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-6">
              <ShineBorder shineColor={["#34d399", "#0f766e", "#34d399"]} duration={12} />
              <h2 className="font-display text-xl font-semibold">The snag</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {profile.problem}
              </p>
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
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {profile.solution}
                </p>
              </MagicCard>
            </div>
          </BlurFade>
        </section>

        {/* --------------------------------------------------------------
         * What you get + Common uses
         * -------------------------------------------------------------- */}
        <section className="mx-auto max-w-5xl px-6 py-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                What you get
              </h2>
              <ul className="mt-6 space-y-3">
                {profile.benefits.map((benefit, idx) => (
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
                  You&apos;ll use this for
                </p>
                <div className="mt-4 min-h-[13rem]">
                  <AnimatedList delay={1400} className="gap-2">
                    {profile.useCases.map((useCase) => (
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

        {/* --------------------------------------------------------------
         * FAQs
         * -------------------------------------------------------------- */}
        <section className="mx-auto max-w-3xl px-6 py-10">
          <h2 className="text-center font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            Questions
          </h2>
          <Accordion
            type="single"
            collapsible
            className="mt-8 rounded-xl border border-border/70 bg-card/60 px-2"
          >
            {profile.faqs.map((faq) => (
              <AccordionItem
                key={faq.q}
                value={faq.q}
                className="border-border/60 last:border-b-0"
              >
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

        {/* --------------------------------------------------------------
         * Closing CTA
         * -------------------------------------------------------------- */}
        <section className="mx-auto max-w-3xl px-6 pb-20 pt-4 text-center">
          <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 px-6 py-8">
            <ShineBorder shineColor={["#34d399", "#0f766e"]} duration={14} />
            <h2 className="font-display text-3xl font-semibold tracking-tight">
              Ready to try it?
            </h2>
            <p className="mt-3 text-muted-foreground">Free plan. Two seats. No card.</p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild variant="polished" size="lg">
                <Link href={profile.ctaHref}>
                  {profile.ctaLabel}
                  <ArrowRight className="size-4" />
                </Link>
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
              {profile.relatedSolutions?.length ? (
                <>
                  <span>·</span>
                  <span>Related:</span>
                  {profile.relatedSolutions.slice(0, 3).map((rel) => (
                    <Link
                      key={rel}
                      href={`/solutions/${rel}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {rel.replace(/-/g, " ")}
                    </Link>
                  ))}
                </>
              ) : null}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
