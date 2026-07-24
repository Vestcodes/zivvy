"use client";

import Link from "next/link";
import { ArrowRight, Check, Map } from "lucide-react";
import type { AlternativeDetail } from "@/lib/marketing-content";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import { AnimatedList } from "@/components/ui/animated-list";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { DotPattern } from "@/components/ui/dot-pattern";
import { MagicCard } from "@/components/ui/magic-card";
import { ShineBorder } from "@/components/ui/shine-border";
import { TextAnimate } from "@/components/ui/text-animate";
import { cn } from "@/lib/utils";

type Props = {
  sectionLabel: string;
  sectionHref: string;
  entry: AlternativeDetail;
};

export function AlternativeDetailPage({ sectionLabel, sectionHref, entry }: Props) {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://zivvy.xyz/" },
      { "@type": "ListItem", position: 2, name: sectionLabel, item: `https://zivvy.xyz${sectionHref}` },
      {
        "@type": "ListItem",
        position: 3,
        name: entry.title,
        item: `https://zivvy.xyz${sectionHref}/${entry.slug}`
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />

        <section className="relative overflow-hidden">
          <DotPattern
            className={cn(
              "pointer-events-none absolute inset-0 -z-10 text-primary/25",
              "[mask-image:radial-gradient(480px_circle_at_50%_-5%,white,transparent)]"
            )}
          />
          <div className="mx-auto max-w-5xl px-6 pb-8 pt-20 sm:pt-24">
            <BlurFade>
              <Link
                href={sectionHref}
                className="text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground"
              >
                {sectionLabel}
              </Link>
              <TextAnimate
                as="h1"
                by="word"
                animation="blurInUp"
                className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl"
              >
                {entry.title}
              </TextAnimate>
              <p className="mt-4 max-w-3xl text-lg text-muted-foreground">{entry.description}</p>
              <p className="mt-3 text-sm text-muted-foreground">
                Alternative to <span className="font-medium text-foreground">{entry.alternativeTo}</span>
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="polished" size="lg">
                  <Link href={entry.ctaHref}>
                    {entry.ctaLabel}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/pricing">Compare plans</Link>
                </Button>
              </div>
            </BlurFade>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-4 px-6 py-6 md:grid-cols-2">
          <BlurFade>
            <MagicCard
              className="relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card/70 p-6"
              gradientFrom="#34d399"
              gradientTo="#0f766e"
              gradientColor="rgba(27, 152, 114, 0.1)"
            >
              <BorderBeam size={60} duration={8} colorFrom="#34d399" colorTo="#0f766e" />
              <h2 className="font-display text-xl font-semibold">Why teams switch</h2>
              <ul className="mt-4 space-y-3">
                {entry.whySwitch.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </MagicCard>
          </BlurFade>
          <BlurFade delay={0.06}>
            <div className="relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-6">
              <ShineBorder shineColor={["#0f766e", "#34d399"]} duration={14} />
              <h2 className="font-display text-xl font-semibold">What changes with Zivvy</h2>
              <ul className="mt-4 space-y-3">
                {entry.differences.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </BlurFade>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-start">
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-tight">Migration guide</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                A practical sequence — pilot first, expand when owners trust the path.
              </p>
              <ol className="mt-6 space-y-3">
                {entry.migrationSteps.map((step, index) => (
                  <BlurFade key={step} delay={0.03 + index * 0.03}>
                    <li className="relative overflow-hidden rounded-xl border border-border/60 bg-card/50 p-4">
                      {index === 0 ? (
                        <BorderBeam size={45} duration={6} colorFrom="#34d399" colorTo="#0f766e" />
                      ) : null}
                      <p className="font-mono text-xs text-muted-foreground">
                        Step {String(index + 1).padStart(2, "0")}
                      </p>
                      <p className="mt-2 text-sm text-foreground/90">{step}</p>
                    </li>
                  </BlurFade>
                ))}
              </ol>
            </div>
            <BlurFade delay={0.1}>
              <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-5">
                <ShineBorder shineColor={["#34d399", "#0f766e"]} duration={16} />
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Rollout stream
                </p>
                <div className="mt-4 min-h-[12rem]">
                  <AnimatedList delay={1400} className="gap-2">
                    {entry.migrationSteps.map((step) => (
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
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 pb-20 pt-2 text-center">
          <BlurFade>
            <div className="relative mb-6 overflow-hidden rounded-xl border border-border/70 bg-card/60 px-4 py-4 text-sm text-muted-foreground">
              <ShineBorder shineColor={["#34d399", "#0f766e"]} duration={18} />
              <Map className="mr-2 inline size-4 text-primary" />
              Suggested pattern: pilot one unit, validate outcomes, then expand in controlled phases.
            </div>
            <h2 className="font-display text-3xl font-semibold tracking-tight">
              Need a guided migration plan?
            </h2>
            <p className="mt-3 text-muted-foreground">
              We can help scope data mapping, rollout sequence, and adoption checkpoints.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild variant="polished" size="lg">
                <Link href="/contact">Talk to migration team</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/product-tour">View product tour</Link>
              </Button>
            </div>
          </BlurFade>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
