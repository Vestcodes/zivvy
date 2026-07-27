import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { fetchBootinfo } from "@/lib/boot-server";
import { AppShell } from "@/components/app/app-shell";
import { AutoList } from "@/components/auto/auto-list";

export const metadata: Metadata = {
  title: "Warranty claims — Zivvy",
};

export default async function SupportWarrantyPage({
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
  const boot = await fetchBootinfo();
  if (!boot.logged_in) {
    redirect("/login?redirect-to=/support/warranty");
  }

  const sp = searchParams ? await searchParams : {};
  return (
    <AppShell>
      <AutoList
        doctype="Warranty Claim"
        basePath="/support/warranty"
        title="Warranty claims"
        searchParams={sp}
      />
    </AppShell>
  );
}
