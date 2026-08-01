"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
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
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { MagicCard } from "@/components/ui/magic-card";
import { ShineBorder } from "@/components/ui/shine-border";
import { TextAnimate } from "@/components/ui/text-animate";

function SupportChrome({
  kicker,
  title,
  description,
  children
}: {
  kicker: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 40% -10%, color-mix(in oklab, var(--primary) 10%, transparent), transparent 75%)"
            }}
          />
          <div className="relative mx-auto max-w-4xl px-6 pb-8 pt-20 sm:pt-24">
            <BlurFade>
              <div className="mb-4 inline-flex items-center justify-center rounded-full border border-border/60 bg-background/70 px-3 py-1 backdrop-blur">
                <AnimatedShinyText className="text-xs font-medium text-muted-foreground">
                  {kicker}
                </AnimatedShinyText>
              </div>
              <TextAnimate
                as="h1"
                by="word"
                animation="blurInUp"
                className="font-display text-4xl font-bold tracking-tight sm:text-5xl"
              >
                {title}
              </TextAnimate>
              <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{description}</p>
            </BlurFade>
          </div>
        </section>
        {children}
      </main>
      <SiteFooter />
    </>
  );
}

const DOC_SECTIONS = [
  {
    title: "Getting started",
    body: "Workspace setup, user invitations, region preference, and first workflow launch."
  },
  {
    title: "API reference",
    body: "Authentication, endpoint patterns, payload conventions, and event triggers."
  },
  {
    title: "Tutorials",
    body: "Role-based walkthroughs for sales, finance, operations, and HR teams."
  },
  {
    title: "Troubleshooting",
    body: "Common setup and runtime issues with step-by-step resolution guidance."
  }
];

export function SupportDocsContent() {
  return (
    <SupportChrome
      kicker="Support · documentation"
      title="Documentation"
      description="Practical technical and operational docs to help your team implement quickly."
    >
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-4 md:grid-cols-2">
          {DOC_SECTIONS.map((section, index) => (
            <BlurFade key={section.title} delay={0.04 + index * 0.04}>
              <MagicCard
                className="relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card/70 p-6"
                gradientFrom="#34d399"
                gradientTo="#0f766e"
                gradientColor="rgba(27, 152, 114, 0.08)"
              >
                {index === 0 ? (
                  <BorderBeam size={50} duration={7} colorFrom="#34d399" colorTo="#0f766e" />
                ) : null}
                <h2 className="font-display text-2xl font-semibold">{section.title}</h2>
                <p className="mt-3 text-sm text-muted-foreground">{section.body}</p>
              </MagicCard>
            </BlurFade>
          ))}
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          Need a specific implementation playbook?{" "}
          <Link href="/contact" className="text-primary underline-offset-4 hover:underline">
            Contact support
          </Link>
          .
        </p>
      </section>
    </SupportChrome>
  );
}

const CHANGELOG = [
  {
    date: "Jul 2026",
    title: "Marketing architecture expansion",
    items: [
      "Added dedicated feature, solution, use-case, industry, and integration pages",
      "Published comparison and alternatives landing paths",
      "Introduced resource and support hubs for self-serve education"
    ]
  },
  {
    date: "Jul 2026",
    title: "Workflow and navigation upgrades",
    items: [
      "Shipped saved views and keyboard-first list navigation",
      "Added team/role management UI in settings",
      "Improved notification center and activity timeline visibility"
    ]
  },
  {
    date: "Jun 2026",
    title: "Billing and access improvements",
    items: [
      "Moved billing experience into dashboard shell",
      "Added auth route guards and update-password support",
      "Improved data fetching smoothness with React Query caching"
    ]
  }
];

export function ChangelogPageContent() {
  return (
    <SupportChrome
      kicker="Support · changelog"
      title="Changelog"
      description="Transparent updates on what shipped, improved, and changed."
    >
      <section className="mx-auto max-w-4xl px-6 pb-20">
        <div className="space-y-4">
          {CHANGELOG.map((entry, index) => (
            <BlurFade key={entry.title} delay={0.04 + index * 0.04}>
              <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-6">
                {index === 0 ? (
                  <ShineBorder shineColor={["#34d399", "#0f766e"]} duration={14} />
                ) : null}
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {entry.date}
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold">{entry.title}</h2>
                <ul className="mt-4 space-y-2">
                  {entry.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </BlurFade>
          ))}
        </div>
      </section>
    </SupportChrome>
  );
}

const ROADMAP = {
  now: [
    "Workflow depth improvements across finance and operations",
    "Expanded support and education experience",
    "Performance tuning for list and form-heavy workloads"
  ],
  next: [
    "Richer integration setup guides and connectors",
    "Enhanced analytics drill-down and trend intelligence",
    "Template library expansion for team and industry playbooks"
  ],
  later: [
    "Deeper ecosystem extensibility for partner apps",
    "Advanced benchmarking and planning insights",
    "Expanded enterprise governance controls"
  ]
};

export function RoadmapPageContent() {
  const columns = [
    { key: "now" as const, title: "Now", accent: true },
    { key: "next" as const, title: "Next", accent: false },
    { key: "later" as const, title: "Later", accent: false }
  ];

  return (
    <SupportChrome
      kicker="Support · roadmap"
      title="Roadmap"
      description="Product direction for planning visibility. Priorities can adjust based on customer feedback."
    >
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-4 md:grid-cols-3">
          {columns.map((col, index) => (
            <BlurFade key={col.key} delay={0.04 + index * 0.04}>
              <MagicCard
                className="relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card/70 p-5"
                gradientFrom="#34d399"
                gradientTo="#0f766e"
                gradientColor="rgba(27, 152, 114, 0.08)"
              >
                {col.accent ? (
                  <BorderBeam size={55} duration={8} colorFrom="#34d399" colorTo="#0f766e" />
                ) : null}
                <h2 className="font-display text-2xl font-semibold">{col.title}</h2>
                <ul className="mt-4 space-y-3">
                  {ROADMAP[col.key].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </MagicCard>
            </BlurFade>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button asChild variant="outline">
            <Link href="/contact">
              Suggest a priority
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </SupportChrome>
  );
}

const HELP_FAQ = [
  {
    q: "How do I manage billing and seats?",
    a: "Use Billing in the dashboard to upgrade plans, manage seats, and open the billing portal."
  },
  {
    q: "Where can I review security practices?",
    a: "Our security page covers encryption, data handling, and operational controls."
  },
  {
    q: "Can I export my data?",
    a: "Yes. Data export options are available, and support can guide full migration workflows."
  },
  {
    q: "How fast does support respond?",
    a: "We typically respond within one business day. Priority support is included on Pro and Business."
  }
];

const HELP_STREAM = [
  "Billing → seats & invoices",
  "Roles → invite teammates",
  "Security → regions & access",
  "Export → migration help"
];

export function HelpCenterPageContent() {
  return (
    <SupportChrome
      kicker="Support · help center"
      title="Help center"
      description="Fast answers for account, billing, security, and product operations questions."
    >
      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-20 lg:grid-cols-[1.2fr_0.8fr]">
        <BlurFade>
          <Accordion
            type="single"
            collapsible
            className="rounded-2xl border border-border/70 bg-card/60 px-2"
          >
            {HELP_FAQ.map((item) => (
              <AccordionItem key={item.q} value={item.q} className="border-border/60 last:border-b-0">
                <AccordionTrigger className="px-4 text-left text-sm font-medium">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="px-4 text-sm text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </BlurFade>
        <BlurFade delay={0.08}>
          <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-5">
            <ShineBorder shineColor={["#34d399", "#0f766e"]} duration={14} />
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Quick paths
            </p>
            <div className="mt-4 min-h-[12rem]">
              <AnimatedList delay={1300} className="gap-2">
                {HELP_STREAM.map((step) => (
                  <div
                    key={step}
                    className="w-full rounded-xl border border-border/60 bg-background/70 px-3 py-2.5 text-left text-sm shadow-sm"
                  >
                    {step}
                  </div>
                ))}
              </AnimatedList>
            </div>
            <Button asChild variant="outline" className="mt-5 w-full">
              <Link href="/contact">Still need help?</Link>
            </Button>
          </div>
        </BlurFade>
      </section>
    </SupportChrome>
  );
}
