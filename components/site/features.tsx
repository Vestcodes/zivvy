import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
import {
  Banknote,
  Boxes,
  Factory,
  LineChart,
  Receipt,
  UsersRound
} from "lucide-react";

const FEATURES = [
  {
    icon: Receipt,
    title: "Sales & CRM",
    desc: "Quotes, orders, invoices, and a pipeline that stays out of your way."
  },
  {
    icon: Boxes,
    title: "Stock & inventory",
    desc: "Items, warehouses, batches, and serial numbers with real-time reconciliation."
  },
  {
    icon: Banknote,
    title: "Accounting",
    desc: "Books, tax, payments, and reports with sane defaults per region."
  },
  {
    icon: UsersRound,
    title: "HR & payroll",
    desc: "Employees, attendance, leave, payroll. Multi-tenant, seat-aware."
  },
  {
    icon: Factory,
    title: "Manufacturing",
    desc: "BOMs, work orders, job cards. Shop floor without spreadsheet chaos."
  },
  {
    icon: LineChart,
    title: "Reports that answer",
    desc: "Dashboards that show what you actually opened the app to check."
  }
];

export function Features() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Everything your team needs. Nothing more.
        </h2>
        <p className="mt-4 text-muted-foreground">
          Modules unlock as you grow. Start on Free, upgrade to Pro or Business when you actually need more.
        </p>
      </div>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, desc }, i) => (
          <Reveal key={title} delay={i * 60}>
            <Card
              className="border-border/70 bg-card/60 backdrop-blur transition-all duration-[var(--duration-base)] hover:-translate-y-0.5 hover:shadow-elevation-md"
            >
              <CardHeader>
                <div className="bg-primary-gradient mb-3 grid size-10 place-items-center rounded-md text-primary-foreground shadow-elevation-sm">
                  <Icon className="size-5" />
                </div>
                <CardTitle className="font-display text-lg">{title}</CardTitle>
                <CardDescription>{desc}</CardDescription>
              </CardHeader>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
