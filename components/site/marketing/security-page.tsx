"use client";

import Link from "next/link";
import {
  ArrowRight,
  Cookie,
  Database,
  FileText,
  Fingerprint,
  KeyRound,
  Lock,
  Server,
  ShieldAlert,
  ShieldCheck,
  UserRoundCog,
  Webhook,
  Workflow
} from "lucide-react";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { Button } from "@/components/ui/button";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { DotPattern } from "@/components/ui/dot-pattern";
import { MagicCard } from "@/components/ui/magic-card";
import { OrbitingCircles } from "@/components/ui/orbiting-circles";
import { ShineBorder } from "@/components/ui/shine-border";
import { TextAnimate } from "@/components/ui/text-animate";
import { cn } from "@/lib/utils";

const SECURITY_AREAS = [
  {
    title: "Encryption",
    body: "Traffic is encrypted in transit and operational data is protected with modern encryption standards.",
    Icon: Lock
  },
  {
    title: "Access control",
    body: "Role-based permissions and tenant-aware boundaries protect sensitive workflows and business records.",
    Icon: UserRoundCog
  },
  {
    title: "Data handling",
    body: "Teams choose regional preference — India, EU, or US — and keep operational data aligned with policy.",
    Icon: Database
  },
  {
    title: "Infrastructure",
    body: "Production workloads run with managed infrastructure controls, health checks, and monitored services.",
    Icon: Server
  },
  {
    title: "Privacy practices",
    body: "Privacy principles are reflected in product behavior, legal terms, and support operations.",
    Icon: ShieldCheck
  },
  {
    title: "Operational resilience",
    body: "Workflow events, timeline history, and deployment safeguards help reduce operational and security risk.",
    Icon: Workflow
  }
];

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
      "Every webhook body is signed with an HMAC-SHA256 header using your workspace secret. Verify before acting; rotate at any time from settings."
  },
  {
    Icon: KeyRound,
    title: "Per-tenant API keys",
    body:
      "API keys are scoped to a single workspace. A leaked key cannot read another tenant's data — the check happens at the request layer, not in application code."
  },
  {
    Icon: Fingerprint,
    title: "Cross-tenant isolation",
    body:
      "Every row is bound to a tenant. Queries carry the tenant context and reject cross-tenant reads at the ORM boundary. No shared caches leak across workspaces."
  },
  {
    Icon: Cookie,
    title: "Session cookies",
    body:
      "HTTP-only, Secure, SameSite=Lax session cookies with short sliding expiry. Sessions are revocable per device from the account panel."
  },
  {
    Icon: ShieldAlert,
    title: "CSRF token",
    body:
      "State-changing requests require a double-submit CSRF token bound to the session. Read-only endpoints and public webhooks are exempt by design."
  },
  {
    Icon: FileText,
    title: "GDPR posture",
    body:
      "EU-region workspaces stay in EU infrastructure. Data-subject requests (access, deletion, portability) are handled from the account panel. DPA available on request."
  }
];

/**
 * Third-party attestations. We are honest about the ones we're pursuing
 * versus the ones we hold — do NOT flip a "tracking" badge to "certified"
 * without paperwork attached.
 */
const COMPLIANCE_BADGES = [
  {
    label: "SOC 2 Type II",
    status: "In progress",
    body: "Audit scoping underway with a third-party assessor. Type I first, then Type II window."
  },
  {
    label: "GDPR",
    status: "Ready",
    body: "EU-region hosting, DPA available, data-subject workflows shipped. Sub-processors listed publicly."
  },
  {
    label: "ISO/IEC 27001",
    status: "Tracking",
    body: "Controls mapped internally. Formal certification pursued after SOC 2."
  }
];

export function SecurityPageContent() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <DotPattern
            className={cn(
              "pointer-events-none absolute inset-0 -z-10 text-primary/25",
              "[mask-image:radial-gradient(480px_circle_at_30%_-5%,white,transparent)]"
            )}
          />
          <div className="relative mx-auto grid max-w-6xl gap-10 px-6 pb-10 pt-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center sm:pt-24">
            <BlurFade>
              <div className="mb-5 inline-flex items-center justify-center rounded-full border border-border/60 bg-background/70 px-3 py-1 backdrop-blur">
                <AnimatedShinyText className="text-xs font-medium text-muted-foreground">
                  Security · regions · roles · audit
                </AnimatedShinyText>
              </div>
              <TextAnimate
                as="h1"
                by="word"
                animation="blurInUp"
                className="font-display text-4xl font-bold tracking-tight sm:text-5xl"
              >
                Security and trust
              </TextAnimate>
              <p className="mt-4 max-w-xl text-lg text-muted-foreground">
                Security is a product responsibility, not just a legal checkbox. Controls, regions,
                and audit trails are part of how Zivvy runs day to day.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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

            <BlurFade delay={0.1}>
              <div className="relative mx-auto flex h-[260px] w-full max-w-sm items-center justify-center">
                <OrbitingCircles radius={100} iconSize={34} duration={24}>
                  {["TLS", "RBAC", "IN", "EU"].map((label) => (
                    <span
                      key={label}
                      className="flex size-9 items-center justify-center rounded-full border border-border/70 bg-card text-[10px] font-semibold"
                    >
                      {label}
                    </span>
                  ))}
                </OrbitingCircles>
                <OrbitingCircles radius={150} iconSize={30} duration={30} reverse>
                  {["US", "Logs", "Keys"].map((label) => (
                    <span
                      key={label}
                      className="flex size-8 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-[10px] font-semibold text-primary"
                    >
                      {label}
                    </span>
                  ))}
                </OrbitingCircles>
                <div className="absolute flex size-16 items-center justify-center rounded-2xl border border-primary/40 bg-primary/15">
                  <ShieldCheck className="size-7 text-primary" />
                </div>
              </div>
            </BlurFade>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-12">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {SECURITY_AREAS.map((area, index) => (
              <BlurFade key={area.title} delay={0.03 + index * 0.03}>
                <MagicCard
                  className="relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card/70 p-5"
                  gradientFrom="#34d399"
                  gradientTo="#0f766e"
                  gradientColor="rgba(27, 152, 114, 0.08)"
                >
                  {index === 0 ? (
                    <BorderBeam size={55} duration={8} colorFrom="#34d399" colorTo="#0f766e" />
                  ) : null}
                  <area.Icon className="size-5 text-primary" />
                  <h2 className="mt-3 font-display text-xl font-semibold">{area.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{area.body}</p>
                </MagicCard>
              </BlurFade>
            ))}
          </div>
        </section>

        <section
          className="mx-auto max-w-6xl px-6 pb-12"
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
              Every row here maps to a control you can verify. We do not list controls we
              are only planning.
            </p>
          </BlurFade>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {SECURITY_POSTURE.map((item, index) => (
              <BlurFade key={item.title} delay={0.03 + index * 0.03}>
                <div className="h-full rounded-2xl border border-border/70 bg-card/60 p-5">
                  <div className="flex size-9 items-center justify-center rounded-lg border border-border/70 bg-background/70 text-primary">
                    <item.Icon className="size-4" />
                  </div>
                  <h3 className="mt-3 font-display text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
                </div>
              </BlurFade>
            ))}
          </div>
        </section>

        <section
          className="mx-auto max-w-6xl px-6 pb-12"
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
              We publish where we are on each certification. When status changes, this
              page changes — no fabricated seals.
            </p>
          </BlurFade>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {COMPLIANCE_BADGES.map((badge, index) => (
              <BlurFade key={badge.label} delay={0.03 + index * 0.03}>
                <div className="h-full rounded-2xl border border-border/70 bg-card/60 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-display text-lg font-semibold">{badge.label}</div>
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[11px] font-medium",
                        badge.status === "Ready"
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-border/70 bg-muted/40 text-muted-foreground"
                      )}
                    >
                      {badge.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{badge.body}</p>
                </div>
              </BlurFade>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Report a vulnerability at{" "}
            <a
              href="/.well-known/security.txt"
              className="text-primary underline-offset-2 hover:underline"
            >
              /.well-known/security.txt
            </a>
            {" "}or email{" "}
            <a
              href="mailto:security@zivvy.xyz"
              className="text-primary underline-offset-2 hover:underline"
            >
              security@zivvy.xyz
            </a>
            .
          </p>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-20 text-center">
          <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/70 px-6 py-8">
            <ShineBorder shineColor={["#34d399", "#0f766e"]} duration={14} />
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Need a deeper questionnaire?
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Contact us for vendor security reviews — we&apos;ll share what we can without inventing
              certifications we don&apos;t have. Need processing terms? Start with the{" "}
              <Link href="/dpa" className="text-primary underline-offset-2 hover:underline">
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
      </main>
      <SiteFooter />
    </>
  );
}
