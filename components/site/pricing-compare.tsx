import { Check, Minus } from "lucide-react";

type Row = { label: string; free: boolean; pro: boolean; business: boolean };

const ROWS: Row[] = [
  { label: "Sales & CRM", free: true, pro: true, business: true },
  { label: "Basic stock", free: true, pro: true, business: true },
  { label: "Full accounting & tax", free: false, pro: true, business: true },
  { label: "Full stock & warehouses", free: false, pro: true, business: true },
  { label: "HR & payroll", free: false, pro: true, business: true },
  { label: "Barcode workflows", free: false, pro: true, business: true },
  { label: "Projects", free: false, pro: true, business: true },
  { label: "Manufacturing & BOMs", free: false, pro: false, business: true },
  { label: "Assets & quality", free: false, pro: false, business: true },
  { label: "Subcontracting", free: false, pro: false, business: true },
  { label: "Multiple companies", free: false, pro: false, business: true },
  { label: "Priority support", free: false, pro: false, business: true }
];

function Cell({ on }: { on: boolean }) {
  return on ? (
    <Check className="mx-auto size-5 text-primary" />
  ) : (
    <Minus className="mx-auto size-5 text-muted-foreground/50" />
  );
}

export function PricingCompare() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
      <h2 className="text-center font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        Compare plans
      </h2>
      <div className="mt-8 overflow-hidden rounded-lg border border-border/70 bg-card/60">
        <table className="w-full text-sm">
          <thead className="border-b border-border/70 bg-muted/40">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Feature
              </th>
              <th className="px-4 py-3 text-center font-medium">Free</th>
              <th className="px-4 py-3 text-center font-medium">Pro</th>
              <th className="px-4 py-3 text-center font-medium">Business</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr
                key={row.label}
                className="border-b border-border/50 last:border-b-0"
              >
                <td className="px-4 py-3 text-left">{row.label}</td>
                <td className="px-4 py-3 text-center">
                  <Cell on={row.free} />
                </td>
                <td className="px-4 py-3 text-center">
                  <Cell on={row.pro} />
                </td>
                <td className="px-4 py-3 text-center">
                  <Cell on={row.business} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
