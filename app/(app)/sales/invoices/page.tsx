import type { Metadata } from "next";
import { AutoList } from "@/components/auto/auto-list";

export const metadata: Metadata = {
  title: "Invoices — Zivvy",
};

export default async function SalesInvoicesPage({
  searchParams,
}: {
  searchParams?: Promise<{
    q?: string;
    page?: string;
    size?: string;
    filters?: string;
    sort?: string;
    order?: string;
    new?: string;
  }>;
}) {
  const sp = searchParams ? await searchParams : {};
  return (
    <AutoList
      doctype="Sales Invoice"
      basePath="/sales/invoices"
      title="Invoices"
      searchParams={sp}
    />
  );
}
