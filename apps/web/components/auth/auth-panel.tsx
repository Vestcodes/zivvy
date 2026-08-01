"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignInForm } from "@/components/auth/signin-form";
import { SignUpForm } from "@/components/auth/signup-form";
import { ResetForm } from "@/components/auth/reset-form";
import {
  isTierSlug,
  normalizeBilling,
  type BillingCadence,
  type TierSlug,
} from "@/lib/tier-checkout";

type Mode = "signin" | "signup" | "reset";

export function AuthPanel() {
  const [mode, setMode] = useState<Mode>("signin");
  const search = useSearchParams();

  // Pricing tiles link to /login?plan=<slug>&billing=<cadence>#signup so we
  // pick up the intent here and pass it down to the auth forms.
  const pendingPlan = useMemo<{ tier: TierSlug; billing: BillingCadence } | null>(() => {
    const planParam = search?.get("plan");
    if (!isTierSlug(planParam)) return null;
    return { tier: planParam, billing: normalizeBilling(search?.get("billing")) };
  }, [search]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const readHash = () => {
      const h = window.location.hash;
      if (h === "#signup") setMode("signup");
      else if (h === "#reset") setMode("reset");
      else setMode("signin");
    };
    readHash();
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, []);

  function updateHash(next: Mode) {
    setMode(next);
    if (typeof window !== "undefined") {
      const nextHash = next === "signin" ? "" : `#${next}`;
      const currentQuery = window.location.search;
      history.replaceState(
        null,
        "",
        `${window.location.pathname}${currentQuery}${nextHash}`
      );
    }
  }

  return (
    <Card className="w-full max-w-md border-border/70 bg-card/80 shadow-elevation-lg backdrop-blur">
      <CardContent className="pt-6">
        {mode === "reset" ? (
          <ResetForm onBack={() => updateHash("signin")} />
        ) : (
          <Tabs value={mode} onValueChange={(v) => updateHash(v as Mode)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="mt-6">
              <SignInForm
                onForgotPassword={() => updateHash("reset")}
                pendingPlan={pendingPlan}
              />
            </TabsContent>
            <TabsContent value="signup" className="mt-6">
              <SignUpForm pendingPlan={pendingPlan} />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
