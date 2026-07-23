export interface InvoiceItem {
  item_code: string;
  description: string;
  qty: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  name: string;
  customer: string;
  customer_email: string;
  posting_date: string;
  due_date: string;
  status: "Paid" | "Unpaid" | "Overdue" | "Draft" | "Cancelled";
  docstatus: 0 | 1 | 2;
  currency: string;
  items: InvoiceItem[];
  subtotal: number;
  tax_amount: number;
  total: number;
  amount_paid: number;
  outstanding: number;
  notes?: string;
  activity: Array<{ at: string; who: string; what: string }>;
}

const NOW = () => new Date();

function iso(daysOffset: number) {
  const d = new Date(Date.now() + daysOffset * 86400_000);
  return d.toISOString().slice(0, 10);
}

const DEMO_INVOICES: Record<string, Invoice> = {
  "INV-1024": {
    name: "INV-1024",
    customer: "Riven Analytics",
    customer_email: "billing@rivenanalytics.com",
    posting_date: iso(-25),
    due_date: iso(-12),
    status: "Overdue",
    docstatus: 1,
    currency: "USD",
    items: [
      {
        item_code: "SVC-CONSULT",
        description: "Strategy sprint — Q3 2026 (senior)",
        qty: 40,
        rate: 95,
        amount: 3800
      },
      {
        item_code: "SVC-REPORT",
        description: "Findings report + presentation",
        qty: 1,
        rate: 1000,
        amount: 1000
      }
    ],
    subtotal: 4800,
    tax_amount: 0,
    total: 4800,
    amount_paid: 0,
    outstanding: 4800,
    notes: "Net 15. Wire preferred. Late fee 1.5% per month.",
    activity: [
      { at: iso(-25) + "T09:12", who: "you@acme.co", what: "Invoice submitted" },
      { at: iso(-25) + "T09:13", who: "system", what: "Emailed to billing@rivenanalytics.com" },
      { at: iso(-11) + "T10:04", who: "system", what: "Reminder sent (past due)" },
      { at: iso(-4) + "T14:22", who: "you@acme.co", what: "Follow-up call logged" }
    ]
  },
  "INV-1031": {
    name: "INV-1031",
    customer: "Northline Ops",
    customer_email: "ap@northline.example",
    posting_date: iso(-19),
    due_date: iso(-5),
    status: "Overdue",
    docstatus: 1,
    currency: "USD",
    items: [
      {
        item_code: "SVC-RETAINER",
        description: "Monthly retainer — March",
        qty: 1,
        rate: 2150,
        amount: 2150
      }
    ],
    subtotal: 2150,
    tax_amount: 0,
    total: 2150,
    amount_paid: 0,
    outstanding: 2150,
    activity: [{ at: iso(-19) + "T09:00", who: "you@acme.co", what: "Invoice submitted" }]
  },
  "INV-1033": {
    name: "INV-1033",
    customer: "Solstice Co",
    customer_email: "finance@solstice.example",
    posting_date: iso(-1),
    due_date: iso(14),
    status: "Unpaid",
    docstatus: 1,
    currency: "USD",
    items: [
      {
        item_code: "SVC-DESIGN",
        description: "Rebrand — homepage + logo mark",
        qty: 1,
        rate: 6500,
        amount: 6500
      },
      {
        item_code: "SVC-CONSULT",
        description: "Discovery interviews (4x)",
        qty: 4,
        rate: 200,
        amount: 800
      }
    ],
    subtotal: 7300,
    tax_amount: 0,
    total: 7300,
    amount_paid: 0,
    outstanding: 7300,
    activity: [{ at: iso(-1) + "T15:44", who: "you@acme.co", what: "Invoice created and sent" }]
  }
};

export function getMockInvoice(name: string): Invoice {
  const explicit = DEMO_INVOICES[name];
  if (explicit) return explicit;
  // Generic fallback for any other name
  return {
    name,
    customer: "Sample Customer",
    customer_email: "billing@sample.example",
    posting_date: iso(-3),
    due_date: iso(11),
    status: "Unpaid",
    docstatus: 1,
    currency: "USD",
    items: [
      {
        item_code: "SVC-EXAMPLE",
        description: "Placeholder line item",
        qty: 1,
        rate: 1250,
        amount: 1250
      }
    ],
    subtotal: 1250,
    tax_amount: 0,
    total: 1250,
    amount_paid: 0,
    outstanding: 1250,
    activity: [{ at: NOW().toISOString().slice(0, 16), who: "you@acme.co", what: "Preview data" }]
  };
}
