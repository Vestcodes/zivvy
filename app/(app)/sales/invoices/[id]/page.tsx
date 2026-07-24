import type { Metadata } from "next";
import { AutoForm } from "@/components/auto/auto-form";

interface Props {
  params: Promise<{ id: string }>;
}

const BASE_PATH = "/sales/invoices";
const DOCTYPE = "Sales Invoice";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const label = decodeURIComponent(id);
  if (label === "new") return { title: "New invoice — Zivvy" };
  return { title: `${label} — Invoices — Zivvy` };
}

/**
 * Sales Invoice detail — routes through the generic AutoForm like every other
 * doctype. The old hand-crafted invoice-hero.tsx was deleted because
 * per-doctype heroes don't scale to ERPNext's ~200 doctypes; the generic
 * AutoForm now carries a NextActionStrip + progressive field density that
 * lift ALL doctypes uniformly.
 */
export default async function SalesInvoicePage({ params }: Props) {
  const { id } = await params;
  const name = decodeURIComponent(id);
  return (
    <AutoForm
      doctype={DOCTYPE}
      name={name}
      basePath={BASE_PATH}
      title={name === "new" ? "New invoice" : "Invoice"}
    />
  );
}
