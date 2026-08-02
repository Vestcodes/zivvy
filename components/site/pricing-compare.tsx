import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

type Row = { label: string; free: boolean; pro: boolean; business: boolean };

interface Section {
  category: string;
  rows: Row[];
}

const SECTIONS: Section[] = [
  {
    category: "Sales & CRM",
    rows: [
      { label: "Leads, contacts & opportunities", free: true, pro: true, business: true },
      { label: "Quotations & sales orders", free: true, pro: true, business: true },
      { label: "Pipeline (Kanban)", free: true, pro: true, business: true },
      { label: "Sales invoicing", free: false, pro: true, business: true },
      { label: "POS / point of sale", free: false, pro: true, business: true },
    ],
  },
  {
    category: "Inventory & stock",
    rows: [
      { label: "Items & item groups", free: true, pro: true, business: true },
      { label: "Stock entries & movements", free: true, pro: true, business: true },
      { label: "Multi-warehouse & transfers", free: false, pro: true, business: true },
      { label: "Barcode workflows", free: false, pro: true, business: true },
      { label: "Serial & batch tracking", free: false, pro: true, business: true },
    ],
  },
  {
    category: "Accounting & tax",
    rows: [
      { label: "Chart of accounts", free: false, pro: true, business: true },
      { label: "Journal & payment entries", free: false, pro: true, business: true },
      { label: "Tax templates & GST/VAT", free: false, pro: true, business: true },
      { label: "Financial reports", free: false, pro: true, business: true },
    ],
  },
  {
    category: "Purchasing",
    rows: [
      { label: "Suppliers & supplier quotations", free: false, pro: true, business: true },
      { label: "Purchase orders & receipts", free: false, pro: true, business: true },
      { label: "Request for quotation (RFQ)", free: false, pro: true, business: true },
    ],
  },
  {
    category: "HR & people",
    rows: [
      { label: "Employees & departments", free: false, pro: true, business: true },
      { label: "Leave & attendance", free: false, pro: true, business: true },
      { label: "Payroll & salary slips", free: false, pro: true, business: true },
      { label: "Recruitment pipeline", free: false, pro: true, business: true },
      { label: "Expense claims", free: false, pro: true, business: true },
    ],
  },
  {
    category: "Projects",
    rows: [
      { label: "Projects & tasks", free: false, pro: true, business: true },
      { label: "Timesheets", free: false, pro: true, business: true },
    ],
  },
  {
    category: "Manufacturing & operations",
    rows: [
      { label: "Bills of materials (BOMs)", free: false, pro: true, business: true },
      { label: "Work orders & job cards", free: false, pro: false, business: true },
      { label: "Subcontracting", free: false, pro: false, business: true },
      { label: "Quality inspections", free: false, pro: false, business: true },
    ],
  },
  {
    category: "Assets & enterprise",
    rows: [
      { label: "Fixed assets & depreciation", free: false, pro: false, business: true },
      { label: "Asset maintenance", free: false, pro: false, business: true },
      { label: "Multiple companies", free: false, pro: false, business: true },
      { label: "Analytics & insights (BI)", free: false, pro: false, business: true },
      { label: "Webshop / e-commerce", free: false, pro: false, business: true },
    ],
  },
  {
    category: "Platform",
    rows: [
      { label: "Wiki / knowledge base", free: true, pro: true, business: true },
      { label: "REST API & webhooks", free: true, pro: true, business: true },
      { label: "Region-pinned data (IN/EU/US)", free: true, pro: true, business: true },
      { label: "Helpdesk & tickets", free: false, pro: true, business: true },
      { label: "Priority support", free: false, pro: true, business: true },
    ],
  },
  {
    category: "Seats",
    rows: [
      { label: "Included seats", free: true, pro: true, business: true },
    ],
  },
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

function SeatCell({ tier }: { tier: "free" | "pro" | "business" }) {
  const label = tier === "free" ? "1" : "Unlimited";
  return (
    <span className="text-sm font-medium tabular-nums">
      {label}
    </span>
  );
}

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
              {SECTIONS.map((section) => (
                <>
                  <tr key={`cat-${section.category}`}>
                    <td
                      colSpan={4}
                      className="border-b border-border/50 bg-muted/30 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                    >
                      {section.category}
                    </td>
                  </tr>
                  {section.rows.map((row) => {
                    const isSeats = section.category === "Seats";
                    return (
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
                          {isSeats ? <SeatCell tier="free" /> : <Cell on={row.free} label={row.label} />}
                        </td>
                        <td className="bg-primary/[0.03] px-4 py-3 text-center group-hover:bg-primary/[0.07]">
                          {isSeats ? <SeatCell tier="pro" /> : <Cell on={row.pro} label={row.label} />}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {isSeats ? <SeatCell tier="business" /> : <Cell on={row.business} label={row.label} />}
                        </td>
                      </tr>
                    );
                  })}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
