const FAQ = [
  {
    q: "How does seat-based billing work?",
    a: "You pay only for the users you actively use. Add or remove seats anytime — proration is automatic through Polar."
  },
  {
    q: "Can I switch plans?",
    a: "Yes. Upgrade or downgrade whenever you like. Feature access updates immediately after Polar confirms the change."
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
    a: "No annual lock-in. Monthly, cancel any time."
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
