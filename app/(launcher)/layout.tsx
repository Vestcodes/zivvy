import { redirect } from "next/navigation";
import { fetchBootinfo } from "@/lib/boot-server";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LauncherTopbar } from "@/components/app/launcher-topbar";

export default async function LauncherLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const boot = await fetchBootinfo();
  if (!boot.logged_in) {
    redirect("/login?redirect-to=/apps");
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex min-h-dvh flex-col">
        <LauncherTopbar />
        <main className="flex-1">{children}</main>
      </div>
    </TooltipProvider>
  );
}
