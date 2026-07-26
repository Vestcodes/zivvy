"use client";

import Link from "next/link";
import {
  ArrowRight,
  Cookie,
  FileText,
  Fingerprint,
  KeyRound,
  ShieldAlert,
  ShieldCheck,
  Webhook
} from "lucide-react";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { BlurFade } from "@/components/ui/blur-fade";
import { ShineBorder } from "@/components/ui/shine-border";
import {
  BentoGrid,
  BentoGridItem,
  InfiniteMovingCards,
  SparklesCore
} from "@/components/ui/aceternity";
import { cn } from "@/lib/utils";

/**
 * Concrete posture — the actual controls in the product today. Written
 * deliberately literal so a security reviewer can map each row to a control.
 * Do not add anything here that isn't shipped.
 */
const SECURITY_POSTURE = [
  {
    Icon: Webhook,
    title: "HMAC-signed webhooks",
    body:
      "Every webhook body is signed with an HMAC-SHA256 header using your workspace secret. Verify before acting; rotate at any time from settings.",
    className: "md:col-span-2"
  },
  {
    Icon: Fingerprint,
    title: "Cross-tenant isolation",
    body:
      "Every row is bound to a tenant. Queries carry the tenant context and reject cross-tenant reads at the ORM boundary. No shared caches leak across workspaces.",
    className: ""
  },
  {
    Icon: KeyRound,
    title: "Per-tenant API keys",
    body:
      "API keys are scoped to a single workspace. A leaked key cannot read another tenant's data — the check happens at the request layer, not in application code.",
    className: ""
  },
  {
    Icon: ShieldAlert,
    title: "CSRF token",
    body:
      "State-changing requests require a double-submit CSRF token bound to the session. Read-only endpoints and public webhooks are exempt by design.",
    className: ""
  },
  {
    Icon: Cookie,
    title: "Session cookies",
    body:
      "HTTP-only, SameSite=Lax session cookies with short sliding expiry. Cookies are marked Secure on HTTPS (including when TLS terminates at the edge). Sessions are revocable per device from the account panel.",
    className: ""
  },
  {
    Icon: FileText,
    title: "GDPR posture",
    body:
      "EU-region workspaces stay in EU infrastructure. Data-subject requests (access, deletion, portability) are handled from the account panel. DPA available on request.",
    className: "md:col-span-2"
  }
];

/**
 * Third-party attestations. We are honest about the ones we're pursuing
 * versus the ones we hold — do NOT flip a "tracking" badge to "certified"
 * without paperwork attached. Rendered inside <InfiniteMovingCards>, so
 * the payload shape maps to that component's props (quote/name/title).
 */
const CERT_CARDS = [
  {
    quote:
      "Audit scoping underway with a third-party assessor. Type I first, then Type II window.",
    name: "SOC 2 Type II",
    title: "In progress"
  },
  {
    quote:
      "EU-region hosting, DPA available, data-subject workflows shipped. Sub-processors listed publicly.",
    name: "GDPR",
    title: "Ready"
  },
  {
    quote:
      "Controls mapped internally. Formal certification pursued after SOC 2.",
    name: "ISO/IEC 27001",
    title: "Planned"
  },
  {
    quote:
      "PCI scope kept intentionally out-of-band — payments run through Polar and Stripe as the merchant of record.",
    name: "PCI DSS",
    title: "Out of scope by design"
  },
  {
    quote:
      "Regional India workspaces stay in India infrastructure. Consent, notice, and grievance workflows in the account panel.",
    name: "DPDP Act (India)",
    title: "Ready"
  },
  {
    quote:
      "HIPAA controls not covered — Zivvy is not marketed for regulated healthcare data. Business Associate Agreements are declined.",
    name: "HIPAA",
    title: "Not covered"
  }
];

export function SecurityPageContent() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
          >
            <SparklesCore
              className="h-full w-full"
              background="transparent"
              minSize={0.5}
              maxSize={1.4}
              particleDensity={90}
              particleColor="#34d399"
              speed={1}
            />
            <div
              className={cn(
                "absolute inset-0",
                "[mask-image:radial-gradient(600px_circle_at_50%_20%,white,transparent)]"
              )}
              style={{
                background:
                  "radial-gradient(ellipse 60% 50% at 50% -10%, color-mix(in oklab, var(--primary) 18%, transparent), transparent 75%)"
              }}
            />
          </div>
          <div className="relative mx-auto max-w-4xl px-6 pb-14 pt-20 text-center sm:pt-24">
            <BlurFade>
              <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl border border-primary/40 bg-primary/10 shadow-[0_0_60px_-15px_theme(colors.emerald.400)]">
                <ShieldCheck className="size-10 text-primary" />
              </div>
              <div className="mb-5 inline-flex items-center justify-center rounded-full border border-border/60 bg-background/70 px-3 py-1 backdrop-blur">
                <AnimatedShinyText className="text-xs font-medium text-muted-foreground">
                  Security · regions · roles · audit
                </AnimatedShinyText>
              </div>
              <h1 className="font-display text-4xl font-bold tracking-tight sm:text-6xl">
                Security and trust
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
                Security is a product responsibility, not just a legal checkbox.
                Controls, regions, and audit trails are part of how Zivvy runs
                day to day.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild variant="polished">
                  <Link href="/contact">
                    Ask a security question
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/privacy">Privacy policy</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/dpa">DPA summary</Link>
                </Button>
              </div>
            </BlurFade>
          </div>
        </section>

        <section
          className="mx-auto max-w-6xl px-6 pb-14"
          aria-labelledby="security-posture"
        >
          <BlurFade>
            <h2
              id="security-posture"
              className="font-display text-3xl font-semibold tracking-tight"
            >
              What ships in the product today
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Every row here maps to a control you can verify. We do not list
              controls we are only planning.
            </p>
          </BlurFade>
          <BentoGrid className="mt-8 max-w-none gap-4 md:auto-rows-[13rem] md:grid-cols-3">
            {SECURITY_POSTURE.map((item) => (
              <BentoGridItem
                key={item.title}
                className={cn(
                  "border-border/70 bg-card/60 dark:bg-card/40",
                  item.className
                )}
                icon={
                  <div className="flex size-9 items-center justify-center rounded-lg border border-border/70 bg-background/70 text-primary">
                    <item.Icon className="size-4" />
                  </div>
                }
                title={
                  <span className="text-base font-semibold text-foreground">
                    {item.title}
                  </span>
                }
                description={
                  <span className="text-sm leading-relaxed text-muted-foreground">
                    {item.body}
                  </span>
                }
              />
            ))}
          </BentoGrid>
        </section>

        <section
          className="mx-auto max-w-6xl px-6 pb-14"
          aria-labelledby="security-badges"
        >
          <BlurFade>
            <h2
              id="security-badges"
              className="font-display text-3xl font-semibold tracking-tight"
            >
              Attestations
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              We publish where we are on each certification. When status
              changes, this page changes — no fabricated seals.
            </p>
          </BlurFade>
          <div className="mt-8 rounded-2xl border border-border/60 bg-card/40 py-4">
            <InfiniteMovingCards
              items={CERT_CARDS}
              direction="left"
              speed="slow"
              pauseOnHover
              className="[&_li]:border-border/70 [&_li]:bg-card/70 [&_li]:!bg-none dark:[&_li]:bg-card/60"
            />
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Statuses are shown on each card — <em>Ready</em>, <em>In
            progress</em>, <em>Planned</em>, or clearly marked <em>Not
            covered</em>. We never render a seal we do not hold.
          </p>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-16 text-center">
          <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 px-6 py-8">
            <ShineBorder shineColor={["#34d399", "#0f766e"]} duration={14} />
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Need a deeper questionnaire?
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Contact us for vendor security reviews — we&apos;ll share what we
              can without inventing certifications we don&apos;t have. Need
              processing terms? Start with the{" "}
              <Link
                href="/dpa"
                className="text-primary underline-offset-2 hover:underline"
              >
                DPA summary
              </Link>
              .
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild variant="polished">
                <Link href="/contact">Contact security</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/privacy">Privacy policy</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-20">
          <div className="rounded-2xl border border-dashed border-border/60 bg-card/30 p-5 text-center text-xs text-muted-foreground">
            <p className="font-medium text-foreground">
              Report a vulnerability
            </p>
            <p className="mt-1.5">
              Machine-readable disclosure lives at{" "}
              <a
                href="/.well-known/security.txt"
                className="text-primary underline-offset-2 hover:underline"
              >
                /.well-known/security.txt
              </a>
              . Humans, email{" "}
              <a
                href="mailto:security@zivvy.xyz"
                className="text-primary underline-offset-2 hover:underline"
              >
                security@zivvy.xyz
              </a>
              . PGP fingerprint on request.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
