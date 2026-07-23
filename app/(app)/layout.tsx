import { redirect } from "next/navigation";
import { fetchBootinfo } from "@/lib/boot-server";
import { fetchNotifications, fetchUnreadCount } from "@/lib/notifications";
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

  const [notifications, unreadCount] = await Promise.all([
    fetchNotifications(20),
    fetchUnreadCount()
  ]);

  return (
    <TooltipProvider delayDuration={200}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <AppTopbar notifications={notifications} unreadCount={unreadCount} />
          <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </SidebarInset>
        <KeyboardShortcuts />
      </SidebarProvider>
    </TooltipProvider>
  );
}
