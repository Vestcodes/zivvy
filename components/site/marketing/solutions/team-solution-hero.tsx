"use client";

import Link from "next/link";
import { ArrowRight, Target, Users } from "lucide-react";
import type { TeamSolutionProfile } from "@/lib/solutions-content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { AnimatedList } from "@/components/ui/animated-list";
import { MagicCard } from "@/components/ui/magic-card";
import { Spotlight } from "@/components/ui/spotlight";
import { TextAnimate } from "@/components/ui/text-animate";
import { cn } from "@/lib/utils";

type Tier = "Free" | "Pro" | "Business";

const TIER_BADGE: Record<Tier, string> = {
  Free: "bg-muted text-foreground border-transparent",
  Pro: "bg-primary-gradient text-primary-foreground border-transparent",
  Business: "bg-foreground text-background border-transparent"
};

const SENIORITY_LABEL: Record<TeamSolutionProfile["seniority"], string> = {
  ic: "IC",
  manager: "Manager",
  lead: "Lead",
  director: "Director",
  exec: "Executive",
  founder: "Founder"
};

type Props = {
  profile: TeamSolutionProfile;
};

function roleInitials(role: string): string {
  const words = role.replace(/[^A-Za-z\s]/g, "").split(/\s+/).filter(Boolean);
  if (words.length === 0) return "ZV";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

export function TeamSolutionHero({ profile }: Props) {
  const initials = roleInitials(profile.role);

  return (
    <>
      {/* ------------------------------------------------------------------
       * Hero — persona-forward
       * ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden">
        <Spotlight
          className="-top-40 left-0 md:-top-20 md:left-40"
          fill="rgba(52, 211, 153, 0.28)"
        />

        <div className="mx-auto max-w-5xl px-6 pb-8 pt-20 sm:pt-24">
          <BlurFade>
            <Link
              href="/solutions"
              className="text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground"
            >
              Solutions · For teams
            </Link>
            <TextAnimate
              as="h1"
              by="word"
              animation="blurInUp"
              className="mt-4 max-w-3xl font-display text-4xl font-bold tracking-tight sm:text-5xl"
            >
              {profile.title}
            </TextAnimate>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              {profile.description}
            </p>
          </BlurFade>

          {/* Persona card */}
          <BlurFade delay={0.1}>
            <div className="relative mt-10">
              <MagicCard
                className="rounded-3xl border border-border/70 bg-card/70 p-6 sm:p-8"
                gradientFrom="#34d399"
                gradientTo="#0f766e"
                gradientColor="rgba(27, 152, 114, 0.1)"
              >
                <BorderBeam size={90} duration={11} colorFrom="#34d399" colorTo="#0f766e" />

                {/* Minimum tier badge (top-right of the card) */}
                {profile.minimumTier ? (
                  <Badge
                    className={cn(
                      "absolute right-4 top-4 z-10 text-[10px]",
                      TIER_BADGE[profile.minimumTier]
                    )}
                  >
                    {profile.minimumTier}
                  </Badge>
                ) : null}

                <div className="grid gap-6 lg:grid-cols-[auto_1fr] lg:items-start">
                  {/* Left — avatar + identity */}
                  <div className="flex flex-col items-start gap-4">
                    <div
                      className="flex size-24 items-center justify-center rounded-2xl font-display text-2xl font-semibold text-primary-foreground shadow-md"
                      style={{
                        background:
                          "linear-gradient(135deg, color-mix(in oklab, var(--primary) 88%, black), color-mix(in oklab, var(--primary) 60%, black))"
                      }}
                      aria-hidden
                    >
                      {initials}
                    </div>
                    <div>
                      <p className="font-display text-xl font-semibold tracking-tight">
                        {profile.role}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="text-[11px]">
                          {SENIORITY_LABEL[profile.seniority]}
                        </Badge>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                          <Users className="size-3" />
                          {profile.teamSize}
                        </span>
                      </div>
                    </div>

                    <div className="mt-1 flex flex-col gap-3 sm:flex-row">
                      <Button asChild variant="polished" size="lg">
                        <Link href={profile.ctaHref}>
                          {profile.ctaLabel}
                          <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="lg">
                        <Link href="/contact">Talk to sales</Link>
                      </Button>
                    </div>
                  </div>

                  {/* Right — day-in-the-life animated list */}
                  {profile.dailyRituals?.length ? (
                    <div className="rounded-2xl border border-border/60 bg-background/50 p-4 sm:p-5">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        A day in the life
                      </p>
                      <div className="mt-3 min-h-[13rem]">
                        <AnimatedList delay={1600} className="gap-2">
                          {profile.dailyRituals.map((line) => (
                            <div
                              key={line}
                              className="w-full rounded-xl border border-border/60 bg-background/70 px-3 py-2.5 text-sm text-foreground/90 shadow-sm"
                            >
                              {line}
                            </div>
                          ))}
                        </AnimatedList>
                      </div>
                    </div>
                  ) : null}
                </div>
              </MagicCard>
            </div>
          </BlurFade>

          {/* Replaces tools row */}
          {profile.replacesTools?.length ? (
            <BlurFade delay={0.16}>
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Retires
                </span>
                {profile.replacesTools.map((tool) => (
                  <span
                    key={tool}
                    className="inline-flex items-center rounded-full border border-border/60 bg-background/60 px-3 py-1 font-mono text-[11px] font-medium text-muted-foreground"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </BlurFade>
          ) : null}
        </div>
      </section>

      {/* ------------------------------------------------------------------
       * North-star metric strip
       * ------------------------------------------------------------------ */}
      {profile.northStarMetric ? (
        <section className="mx-auto max-w-5xl px-6 pb-4 pt-2">
          <BlurFade>
            <div className="flex flex-col items-start gap-3 rounded-2xl border border-primary/25 bg-primary/8 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15">
                  <Target className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-primary/80">
                    North-star metric
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {profile.northStarMetric} — tracked automatically
                  </p>
                </div>
              </div>
              {profile.proofPoint ? (
                <span className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {profile.proofPoint.value}
                  </span>{" "}
                  · {profile.proofPoint.label}
                </span>
              ) : null}
            </div>
          </BlurFade>
        </section>
      ) : null}
    </>
  );
}
