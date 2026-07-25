import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

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
  { label: "Priority support", free: false, pro: true, business: true }
];

function Cell({ on, label }: { on: boolean; label: string }) {
  return (
    <span className="inline-flex items-center justify-center">
      {on ? (
        <Check
          className="size-5 text-primary"
          aria-label={`${label}: included`}
        />
      ) : (
        <Minus
          className="size-5 text-muted-foreground/50"
          aria-label={`${label}: not included`}
        />
      )}
    </span>
  );
}

/**
 * Feature matrix. Sticky `<thead>` — as the user scrolls the page, the
 * column labels ride along so it's always obvious which tier a column
 * belongs to. Body rows highlight on hover to make eye-tracking easier.
 */
export function PricingCompare() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
      <div className="text-center">
        <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          Compare plans
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Every capability, side by side. Hover a row to focus it.
        </p>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-border/70 bg-card/60 shadow-sm">
        <div className="relative overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="sticky top-0 z-10 border-b border-border/70 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/70">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Feature
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Free
                </th>
                <th
                  scope="col"
                  className={cn(
                    "px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide",
                    "text-primary"
                  )}
                >
                  Pro
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Business
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr
                  key={row.label}
                  className={cn(
                    "group border-b border-border/50 last:border-b-0",
                    "transition-colors hover:bg-primary/[0.04]"
                  )}
                >
                  <th
                    scope="row"
                    className="px-4 py-3 text-left font-medium text-foreground/90 group-hover:text-foreground"
                  >
                    {row.label}
                  </th>
                  <td className="px-4 py-3 text-center">
                    <Cell on={row.free} label={row.label} />
                  </td>
                  <td className="bg-primary/[0.03] px-4 py-3 text-center group-hover:bg-primary/[0.07]">
                    <Cell on={row.pro} label={row.label} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Cell on={row.business} label={row.label} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
