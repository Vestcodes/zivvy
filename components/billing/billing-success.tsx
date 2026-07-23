"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { getMyPlan, type MyPlan } from "@/lib/billing-client";

type Status = "polling" | "confirmed" | "timeout";

const MAX_ATTEMPTS = 6;
const INTERVAL_MS = 1800;

export function BillingSuccess() {
  const [status, setStatus] = useState<Status>("polling");
  const [plan, setPlan] = useState<MyPlan | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function poll(n: number) {
      if (cancelled) return;
      try {
        const p = await getMyPlan();
        setPlan(p);
        const active = p.subscription_status === "active" || p.subscription_status === "trialing";
        if (active && p.tier !== "free") {
          setStatus("confirmed");
          return;
        }
      } catch {
        // swallow — network hiccups shouldn't kill the poll
      }
      if (n >= MAX_ATTEMPTS - 1) {
        setStatus("timeout");
        return;
      }
      setAttempt(n + 1);
      setTimeout(() => poll(n + 1), INTERVAL_MS);
    }

    poll(0);
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "confirmed" && plan) {
    return (
      <Card className="border-border/70 bg-card/60 text-center">
        <CardHeader>
          <CheckCircle2
            className="mx-auto size-10 text-primary"
            aria-hidden
          />
          <CardTitle className="mt-2 font-display text-2xl">
            You're on {plan.tier_label}
          </CardTitle>
          <CardDescription>
            {plan.seats_allowed} seats included. Access unlocked.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild variant="polished">
              <Link href="/dashboard">Go to dashboard</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/billing">View billing</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status === "timeout") {
    return (
      <Card className="border-border/70 bg-card/60 text-center">
        <CardHeader>
          <AlertCircle
            className="mx-auto size-10 text-amber-500"
            aria-hidden
          />
          <CardTitle className="mt-2 font-display text-2xl">
            Almost there
          </CardTitle>
          <CardDescription>
            Polar hasn't confirmed your plan yet. This can take a minute — refresh below or head to billing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button onClick={() => window.location.reload()} variant="polished">
              Check again
            </Button>
            <Button asChild variant="outline">
              <Link href="/billing">Go to billing</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/70 bg-card/60 text-center">
      <CardHeader>
        <Loader2 className="mx-auto size-10 animate-spin text-primary" aria-hidden />
        <CardTitle className="mt-2 font-display text-2xl">
          Confirming your subscription
        </CardTitle>
        <CardDescription>
          One second — waiting on Polar to sync your new plan.
          <br />
          <span className="text-xs">Attempt {attempt + 1} of {MAX_ATTEMPTS}</span>
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
