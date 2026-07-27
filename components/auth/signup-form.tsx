"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, MailCheck, RefreshCw, AlertTriangle } from "lucide-react";
import { frappeSignup, frappeCall, FrappeError } from "@/lib/frappe-client";
import { toast } from "sonner";
import {
  stashPendingTier,
  type BillingCadence,
  type TierSlug,
} from "@/lib/tier-checkout";
import { trackSignupStarted, trackSignupCompleted } from "@/lib/analytics";

const DATACENTERS = [
  { value: "india", label: "India (Mumbai)" },
  { value: "eu", label: "European Union (Frankfurt)" },
  { value: "us", label: "United States (Virginia)" }
] as const;

type Status = "idle" | "submitting" | "sent" | "sent-no-email" | "already-registered";

interface Props {
  pendingPlan?: { tier: TierSlug; billing: BillingCadence } | null;
}

export function SignUpForm({ pendingPlan }: Props = {}) {
  const [status, setStatus] = useState<Status>("idle");
  const [dc, setDc] = useState<"india" | "eu" | "us">("us");
  const [sentTo, setSentTo] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  async function handleResend() {
    if (!sentTo || resending) return;
    setResending(true);
    try {
      const result = await frappeCall<[number, string]>(
        "zivvy_brand.auth.signup.resend_welcome_email",
        { email: sentTo }
      );
      if (result && Array.isArray(result) && result[0] === 1) {
        toast.success("Welcome email sent — check your inbox.");
        setStatus("sent");
      } else {
        toast.error(result?.[1] || "Could not send email. Try Forgot Password.");
      }
    } catch {
      toast.error("Could not resend. Try using Forgot Password instead.");
    } finally {
      setResending(false);
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus("submitting");
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    trackSignupStarted({ datacenter: dc, has_pending_plan: Boolean(pendingPlan) });
    try {
      const [statusCode, msg] = await frappeSignup({
        full_name: String(data.get("full_name") ?? "").trim(),
        email,
        company_name: String(data.get("company_name") ?? "").trim() || undefined,
        zivvy_datacenter: dc,
        redirect_to: "/dashboard"
      });
      // Stash paid-tier intent so /dashboard can pick it up after the user
      // finishes email verification and lands authenticated.
      if (pendingPlan) {
        stashPendingTier(pendingPlan);
      }
      setSentTo(email);
      setMessage(msg || "");
      if (statusCode === 1) {
        trackSignupCompleted({ datacenter: dc, pending_tier: pendingPlan?.tier });
        setStatus("sent");
      } else if (statusCode === 2) {
        trackSignupCompleted({ datacenter: dc, pending_tier: pendingPlan?.tier, email_failed: true });
        setStatus("sent-no-email");
      } else {
        setStatus("already-registered");
      }
    } catch (err) {
      const errMsg = err instanceof FrappeError ? err.message : "Could not sign up.";
      setError(errMsg);
      toast.error(errMsg);
      setStatus("idle");
    }
  }

  if (status === "sent" || status === "sent-no-email" || status === "already-registered") {
    const emailFailed = status === "sent-no-email";
    return (
      <div className="space-y-4 text-center">
        <div className={`mx-auto grid size-12 place-items-center rounded-full ${emailFailed ? "bg-amber-500/10 text-amber-600" : "bg-primary/10 text-primary"}`}>
          {emailFailed ? <AlertTriangle className="size-5" /> : <MailCheck className="size-5" />}
        </div>
        <div>
          <h3 className="font-display text-lg">
            {emailFailed
              ? "Account created"
              : status === "sent"
                ? "Check your inbox"
                : "You already have an account"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {emailFailed ? (
              <>
                Your workspace is ready, but we couldn&apos;t deliver the welcome email to{" "}
                <span className="font-medium text-foreground">{sentTo}</span>. Tap
                &quot;Resend&quot; below, or use Forgot Password to set a login link.
              </>
            ) : status === "sent" ? (
              <>
                We sent a welcome + verification link to{" "}
                <span className="font-medium text-foreground">{sentTo}</span>. Follow it
                to finish setting up your workspace.
              </>
            ) : (
              <>
                <span className="font-medium text-foreground">{sentTo}</span> is already
                registered. Sign in below, or use &quot;Forgot?&quot; to reset your password.
              </>
            )}
          </p>
          {pendingPlan && (status === "sent" || emailFailed) && (
            <p className="mt-3 text-xs text-muted-foreground">
              Your {pendingPlan.tier === "pro" ? "Pro" : "Business"} plan is queued —
              we&apos;ll take you to checkout right after you sign in.
            </p>
          )}
        </div>
        <div className="grid gap-2">
          {(emailFailed || status === "sent") && (
            <Button
              type="button"
              variant={emailFailed ? "polished" : "outline"}
              className="w-full"
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? (
                "Sending…"
              ) : (
                <>
                  <RefreshCw className="size-3.5" />
                  {emailFailed ? "Resend welcome email" : "Didn’t get it? Resend"}
                </>
              )}
            </Button>
          )}
          <a
            href="/login"
            className="inline-flex h-9 w-full items-center justify-center rounded-md border border-input bg-background text-sm font-medium shadow-xs hover:bg-accent"
          >
            Go to sign in
          </a>
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setStatus("idle")}
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="signup-name">Full name</Label>
        <Input
          id="signup-name"
          name="full_name"
          required
          autoComplete="name"
          placeholder="Jane Doe"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="signup-email">Work email</Label>
        <Input
          id="signup-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@work.com"
          aria-invalid={Boolean(error)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="signup-company">Company name</Label>
        <Input
          id="signup-company"
          name="company_name"
          autoComplete="organization"
          placeholder="Acme (optional)"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="signup-dc">Data region</Label>
        <Select value={dc} onValueChange={(v) => setDc(v as typeof dc)}>
          <SelectTrigger id="signup-dc">
            <SelectValue placeholder="Choose a region" />
          </SelectTrigger>
          <SelectContent>
            {DATACENTERS.map((d) => (
              <SelectItem key={d.value} value={d.value}>
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Your business data stays in this region.
        </p>
      </div>
      {pendingPlan && (
        <p className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-primary">
          You picked the{" "}
          <span className="font-medium">
            {pendingPlan.tier === "pro" ? "Pro" : "Business"}
          </span>{" "}
          plan ({pendingPlan.billing}). We&apos;ll route you to Polar checkout after
          you verify your email.
        </p>
      )}
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" variant="polished" className="w-full" disabled={status === "submitting"}>
        {status === "submitting" ? "Creating account…" : (
          <>
            Create free account
            <ArrowRight className="size-4" />
          </>
        )}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        By continuing you agree to our{" "}
        <a href="/terms" className="underline hover:text-primary">Terms</a> and{" "}
        <a href="/privacy" className="underline hover:text-primary">Privacy Policy</a>.
      </p>
    </form>
  );
}
