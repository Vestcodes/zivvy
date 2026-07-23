import { redirect } from "next/navigation";
import { fetchBootinfo } from "@/lib/boot-server";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/app/app-sidebar";
import { AppTopbar } from "@/components/app/app-topbar";
import { KeyboardShortcuts } from "@/components/app/keyboard-shortcuts";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const boot = await fetchBootinfo();
  if (!boot.logged_in) {
    redirect("/login?redirect-to=/dashboard");
  }

  return (
    <TooltipProvider delayDuration={200}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <AppTopbar />
          <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </SidebarInset>
        <KeyboardShortcuts />
      </SidebarProvider>
    </TooltipProvider>
  );
}
