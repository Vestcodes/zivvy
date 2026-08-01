import { Suspense } from "react";
import { fetchNotifications, fetchUnreadCount } from "@/lib/notifications";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/app/app-sidebar";
import { AppTopbar } from "@/components/app/app-topbar";
import { KeyboardShortcuts } from "@/components/app/keyboard-shortcuts";

async function TopbarWithData() {
  const [notifications, unreadCount] = await Promise.all([
    fetchNotifications(20),
    fetchUnreadCount()
  ]);

  return (
    <AppTopbar
      notifications={notifications}
      unreadCount={unreadCount}
    />
  );
}

/** Authenticated desk chrome shared by `(app)` and `(modules)` layouts. */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delayDuration={200}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="min-w-0 overflow-x-hidden">
          <Suspense fallback={<AppTopbar />}>
            <TopbarWithData />
          </Suspense>
          <div className="flex min-w-0 flex-1 flex-col gap-4 p-4 md:p-5 lg:px-6 lg:py-5">
            {children}
          </div>
        </SidebarInset>
        <KeyboardShortcuts />
      </SidebarProvider>
    </TooltipProvider>
  );
}
