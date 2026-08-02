"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  ClipboardCheck,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Receipt,
  User,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { frappeLogout } from "@/lib/frappe";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leave", label: "Leave", icon: CalendarDays },
  { href: "/attendance", label: "Attendance", icon: ClipboardCheck },
  { href: "/payslips", label: "Payslips", icon: CreditCard },
  { href: "/expenses", label: "Expenses", icon: Receipt },
] as const;

export function PortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    try {
      await frappeLogout();
    } catch {
      // clear cookies client-side
    }
    router.replace("/login");
  }

  return (
    <div className="flex min-h-dvh">
      {/* Sidebar — desktop */}
      <aside className="hidden w-56 shrink-0 border-r border-border bg-card md:block">
        <div className="flex h-12 items-center gap-2 border-b border-border px-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-b from-[#3db892] to-[#1b9872]">
            <span className="text-xs font-bold text-white">Z</span>
          </div>
          <span className="text-sm font-semibold tracking-tight">Portal</span>
        </div>
        <nav className="flex flex-col gap-0.5 p-2">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition",
                pathname === href
                  ? "bg-accent font-medium text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-border p-2">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-accent/60 hover:text-foreground"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-50 flex border-t border-border bg-card md:hidden">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px]",
              pathname === href
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
          {children}
        </div>
      </main>
    </div>
  );
}
