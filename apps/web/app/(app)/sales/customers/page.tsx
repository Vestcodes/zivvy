import type { Metadata } from "next";
import { AutoList } from "@/components/auto/auto-list";

export const metadata: Metadata = {
  title: "Customers — Zivvy",
};

export default async function SalesCustomersPage({
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
      doctype="Customer"
      basePath="/sales/customers"
      title="Customers"
      searchParams={sp}
    />
  );
}
