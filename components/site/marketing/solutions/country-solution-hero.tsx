"use client";

import Link from "next/link";
import { ArrowRight, Check, ExternalLink } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { CountrySolutionProfile } from "@/lib/solutions-content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { TextAnimate } from "@/components/ui/text-animate";
import { AnimatedList } from "@/components/ui/animated-list";
import { Marquee } from "@/components/ui/marquee";
import { Spotlight } from "@/components/ui/spotlight";
import { BrandLogo } from "@/components/site/brand-logo";
import { cn } from "@/lib/utils";

type Props = {
  profile: CountrySolutionProfile;
};

export function CountrySolutionHero({ profile }: Props) {
  const reduce = useReducedMotion();

  return (
    <>
      {/* ------------------------------------------------------------------
       * Hero — two-column, biased right, with the passport-style flag card.
       * ------------------------------------------------------------------ */}
      <section className="relative overflow-hidden">
        <Spotlight
          className="-top-40 left-0 md:-top-20 md:left-60"
          fill="rgba(52, 211, 153, 0.28)"
        />
        <div className="mx-auto grid max-w-6xl gap-10 px-6 pb-14 pt-20 sm:pt-24 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          {/* Left column — copy + fact strip */}
          <div>
            <BlurFade>
              <Link
                href="/solutions"
                className="text-xs font-medium uppercase tracking-wide text-muted-foreground hover:text-foreground"
              >
                Solutions · {profile.title.replace(/^Zivvy for /, "")}
              </Link>
              <TextAnimate
                as="h1"
                by="word"
                animation="blurInUp"
                className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl"
              >
                {profile.title}
              </TextAnimate>
              <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
                {profile.description}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="polished" size="lg">
                  <Link href={profile.ctaHref}>
                    {profile.ctaLabel}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/product-tour">Watch product tour</Link>
                </Button>
              </div>
            </BlurFade>

            {/* Fact strip — currency, tax regime, locales, fiscal year */}
            <BlurFade delay={0.1}>
              <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-[auto_auto_1fr]">
                {/* Currency chip */}
                <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/60 px-4 py-3">
                  <span
                    aria-hidden
                    className="font-display text-3xl font-semibold leading-none text-primary"
                  >
                    {profile.currencySymbol}
                  </span>
                  <div className="flex flex-col leading-tight">
                    <span className="text-sm font-semibold">{profile.currency}</span>
                    <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      Ledger currency
                    </span>
                  </div>
                </div>

                {/* Tax regime badge */}
                <div className="flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/12 px-4 py-3">
                  <span className="rounded-md bg-primary/20 px-2 py-0.5 font-mono text-xs font-semibold text-primary">
                    TAX
                  </span>
                  <div className="flex flex-col leading-tight">
                    <span className="text-sm font-semibold text-primary">
                      {profile.taxRegime}
                    </span>
                    <span className="text-[11px] uppercase tracking-wide text-primary/70">
                      Regime
                    </span>
                  </div>
                </div>

                {/* Locale + fiscal year pills */}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="font-mono text-[11px]">
                    {profile.primaryLanguage}
                  </Badge>
                  {profile.secondaryLocale ? (
                    <Badge variant="outline" className="font-mono text-[11px]">
                      {profile.secondaryLocale}
                    </Badge>
                  ) : null}
                  {profile.fiscalYearStart ? (
                    <Badge variant="secondary" className="text-[11px]">
                      FY start · {profile.fiscalYearStart}
                    </Badge>
                  ) : null}
                </div>
              </div>

              {profile.dataResidency ? (
                <p className="mt-3 text-xs text-muted-foreground">
                  Data residency: <span className="font-mono">{profile.dataResidency}</span>
                </p>
              ) : null}

              {profile.proofPoint ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {profile.proofPoint.value}
                  </span>{" "}
                  · {profile.proofPoint.label}
                </p>
              ) : null}
            </BlurFade>
          </div>

          {/* Right column — passport card */}
          <BlurFade delay={0.15}>
            <div className="relative mx-auto max-w-sm">
              <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/80 p-8 shadow-lg">
                <BorderBeam size={110} duration={12} colorFrom="#34d399" colorTo="#0f766e" />
                {/* Soft primary radial glow behind the flag */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -z-10"
                  style={{
                    background:
                      "radial-gradient(ellipse 60% 55% at 50% 40%, color-mix(in oklab, var(--primary) 18%, transparent), transparent 70%)"
                  }}
                />
                <div className="flex flex-col items-center gap-4 text-center">
                  <motion.span
                    role="img"
                    aria-label={`${profile.title} flag`}
                    className="select-none text-8xl leading-none drop-shadow"
                    initial={reduce ? undefined : { scale: 0.9, opacity: 0 }}
                    animate={reduce ? undefined : { scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  >
                    {profile.flagEmoji}
                  </motion.span>
                  <div>
                    <p className="font-display text-2xl font-semibold tracking-tight">
                      {profile.title.replace(/^Zivvy for /, "")}
                    </p>
                    <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">
                      ISO {profile.countryCode}
                      {profile.region ? ` · ${profile.region}` : ""}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* ------------------------------------------------------------------
       * Compliance strip — "Ready for local rules"
       * ------------------------------------------------------------------ */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <BlurFade>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Local rules
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                Ready for local rules
              </h2>
              <p className="mt-3 max-w-md text-sm text-muted-foreground">
                Every filing, every posting, every printed line item — wired to the
                regulator&apos;s spec, not a best-effort translation.
              </p>
              {profile.regulatoryLinks.length ? (
                <ul className="mt-6 flex flex-wrap gap-2">
                  {profile.regulatoryLinks.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-medium text-foreground/90 transition hover:border-primary/40 hover:text-primary"
                      >
                        {link.label}
                        <ExternalLink className="size-3" />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </BlurFade>

          <BlurFade delay={0.08}>
            <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-5">
              <div className="min-h-[16rem]">
                <AnimatedList delay={1500} className="gap-2">
                  {profile.complianceHooks.map((hook) => (
                    <div
                      key={hook.label}
                      className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/70 px-3 py-2.5 text-left"
                    >
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground/90">
                          {hook.label}
                        </p>
                        {hook.description ? (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {hook.description}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </AnimatedList>
              </div>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* ------------------------------------------------------------------
       * Local integrations — logo marquee
       * ------------------------------------------------------------------ */}
      {profile.localIntegrations.length ? (
        <section className="mx-auto max-w-6xl px-6 py-8">
          <BlurFade>
            <div className="mb-6 flex flex-col gap-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Local integrations
              </p>
              <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                Wired to {profile.title.replace(/^Zivvy for /, "")} tools
              </h2>
            </div>
            <div
              className={cn(
                "relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 py-4",
                "[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]"
              )}
            >
              <Marquee pauseOnHover className="[--duration:32s]">
                {profile.localIntegrations.map((integration) => (
                  <Link
                    key={integration.slug}
                    href={`/integrations/${integration.slug}`}
                    className="group mx-1 flex items-center gap-3 rounded-xl border border-border/50 bg-background/60 px-4 py-3 transition hover:border-primary/40"
                  >
                    <BrandLogo
                      slug={integration.slug}
                      className="size-8 text-muted-foreground group-hover:text-foreground"
                      monotone
                    />
                    <div className="flex flex-col leading-tight">
                      <span className="text-sm font-medium">{integration.name}</span>
                      {integration.category ? (
                        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                          {integration.category}
                        </span>
                      ) : null}
                    </div>
                  </Link>
                ))}
              </Marquee>
            </div>
          </BlurFade>
        </section>
      ) : null}
    </>
  );
}

