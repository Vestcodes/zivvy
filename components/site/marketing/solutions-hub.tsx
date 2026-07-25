"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Cloud,
  Code2,
  Factory,
  Globe2,
  Landmark,
  Megaphone,
  Rocket,
  ShoppingBag,
  Truck,
  UsersRound,
  type LucideIcon
} from "lucide-react";
import type {
  CountrySolutionProfile,
  IndustrySolutionProfile,
  SolutionProfile,
  TeamSolutionProfile
} from "@/lib/solutions-content";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/blur-fade";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { DotPattern } from "@/components/ui/dot-pattern";
import { MagicCard } from "@/components/ui/magic-card";
import { NumberTicker } from "@/components/ui/number-ticker";
import { ShineBorder } from "@/components/ui/shine-border";
import { TextAnimate } from "@/components/ui/text-animate";
import { cn } from "@/lib/utils";

const BackgroundBeams = dynamic(
  () =>
    import("@/components/ui/aceternity/background-beams").then(
      (m) => m.BackgroundBeams
    ),
  { ssr: false }
);

type Tier = "Free" | "Pro" | "Business";

const TIER_BADGE: Record<Tier, string> = {
  Free: "bg-muted text-foreground border-transparent",
  Pro: "bg-primary-gradient text-primary-foreground border-transparent",
  Business: "bg-foreground text-background border-transparent"
};

const INDUSTRY_ICON: Record<string, LucideIcon> = {
  manufacturing: Factory,
  distribution: Truck,
  "professional-services": Briefcase,
  saas: Cloud,
  retail: ShoppingBag
};

const TEAM_ICON: Record<string, LucideIcon> = {
  startups: Rocket,
  agencies: Briefcase,
  enterprises: Landmark,
  "hr-teams": UsersRound,
  "marketing-teams": Megaphone,
  developers: Code2,
  "finance-teams": Landmark
};

type Stat = {
  value: number;
  suffix?: string;
  decimals?: number;
  label: string;
  sub: string;
};

const STATS: Stat[] = [
  {
    value: 22,
    suffix: "",
    label: "Solutions shipped",
    sub: "Country, industry, and team profiles — each with real regulatory + tooling coverage."
  },
  {
    value: 99.9,
    suffix: "%",
    decimals: 1,
    label: "Multi-region uptime",
    sub: "Frankfurt, Mumbai, Sydney, N. Virginia, São Paulo — pick where your data lives."
  },
  {
    value: 420,
    suffix: "+",
    label: "REST endpoints",
    sub: "Every doctype is a resource. Every state change is a signed webhook."
  }
];

// ---------------------------------------------------------------------------
// Card renderers
// ---------------------------------------------------------------------------

function CountryCard({ profile }: { profile: CountrySolutionProfile }) {
  return (
    <Link
      href={`/solutions/${profile.slug}`}
      className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-5 transition hover:border-primary/50 hover:bg-card/80"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-40 transition-opacity group-hover:opacity-70"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 100% 0%, color-mix(in oklab, var(--primary) 20%, transparent), transparent 70%)"
        }}
      />
      <div className="flex items-start justify-between gap-3">
        <span
          role="img"
          aria-label={`${profile.title} flag`}
          className="select-none text-4xl leading-none drop-shadow"
        >
          {profile.flagEmoji}
        </span>
        <Badge className="bg-primary/12 text-primary text-[10px]">
          {profile.taxRegime}
        </Badge>
      </div>
      <div className="mt-5">
        <p className="font-display text-lg font-semibold tracking-tight">
          {profile.title.replace(/^Zivvy for /, "")}
        </p>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
          {profile.description}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px]">
          <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/60 px-2 py-0.5 font-mono text-muted-foreground">
            <span className="font-semibold text-foreground">
              {profile.currencySymbol}
            </span>
            {profile.currency}
          </span>
          <span className="font-mono text-muted-foreground">
            {profile.primaryLanguage}
          </span>
          {profile.region ? (
            <span className="text-muted-foreground">· {profile.region}</span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

function IndustryCard({ profile }: { profile: IndustrySolutionProfile }) {
  const Icon = INDUSTRY_ICON[profile.slug] ?? Factory;
  return (
    <Link
      href={`/solutions/${profile.slug}`}
      className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-5 transition hover:border-primary/50 hover:bg-card/80"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-12 items-center justify-center rounded-xl border border-border/60 bg-background/70">
          <Icon className="size-6 text-primary" aria-hidden />
        </div>
        <Badge variant="outline" className="bg-background/70 text-[10px]">
          {profile.sizeSweetSpot}
        </Badge>
      </div>
      <div className="mt-5">
        <p className="font-display text-lg font-semibold tracking-tight">
          {profile.title.replace(/^Zivvy for /, "")}
        </p>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
          {profile.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {profile.painPoints.slice(0, 3).map((pain) => (
            <span
              key={pain}
              className="rounded-full border border-amber-500/30 bg-amber-500/8 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-300"
            >
              {pain}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

function TeamCard({ profile }: { profile: TeamSolutionProfile }) {
  const Icon = TEAM_ICON[profile.slug] ?? Rocket;
  return (
    <Link
      href={`/solutions/${profile.slug}`}
      className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-5 transition hover:border-primary/50 hover:bg-card/80"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-12 items-center justify-center rounded-xl border border-border/60 bg-background/70">
          <Icon className="size-6 text-primary" aria-hidden />
        </div>
        {profile.minimumTier ? (
          <Badge className={cn("text-[10px]", TIER_BADGE[profile.minimumTier])}>
            {profile.minimumTier}
          </Badge>
        ) : null}
      </div>
      <div className="mt-5">
        <p className="font-display text-lg font-semibold tracking-tight">
          {profile.title.replace(/^Zivvy for /, "")}
        </p>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
          {profile.description}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/60 px-2 py-0.5">
            <UsersRound className="size-3" />
            {profile.teamSize}
          </span>
          {profile.northStarMetric ? (
            <span className="rounded-full border border-border/60 bg-background/60 px-2 py-0.5">
              {profile.northStarMetric}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Section shell
// ---------------------------------------------------------------------------

type SectionProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  Icon: LucideIcon;
  children: React.ReactNode;
};

function GroupSection({ eyebrow, title, subtitle, Icon, children }: SectionProps) {
  return (
    <section className="relative mx-auto max-w-6xl px-6 py-8">
      <BlurFade>
        <div className="mb-6 flex items-start justify-between gap-4 sm:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1">
              <Icon className="size-3.5 text-primary" />
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {eyebrow}
              </span>
            </div>
            <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {title}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
      </BlurFade>
      {children}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

type Props = {
  profiles: SolutionProfile[];
};

export function SolutionsHubPage({ profiles }: Props) {
  const countries = profiles.filter(
    (p): p is CountrySolutionProfile => p.type === "country"
  );
  const industries = profiles.filter(
    (p): p is IndustrySolutionProfile => p.type === "industry"
  );
  const teams = profiles.filter(
    (p): p is TeamSolutionProfile => p.type === "team"
  );

  return (
    <>
      <SiteHeader />
      <main>
        {/* -----------------------------------------------------------
         * Hero
         * ----------------------------------------------------------- */}
        <section className="relative overflow-hidden bg-background">
          <div className="absolute inset-0 -z-10 opacity-70">
            <BackgroundBeams />
          </div>
          <div className="relative mx-auto max-w-5xl px-6 pb-6 pt-24 text-center sm:pt-28">
            <BlurFade>
              <div className="mb-5 inline-flex items-center justify-center rounded-full border border-border/60 bg-background/70 px-3 py-1 backdrop-blur">
                <AnimatedShinyText className="text-xs font-medium text-muted-foreground">
                  Solutions · by country · by industry · by team
                </AnimatedShinyText>
              </div>
              <TextAnimate
                as="h1"
                by="word"
                animation="blurInUp"
                className="font-display text-4xl font-bold tracking-tight sm:text-5xl"
              >
                One tenant. Shaped to your world.
              </TextAnimate>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
                Pick your country for local tax and banking. Pick your industry for the
                right modules and dashboards. Pick your team for the workflow you already
                run — every path lands on the same tenant.
              </p>
            </BlurFade>
          </div>

          <div className="relative mx-auto mt-10 max-w-5xl px-6 pb-8">
            <div className="grid gap-3 sm:grid-cols-3">
              {STATS.map((stat, idx) => (
                <BlurFade key={stat.label} delay={0.06 + idx * 0.06}>
                  <MagicCard
                    className="relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card/70 p-5 text-left"
                    gradientFrom="#34d399"
                    gradientTo="#0f766e"
                    gradientColor="rgba(27, 152, 114, 0.1)"
                  >
                    <div className="flex items-baseline gap-1">
                      <NumberTicker
                        value={stat.value}
                        decimalPlaces={stat.decimals ?? 0}
                        className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
                      />
                      {stat.suffix ? (
                        <span className="font-display text-2xl font-semibold text-primary sm:text-3xl">
                          {stat.suffix}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm font-medium">{stat.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{stat.sub}</p>
                  </MagicCard>
                </BlurFade>
              ))}
            </div>
          </div>
        </section>

        {/* -----------------------------------------------------------
         * Wrapper for the three grouped sections
         * ----------------------------------------------------------- */}
        <div className="relative">
          <DotPattern
            className={cn(
              "pointer-events-none absolute inset-0 -z-10 text-primary/20",
              "[mask-image:radial-gradient(700px_circle_at_50%_20%,white,transparent)]"
            )}
          />

          {/* By country */}
          {countries.length ? (
            <GroupSection
              eyebrow="By country"
              title="Ready-to-file, market by market"
              subtitle="GST-ready in India, DATEV-ready in Germany, MTD-ready in the UK — every country page ships the regulatory hooks your accountant asks for."
              Icon={Globe2}
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {countries.map((profile, idx) => (
                  <BlurFade key={profile.slug} delay={0.03 + idx * 0.03}>
                    <CountryCard profile={profile} />
                  </BlurFade>
                ))}
              </div>
            </GroupSection>
          ) : null}

          {/* By industry */}
          {industries.length ? (
            <GroupSection
              eyebrow="By industry"
              title="Modules built for how you actually operate"
              subtitle="Manufacturers get BOM-aware work orders. Distributors get zone picking. SaaS gets ASC 606 out of the box. Every vertical is a real profile — not a landing page."
              Icon={Factory}
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {industries.map((profile, idx) => (
                  <BlurFade key={profile.slug} delay={0.03 + idx * 0.03}>
                    <IndustryCard profile={profile} />
                  </BlurFade>
                ))}
              </div>
            </GroupSection>
          ) : null}

          {/* By team */}
          {teams.length ? (
            <GroupSection
              eyebrow="By team"
              title="A tenant shaped to your team's rituals"
              subtitle="Finance closes in five days. Marketing attributes on real revenue. Developers get 420+ signed webhooks. Every team profile is a persona-tuned starter."
              Icon={UsersRound}
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {teams.map((profile, idx) => (
                  <BlurFade key={profile.slug} delay={0.03 + idx * 0.03}>
                    <TeamCard profile={profile} />
                  </BlurFade>
                ))}
              </div>
            </GroupSection>
          ) : null}
        </div>

        {/* -----------------------------------------------------------
         * Cross-links + closing CTA
         * ----------------------------------------------------------- */}
        <section className="mx-auto grid max-w-6xl gap-4 px-6 pb-6 pt-10 md:grid-cols-2">
          <BlurFade>
            <MagicCard
              className="rounded-2xl border border-border/70 bg-card/70 p-6"
              gradientFrom="#34d399"
              gradientTo="#0f766e"
              gradientColor="rgba(27, 152, 114, 0.1)"
            >
              <h2 className="font-display text-xl font-semibold">Browse by workflow</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Prefer starting from a concrete workflow? Each use case lists the REST
                resources and webhook events it touches.
              </p>
              <Button asChild variant="outline" className="mt-5">
                <Link href="/use-cases">
                  Explore use cases
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </MagicCard>
          </BlurFade>
          <BlurFade delay={0.06}>
            <MagicCard
              className="rounded-2xl border border-border/70 bg-card/70 p-6"
              gradientFrom="#0f766e"
              gradientTo="#34d399"
              gradientColor="rgba(27, 152, 114, 0.08)"
            >
              <h2 className="font-display text-xl font-semibold">Under the hood</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Every profile above lands on the same tenant — one auth boundary, one
                webhook stream, one data model.
              </p>
              <Button asChild variant="outline" className="mt-5">
                <Link href="/product-tour">
                  Take the product tour
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </MagicCard>
          </BlurFade>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-20 pt-2 sm:pb-24">
          <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 px-6 py-8 text-center">
            <ShineBorder shineColor={["#34d399", "#0f766e"]} duration={14} />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 -z-10 opacity-40"
            >
              <AnimatedGridPattern
                numSquares={18}
                maxOpacity={0.08}
                className="absolute inset-0 fill-primary/10 stroke-primary/15 [mask-image:radial-gradient(300px_circle_at_50%_100%,white,transparent)]"
              />
            </div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Want a role-shaped starter?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
              We&apos;ll seed a tenant with the right dashboards, roles, tax setup, and
              webhook subscriptions for how your team already operates.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild variant="polished">
                <Link href="/contact">Get a seeded tenant</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/login#signup">Start free</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
