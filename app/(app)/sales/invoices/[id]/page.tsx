import type { Metadata } from "next";
import { AutoForm } from "@/components/auto/auto-form";
import { InvoiceHero } from "@/components/sales/invoice-hero";
import { getMockInvoice, type Invoice } from "@/lib/mock-invoice";
import { getDoc } from "@/lib/frappe-meta";
import { fetchBootinfo } from "@/lib/boot-server";

interface Props {
  params: Promise<{ id: string }>;
}

const BASE_PATH = "/sales/invoices";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const label = decodeURIComponent(id);
  if (label === "new") return { title: "New invoice — Zivvy" };
  return { title: `${label} — Invoices — Zivvy` };
}

export default async function SalesInvoicePage({ params }: Props) {
  const { id } = await params;
  const name = decodeURIComponent(id);

  // Blank create → generic AutoForm ("new" is the create sentinel across the app).
  if (name === "new") {
    return (
      <AutoForm
        doctype="Sales Invoice"
        name="new"
        basePath={BASE_PATH}
        title="New invoice"
      />
    );
  }

  // Prefer real Frappe data when logged in. Mock is a preview-only fallback —
  // showing sample data to signed-in customers is worse than showing the
  // generic AutoForm because it looks like real records that don't behave.
  const boot = await fetchBootinfo();
  if (boot.logged_in) {
    const doc = await getDoc("Sales Invoice", name);
    if (doc) {
      const invoice = mapFrappeInvoice(doc, name);
      if (invoice) return <InvoiceHero invoice={invoice} />;
    }
    // Real doc missing → fall through to AutoForm which renders "not found"
    // in a way that respects the current tenant permissions, instead of
    // showing a phantom mock invoice.
    return (
      <AutoForm
        doctype="Sales Invoice"
        name={name}
        basePath={BASE_PATH}
        title="Invoice"
      />
    );
  }

  // Signed-out preview only — for the marketing walkthrough.
  const invoice = getMockInvoice(name);
  return <InvoiceHero invoice={invoice} />;
}

interface FrappeInvoiceItem {
  item_code?: string;
  item_name?: string;
  description?: string;
  qty?: number;
  rate?: number;
  amount?: number;
}

interface FrappeInvoiceDoc {
  name?: string;
  customer?: string;
  customer_name?: string;
  contact_email?: string;
  posting_date?: string;
  due_date?: string;
  status?: string;
  docstatus?: 0 | 1 | 2;
  currency?: string;
  grand_total?: number;
  net_total?: number;
  total_taxes_and_charges?: number;
  paid_amount?: number;
  outstanding_amount?: number;
  remarks?: string;
  items?: FrappeInvoiceItem[];
}

const KNOWN_STATUS = new Set(["Paid", "Unpaid", "Overdue", "Draft", "Cancelled"]);

function mapFrappeInvoice(doc: unknown, id: string): Invoice | null {
  if (!doc || typeof doc !== "object") return null;
  const d = doc as FrappeInvoiceDoc;
  const rawStatus = d.status ?? "Unpaid";
  const status = (KNOWN_STATUS.has(rawStatus) ? rawStatus : "Unpaid") as Invoice["status"];
  return {
    name: d.name ?? id,
    customer: d.customer_name ?? d.customer ?? "—",
    customer_email: d.contact_email ?? "",
    posting_date: d.posting_date ?? "",
    due_date: d.due_date ?? "",
    status,
    docstatus: (d.docstatus ?? 0) as 0 | 1 | 2,
    currency: d.currency ?? "USD",
    items: (d.items ?? []).map((i) => ({
      item_code: i.item_code ?? "",
      description: i.item_name ?? i.description ?? "",
      qty: i.qty ?? 0,
      rate: i.rate ?? 0,
      amount: i.amount ?? 0
    })),
    subtotal: d.net_total ?? 0,
    tax_amount: d.total_taxes_and_charges ?? 0,
    total: d.grand_total ?? 0,
    amount_paid: d.paid_amount ?? 0,
    outstanding: d.outstanding_amount ?? 0,
    notes: d.remarks,
    activity: []
  };
}
