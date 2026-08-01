import { redirect } from "next/navigation";
import { fetchBootinfo } from "@/lib/boot-server";
import { BootProvider } from "@/components/boot-provider";
import { AppShell } from "@/components/app/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const boot = await fetchBootinfo();
  if (!boot.logged_in) {
    redirect("/login?redirect-to=/dashboard");
  }

  return (
    <BootProvider bootinfo={boot}>
      <AppShell>{children}</AppShell>
    </BootProvider>
  );
}
