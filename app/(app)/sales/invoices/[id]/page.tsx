import type { Metadata } from "next";
import { InvoiceHero } from "@/components/sales/invoice-hero";
import { getMockInvoice } from "@/lib/mock-invoice";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `${decodeURIComponent(id)} — Invoices — Zivvy` };
}

export default async function SalesInvoicePage({ params }: Props) {
  const { id } = await params;
  const name = decodeURIComponent(id);
  // TODO(phase-2): when logged in, prefer getDoc("Sales Invoice", name) →
  //   real data; fall back to mock only in dev preview.
  const invoice = getMockInvoice(name);
  return <InvoiceHero invoice={invoice} />;
}
