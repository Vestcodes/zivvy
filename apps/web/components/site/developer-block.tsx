"use client";

import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/blur-fade";
import {
  BackgroundBeams,
  CardBody,
  CardContainer,
  CardItem,
} from "@/components/ui/aceternity";

const CURL_LINES = [
  { text: "$ curl https://api.zivvy.xyz/v1/sales-invoices \\", muted: true },
  { text: "    -H 'Authorization: Bearer $ZIVVY_TOKEN' \\", muted: true },
  { text: "    -H 'Content-Type: application/json'", muted: true },
  { text: "" },
  { text: "HTTP/1.1 200 OK", accent: "emerald" as const },
  { text: "X-Zivvy-Signature: t=1734531200,v1=…", accent: "cyan" as const },
  { text: "" },
  { text: "{", muted: true },
  { text: '  "id": "SINV-2026-0001",', muted: false },
  { text: '  "status": "submitted",', muted: false },
  { text: '  "total": 18400.00', muted: false },
  { text: "}", muted: true },
];

const DEV_STATS = [
  { label: "REST endpoints", value: "130+" },
  { label: "Webhook event types", value: "100+" },
  { label: "Signed with", value: "HMAC-SHA256" },
];

/**
 * Full-width developer story block. Beams background + a 3D terminal card
 * with a realistic curl example. Pushes to integrate.zivvy.xyz/docs.
 */
export function DeveloperBlock() {
  return (
    <section
      id="developers"
      className="relative isolate overflow-hidden bg-slate-950 py-20 sm:py-28"
      aria-labelledby="developers-heading"
    >
      <BackgroundBeams className="opacity-90" />

      <div className="relative z-10 mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-2 md:items-center">
        <div>
          <BlurFade>
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur">
              <ShieldCheck className="size-3.5 text-emerald-400" />
              Built for developers too
            </div>
            <h2
              id="developers-heading"
              className="font-display text-3xl font-semibold tracking-tight text-white sm:text-5xl"
            >
              An ERP with real edges
              <br />
              you can build on.
            </h2>
            <p className="mt-4 max-w-md text-base text-white/70">
              130+ REST endpoints, HMAC-signed webhooks, 100+ event types.
              Same primitives your product team already ships against. No
              screen-scraping, no CSV export cron jobs.
            </p>
          </BlurFade>

          <BlurFade delay={0.15}>
            <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
              {DEV_STATS.map((stat) => (
                <div key={stat.label}>
                  <dt className="text-xs uppercase tracking-wide text-white/50">
                    {stat.label}
                  </dt>
                  <dd className="mt-1 font-display text-xl font-semibold text-white">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </BlurFade>

          <BlurFade delay={0.25}>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="polished">
                <a
                  href="https://integrate.zivvy.xyz/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Read the docs
                  <ArrowUpRight className="size-4" />
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              >
                <a
                  href="https://integrate.zivvy.xyz/docs/webhooks"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Webhook events
                </a>
              </Button>
            </div>
          </BlurFade>
        </div>

        <div className="flex justify-center md:justify-end">
          <CardContainer containerClassName="!py-0" className="w-full">
            <CardBody className="group/card relative !h-auto w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur">
              <CardItem
                translateZ={20}
                className="flex items-center gap-2 border-b border-white/10 pb-3"
              >
                <span className="size-2.5 rounded-full bg-rose-400/70" />
                <span className="size-2.5 rounded-full bg-amber-400/70" />
                <span className="size-2.5 rounded-full bg-emerald-400/70" />
                <span className="ml-3 text-xs text-white/50">
                  api.zivvy.xyz — curl
                </span>
              </CardItem>
              <CardItem
                translateZ={40}
                className="mt-4 block w-full font-mono text-[12px] leading-relaxed"
              >
                <pre className="whitespace-pre-wrap break-words">
                  {CURL_LINES.map((line, i) => (
                    <span
                      key={i}
                      className={
                        line.accent === "emerald"
                          ? "block text-emerald-300"
                          : line.accent === "cyan"
                          ? "block text-cyan-300"
                          : line.muted
                          ? "block text-white/50"
                          : "block text-white/90"
                      }
                    >
                      {line.text || " "}
                    </span>
                  ))}
                </pre>
              </CardItem>
              <CardItem
                translateZ={30}
                as="a"
                href="https://integrate.zivvy.xyz/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-medium text-white hover:bg-white/10"
              >
                Explore the reference
                <ArrowUpRight className="size-3.5" />
              </CardItem>
            </CardBody>
          </CardContainer>
        </div>
      </div>
    </section>
  );
}
