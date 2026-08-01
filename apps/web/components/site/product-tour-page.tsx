"use client";

import Link from "next/link";
import { ArrowRight, Clapperboard, ExternalLink, Play } from "lucide-react";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/blur-fade";
import { MagicCard } from "@/components/ui/magic-card";
import { DotPattern } from "@/components/ui/dot-pattern";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Badge } from "@/components/ui/badge";
import { ProductTourVideo } from "@/components/site/product-tour-video";
import { HeroVideoDialog } from "@/components/ui/hero-video-dialog";
import { BorderBeam } from "@/components/ui/border-beam";
import {
  heroArcadeTour,
  moduleArcadeTours,
  type ArcadeTour
} from "@/lib/arcade-tours";
import { cn } from "@/lib/utils";

function TourPlayer({ tour, showBeam = false, priority = false }: { tour: ArcadeTour; showBeam?: boolean; priority?: boolean }) {
  const embed = tour.arcadeEmbedUrl || tour.arcadeViewUrl;
  if (embed) {
    return (
      <div className="relative overflow-hidden rounded-xl">
        <HeroVideoDialog
          animationStyle="top-in-bottom-out"
          videoSrc={embed}
          thumbnailSrc={tour.thumbnailSrc}
          thumbnailAlt={`${tour.title} — Zivvy product tour`}
          priority={priority}
        />
        {showBeam ? (
          <BorderBeam
            size={140}
            duration={9}
            colorFrom="#34d399"
            colorTo="#0f766e"
            borderWidth={1.5}
          />
        ) : null}
      </div>
    );
  }
  if (tour.isHero) {
    return <ProductTourVideo showBeam={showBeam} animationStyle="top-in-bottom-out" priority={priority} />;
  }
  return null;
}

function ModuleCard({ tour, index }: { tour: ArcadeTour; index: number }) {
  const hasArcade = Boolean(tour.arcadeEmbedUrl || tour.arcadeViewUrl);
  return (
    <BlurFade delay={0.04 + index * 0.04}>
      <li id={tour.anchor} className="scroll-mt-24">
        <MagicCard
          className="flex h-full flex-col rounded-xl border border-border/70 bg-card/70 p-5"
          gradientFrom="#34d399"
          gradientTo="#0f766e"
          gradientColor="rgba(27, 152, 114, 0.1)"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg border border-border/70 bg-background/70">
              <Clapperboard className="size-4 text-primary" />
            </div>
            {tour.chapterTime ? (
              <Badge variant="outline" className="font-mono text-[10px]">
                {tour.chapterTime}
              </Badge>
            ) : null}
          </div>
          <h2 className="mt-3 font-display text-lg font-semibold">{tour.title}</h2>
          <p className="mt-2 flex-1 text-sm text-muted-foreground">{tour.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {hasArcade ? (
              <Button asChild size="sm" variant="polished">
                <a
                  href={tour.arcadeViewUrl || tour.arcadeEmbedUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                >
                  Watch Arcade
                  <ExternalLink className="size-3.5" />
                </a>
              </Button>
            ) : (
              <Button asChild size="sm" variant="polished">
                <a href="#full-tour">
                  <Play className="size-3.5" />
                  See in full tour
                </a>
              </Button>
            )}
            <Button asChild size="sm" variant="outline">
              <Link href={tour.fallbackHref}>
                {tour.fallbackLabel}
                <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </div>
        </MagicCard>
      </li>
    </BlurFade>
  );
}

export function ProductTourPageContent() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <DotPattern
            className={cn(
              "pointer-events-none absolute inset-0 -z-10 text-primary/30",
              "[mask-image:radial-gradient(420px_circle_at_50%_0%,white,transparent)]"
            )}
          />
          <div className="mx-auto max-w-3xl px-6 pb-6 pt-20 text-center sm:pt-24">
            <BlurFade>
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Product tours
              </p>
              <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
                See Zivvy in motion
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
                Full Business-tier walkthrough, plus module tours for CRM, stock, books, people,
                manufacturing, banking, and integrations.
              </p>
            </BlurFade>
          </div>
        </section>

        <section id="full-tour" className="mx-auto max-w-5xl scroll-mt-24 px-6 py-2">
          <BlurFade delay={0.08}>
            <TourPlayer tour={heroArcadeTour} showBeam priority />
          </BlurFade>
          {!heroArcadeTour.arcadeEmbedUrl && !heroArcadeTour.arcadeViewUrl ? (
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Playing the self-hosted product tour. Interactive walkthroughs coming soon.
            </p>
          ) : null}
        </section>

        <section className="mx-auto max-w-5xl px-6 py-12">
          <BlurFade>
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-display text-2xl font-semibold tracking-tight">
                  Module tours
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Jump to a workflow. Each card deep-links the full tour chapter and a focused
                  guide page.
                </p>
              </div>
              <Link
                href="/integrations"
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Browse integrations
              </Link>
            </div>
          </BlurFade>
          <ol className="grid gap-3 sm:grid-cols-2">
            {moduleArcadeTours.map((tour, index) => (
              <ModuleCard key={tour.id} tour={tour} index={index} />
            ))}
          </ol>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-20 pt-4 text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight">
            Try the same flow yourself
          </h2>
          <p className="mt-3 text-muted-foreground">Free plan. Two seats. No card.</p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/login#signup" className="inline-flex">
              <ShimmerButton
                className="h-12 px-7 text-base"
                background="linear-gradient(180deg, color-mix(in oklab, var(--primary) 88%, white), var(--primary))"
                shimmerColor="#ecfdf5"
                borderRadius="0.75rem"
              >
                <span className="inline-flex items-center gap-2">
                  Start free
                  <ArrowRight className="size-4" />
                </span>
              </ShimmerButton>
            </Link>
            <Button asChild variant="outline" size="lg" className="h-12 px-6">
              <Link href="/contact">Talk to us</Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
