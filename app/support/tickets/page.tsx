import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { fetchBootinfo } from "@/lib/boot-server";
import { AppShell } from "@/components/app/app-shell";
import { AutoList } from "@/components/auto/auto-list";

export const metadata: Metadata = {
  title: "Tickets — Zivvy",
};

export default async function SupportTicketsPage({
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
    redirect("/login?redirect-to=/support/tickets");
  }

  const sp = searchParams ? await searchParams : {};
  return (
    <AppShell>
      <AutoList
        doctype="Issue"
        basePath="/support/tickets"
        title="Tickets"
        searchParams={sp}
      />
    </AppShell>
  );
}
