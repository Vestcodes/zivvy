import { Suspense } from "react";
import { redirect } from "next/navigation";
import { fetchBootinfo } from "@/lib/boot-server";
import { fetchNotifications, fetchUnreadCount } from "@/lib/notifications";
import { fetchUnreadChatCount } from "@/lib/raven-unread";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/app/app-sidebar";
import { AppTopbar } from "@/components/app/app-topbar";
import { KeyboardShortcuts } from "@/components/app/keyboard-shortcuts";

async function TopbarWithData() {
  const [notifications, unreadCount, unreadChat] = await Promise.all([
    fetchNotifications(20),
    fetchUnreadCount(),
    fetchUnreadChatCount()
  ]);

  return (
    <AppTopbar
      notifications={notifications}
      unreadCount={unreadCount}
      unreadChat={unreadChat}
    />
  );
}

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
          <Suspense fallback={<AppTopbar />}>
            <TopbarWithData />
          </Suspense>
          <div className="flex flex-1 flex-col gap-4 p-4 md:p-5 lg:px-6 lg:py-5">
            {children}
          </div>
        </SidebarInset>
        <KeyboardShortcuts />
      </SidebarProvider>
    </TooltipProvider>
  );
}
