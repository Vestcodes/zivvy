import type { Metadata } from "next";
import { AutoForm } from "@/components/auto/auto-form";
import { InvoiceHero } from "@/components/sales/invoice-hero";
import { getMockInvoice } from "@/lib/mock-invoice";

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
  // The hardcrafted invoice hero is a READ view, not a create surface — it has
  // no business rendering the mock invoice under "SVC-EXAMPLE / Sample Customer"
  // when the user clicks "New invoice".
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

  // TODO(phase-2): when logged in, prefer getDoc("Sales Invoice", name) →
  //   real data; fall back to mock only in dev preview.
  const invoice = getMockInvoice(name);
  return <InvoiceHero invoice={invoice} />;
}
