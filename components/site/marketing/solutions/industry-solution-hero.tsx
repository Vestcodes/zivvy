"use client";

import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Cloud,
  Factory,
  ShoppingBag,
  Truck,
  type LucideIcon
} from "lucide-react";
import type { IndustrySolutionProfile } from "@/lib/solutions-content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { ShineBorder } from "@/components/ui/shine-border";
import { Spotlight } from "@/components/ui/spotlight";
import { TextAnimate } from "@/components/ui/text-animate";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { NumberTicker } from "@/components/ui/number-ticker";
import { cn } from "@/lib/utils";

// Map industry slug -> lucide icon. Everything else falls back to Factory.
const INDUSTRY_ICON: Record<string, LucideIcon> = {
  manufacturing: Factory,
  distribution: Truck,
  "professional-services": Briefcase,
  saas: Cloud,
  retail: ShoppingBag
};

type Props = {
  profile: IndustrySolutionProfile;
};

export function IndustrySolutionHero({ profile }: Props) {
  const Icon = INDUSTRY_ICON[profile.slug] ?? Factory;

  return (
    <>
      {/* ------------------------------------------------------------------
       * Hero — single-column, centered, big icon
       * ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden">
        <AnimatedGridPattern
          numSquares={24}
          maxOpacity={0.08}
          className={cn(
            "pointer-events-none absolute inset-0 -z-10 fill-primary/10 stroke-primary/15",
            "[mask-image:radial-gradient(560px_circle_at_50%_0%,white,transparent)]"
          )}
        />
        <Spotlight
          className="-top-40 left-1/2 -translate-x-1/2 md:-top-20"
          fill="rgba(52, 211, 153, 0.25)"
        />

        <div className="mx-auto max-w-4xl px-6 pb-10 pt-20 text-center sm:pt-24">
          <BlurFade>
            <div className="mx-auto flex flex-col items-center gap-5">
              {/* Gradient-bordered icon tile */}
              <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 p-4">
                <ShineBorder shineColor={["#34d399", "#0f766e", "#34d399"]} duration={10} />
                <Icon className="size-14 text-primary" aria-hidden />
              </div>

              <Link
                href="/solutions"
                className="text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground"
              >
                Industry · {profile.industryVertical}
              </Link>

              <TextAnimate
                as="h1"
                by="word"
                animation="blurInUp"
                className="font-display text-4xl font-bold tracking-tight sm:text-5xl"
              >
                {profile.title}
              </TextAnimate>

              <p className="max-w-2xl text-lg text-muted-foreground">
                {profile.description}
              </p>

              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="polished" size="lg">
                  <Link href={profile.ctaHref}>
                    {profile.ctaLabel}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/product-tour">See product tour</Link>
                </Button>
              </div>
            </div>
          </BlurFade>

          {/* Pain-point chip row + sweet-spot */}
          <BlurFade delay={0.1}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {profile.painPoints.map((pain) => (
                <span
                  key={pain}
                  className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/8 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-300"
                >
                  <span aria-hidden className="size-1.5 rounded-full bg-amber-500/70" />
                  {pain}
                </span>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <Badge variant="outline" className="bg-background/70 text-[11px] backdrop-blur">
                {profile.sizeSweetSpot}
              </Badge>
              {profile.regulatoryContext ? (
                <Badge variant="outline" className="bg-background/70 text-[11px] backdrop-blur">
                  Regulatory · {profile.regulatoryContext}
                </Badge>
              ) : null}
              {profile.acvBand ? (
                <Badge variant="secondary" className="text-[11px]">
                  {profile.acvBand}
                </Badge>
              ) : null}
            </div>
          </BlurFade>
        </div>
      </section>

      {/* ------------------------------------------------------------------
       * Key modules — bento
       * ------------------------------------------------------------------ */}
      {profile.keyModules.length ? (
        <section className="mx-auto max-w-6xl px-6 py-10">
          <BlurFade>
            <div className="mb-6 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Modules
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                Modules built for this
              </h2>
            </div>
          </BlurFade>
          <BentoGrid className="auto-rows-[13rem] lg:auto-rows-[14rem]">
            {profile.keyModules.map((module, idx) => (
              <BentoCard
                key={`${module.slug}-${idx}`}
                name={module.title}
                Icon={Icon}
                description={module.blurb}
                href={`/features/${module.slug}`}
                cta="Open module"
                className={cn(
                  "col-span-3",
                  idx % 3 === 0 ? "lg:col-span-2" : "lg:col-span-1"
                )}
                background={
                  <>
                    {idx === 0 ? (
                      <div className="absolute inset-0 opacity-70">
                        <AnimatedGridPattern
                          numSquares={16}
                          maxOpacity={0.1}
                          className="absolute inset-0 fill-primary/10 stroke-primary/20 [mask-image:radial-gradient(300px_circle_at_20%_0%,white,transparent)]"
                        />
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-muted/20" />
                    )}
                    {idx === 0 ? (
                      <BorderBeam size={80} duration={9} colorFrom="#34d399" colorTo="#0f766e" />
                    ) : null}
                  </>
                }
              />
            ))}
          </BentoGrid>
        </section>
      ) : null}

      {/* ------------------------------------------------------------------
       * Replaces + Dashboards
       * ------------------------------------------------------------------ */}
      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-10 md:grid-cols-2">
        {profile.incumbents?.length ? (
          <BlurFade>
            <div className="rounded-2xl border border-border/70 bg-card/60 p-6">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Retires
              </p>
              <h3 className="mt-2 font-display text-lg font-semibold">
                What Zivvy typically replaces
              </h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {profile.incumbents.map((tool) => (
                  <li key={tool}>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground line-through decoration-muted-foreground/60">
                      {tool}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </BlurFade>
        ) : null}

        {profile.namedDashboards?.length ? (
          <BlurFade delay={0.08}>
            <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 p-6">
              <ShineBorder shineColor={["#0f766e", "#34d399"]} duration={16} />
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Day-one dashboards
              </p>
              <h3 className="mt-2 font-display text-lg font-semibold">
                Dashboards you get on day one
              </h3>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {profile.namedDashboards.map((name, idx) => (
                  <div
                    key={name}
                    className="rounded-xl border border-border/50 bg-background/50 px-3 py-3"
                  >
                    <p className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                      {String(idx + 1).padStart(2, "0")}
                    </p>
                    <p className="mt-1 text-sm font-medium">{name}</p>
                  </div>
                ))}
              </div>
            </div>
          </BlurFade>
        ) : null}
      </section>

      {/* Small stat row echoing the hub style — kept minimal for balance */}
      {profile.proofPoint ? (
        <section className="mx-auto max-w-6xl px-6 pb-4">
          <BlurFade>
            <div className="rounded-2xl border border-border/70 bg-card/50 px-6 py-6 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {profile.proofPoint.label}
              </p>
              <p className="mt-2 font-display text-3xl font-semibold tracking-tight">
                <NumberTicker value={parseInt(profile.proofPoint.value.replace(/[^0-9]/g, ""), 10) || 0} />
                <span className="ml-1 text-primary">
                  {profile.proofPoint.value.replace(/[0-9,]/g, "").trim()}
                </span>
              </p>
            </div>
          </BlurFade>
        </section>
      ) : null}
    </>
  );
}
