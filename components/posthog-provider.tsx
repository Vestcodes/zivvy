"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";
import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useBoot } from "@/components/boot-provider";

const POSTHOG_KEY = "phc_nKbcH7nPVMYn2jgFoxrYbUnvsqqRAs9moHRtKQuBodbG";
const POSTHOG_HOST = "https://us.i.posthog.com";

if (typeof window !== "undefined" && !posthog.__loaded) {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: "identified_only",
    capture_pageview: false,
    capture_pageleave: true,
  });
}

function PostHogPageview() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ph = usePostHog();

  useEffect(() => {
    if (pathname && ph) {
      let url = window.origin + pathname;
      const search = searchParams?.toString();
      if (search) url += "?" + search;
      ph.capture("$pageview", { $current_url: url });
    }
  }, [pathname, searchParams, ph]);

  return null;
}

function PostHogIdentify() {
  const ph = usePostHog();
  const boot = useBoot();

  useEffect(() => {
    if (!ph) return;
    if (boot.logged_in && boot.user?.name) {
      ph.identify(boot.user.name, {
        email: boot.user.name,
        name: boot.user.full_name,
        tier: boot.zivvy?.tier ?? "free",
        tenant: boot.zivvy?.tenant?.tenant_name,
        company: boot.zivvy?.tenant?.company,
      });
    } else {
      ph.reset();
    }
  }, [ph, boot.logged_in, boot.user?.name]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <PHProvider client={posthog}>
      <Suspense>
        <PostHogPageview />
      </Suspense>
      <PostHogIdentify />
      {children}
    </PHProvider>
  );
}
