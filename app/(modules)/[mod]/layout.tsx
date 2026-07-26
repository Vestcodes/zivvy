import { notFound, redirect } from "next/navigation";
import { fetchBootinfo } from "@/lib/boot-server";
import { AppShell } from "@/components/app/app-shell";
import { MODULE_NAVS } from "@/components/app/sidebar-nav";

interface Props {
  children: React.ReactNode;
  params: Promise<{ mod: string }>;
}

/**
 * Dynamic module routes (`/crm`, `/purchases`, …) live outside `(app)` so an
 * unknown first segment can `notFound()` instead of soft-redirecting to login
 * via the authenticated layout.
 */
export default async function ModuleSegmentLayout({ children, params }: Props) {
  const { mod } = await params;
  if (!MODULE_NAVS[mod]) {
    notFound();
  }

  const boot = await fetchBootinfo();
  if (!boot.logged_in) {
    redirect(`/login?redirect-to=/${encodeURIComponent(mod)}`);
  }

  return <AppShell>{children}</AppShell>;
}
