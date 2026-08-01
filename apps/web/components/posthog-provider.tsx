"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useBoot } from "@/components/boot-provider";
import { captureAnalyticsEvent, getPostHogClient } from "@/lib/analytics";

function PostHogPageview() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    let url = window.origin + pathname;
    const search = searchParams?.toString();
    if (search) url += `?${search}`;
    captureAnalyticsEvent("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}

function PostHogIdentify() {
  const boot = useBoot();

  useEffect(() => {
    void getPostHogClient().then((client) => {
      if (!client) return;
      if (boot.logged_in && boot.user?.name) {
        client.identify(boot.user.name, {
          email: boot.user.name,
          name: boot.user.full_name,
          tier: boot.zivvy?.tier ?? "free",
          tenant: boot.zivvy?.tenant?.tenant_name,
          company: boot.zivvy?.tenant?.company
        });
      } else {
        client.reset();
      }
    });
  }, [
    boot.logged_in,
    boot.user?.name,
    boot.user?.full_name,
    boot.zivvy?.tier,
    boot.zivvy?.tenant?.tenant_name,
    boot.zivvy?.tenant?.company
  ]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense>
        <PostHogPageview />
      </Suspense>
      <PostHogIdentify />
      {children}
    </>
  );
}
