import Link from "next/link";

const FAQ = [
  {
    q: "How does seat-based billing work?",
    a: "You pay only for the users you actively use. Add or remove seats anytime — proration is automatic."
  },
  {
    q: "Can I switch plans?",
    a: "Yes. Upgrade or downgrade whenever you like. Feature access updates immediately."
  },
  {
    q: "What happens on Free?",
    a: "You get 2 seats, sales, CRM, and basic stock. Enough to run a small operation. Upgrade when you outgrow it."
  },
  {
    q: "Where is data hosted?",
    a: "Choose India, EU, or US at signup. Your data stays in the region you pick."
  },
  {
    q: "Is there a contract?",
    a: (
      <>
        Monthly or annual (20% off). Cancel any time — no long-term lock-in. See{" "}
        <Link href="/terms" className="text-primary underline-offset-2 hover:underline">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/refunds" className="text-primary underline-offset-2 hover:underline">
          Billing &amp; Refunds
        </Link>
        .
      </>
    )
  },
  {
    q: "How do refunds work?",
    a: (
      <>
        Monthly plans cancel any time — you keep access through the paid period. Annual plans are
        refundable for 30 days. Full policy on{" "}
        <Link href="/refunds" className="text-primary underline-offset-2 hover:underline">
          Billing &amp; Refunds
        </Link>
        .
      </>
    )
  }
];

export function PricingFaq() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
      <h2 className="text-center font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        Common questions
      </h2>
      <dl className="mt-8 divide-y divide-border/60 rounded-lg border border-border/70 bg-card/60">
        {FAQ.map((item) => (
          <div key={item.q} className="px-5 py-5">
            <dt className="text-sm font-semibold">{item.q}</dt>
            <dd className="mt-1.5 text-sm text-muted-foreground">{item.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
