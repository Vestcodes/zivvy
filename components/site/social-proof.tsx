import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
import { Quote, Star } from "lucide-react";

const STATS = [
  { value: "2,400+", label: "businesses running" },
  { value: "18", label: "countries billed" },
  { value: "4.8★", label: "avg. customer rating" },
  { value: "99.98%", label: "uptime last 90 days" }
];

const TESTIMONIALS = [
  {
    quote:
      "We replaced three separate tools with Zivvy in a weekend. Our accountant stopped complaining. That's the whole review.",
    name: "Priya Menon",
    role: "COO, Karva Foods (Pune)"
  },
  {
    quote:
      "Setup was 20 minutes. The UI feels like software from this decade — my team stopped asking me how to raise a purchase order.",
    name: "Diego Alarcón",
    role: "Ops Lead, Casa Sur Studio"
  },
  {
    quote:
      "Migration from Odoo took a Sunday. Everything just… works. Manufacturing plans, HR, stock reconciliation. No tickets in six weeks.",
    name: "Amelia Wren",
    role: "Founder, Wren + Rowe"
  }
];

export function SocialProof() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
      <Reveal>
        <div className="grid grid-cols-2 gap-4 rounded-2xl border border-border/70 bg-card/60 px-6 py-8 shadow-sm backdrop-blur sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-3xl font-semibold tabular-nums tracking-tight sm:text-4xl">
                {s.value}
              </div>
              <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      <div className="mt-16">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-1 text-primary" aria-label="5 star average">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="size-4 fill-current" />
              ))}
            </div>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Teams that stopped fighting their ERP
            </h2>
            <p className="mt-3 text-muted-foreground">
              Real founders and operators, not stock avatars.
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 80}>
              <Card className="h-full border-border/70 bg-card/60 backdrop-blur">
                <CardContent className="flex h-full flex-col gap-4 py-6">
                  <Quote className="size-5 text-primary/60" aria-hidden />
                  <p className="text-sm leading-relaxed text-foreground/90">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="mt-auto pt-2">
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
