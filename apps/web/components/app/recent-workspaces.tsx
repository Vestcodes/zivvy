"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { MODULE_NAVS } from "@/components/app/sidebar-nav";

export const RECENT_WORKSPACES_KEY = "zivvy.recent-workspaces.v1";

export function readRecentWorkspaces(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(RECENT_WORKSPACES_KEY) ?? "[]");
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function rememberWorkspace(key: string) {
  if (!MODULE_NAVS[key] || key === "dashboard" || key === "settings") return;
  try {
    const next = [key, ...readRecentWorkspaces().filter((item) => item !== key)].slice(0, 5);
    localStorage.setItem(RECENT_WORKSPACES_KEY, JSON.stringify(next));
  } catch {
    // Browsers can disable localStorage. Recent work remains an optional aid.
  }
}

export function RecentWorkspaceTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const segment = pathname.split("/").filter(Boolean)[0] ?? "";
    if (segment) rememberWorkspace(segment);
  }, [pathname]);

  return null;
}
