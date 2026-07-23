"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, MailCheck } from "lucide-react";
import { frappeSignup, FrappeError } from "@/lib/frappe-client";
import { toast } from "sonner";

const DATACENTERS = [
  { value: "india", label: "India (Mumbai)" },
  { value: "eu", label: "European Union (Frankfurt)" },
  { value: "us", label: "United States (Virginia)" }
] as const;

type Status = "idle" | "submitting" | "sent" | "already-registered";

export function SignUpForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [dc, setDc] = useState<"india" | "eu" | "us">("us");
  const [sentTo, setSentTo] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus("submitting");
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    try {
      const [statusCode, msg] = await frappeSignup({
        full_name: String(data.get("full_name") ?? "").trim(),
        email,
        company_name: String(data.get("company_name") ?? "").trim() || undefined,
        zivvy_datacenter: dc,
        redirect_to: "/dashboard"
      });
      setSentTo(email);
      setMessage(msg || "");
      setStatus(statusCode === 1 ? "sent" : "already-registered");
    } catch (err) {
      const errMsg = err instanceof FrappeError ? err.message : "Could not sign up.";
      setError(errMsg);
      toast.error(errMsg);
      setStatus("idle");
    }
  }

  if (status === "sent" || status === "already-registered") {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
          <MailCheck className="size-5" />
        </div>
        <div>
          <h3 className="font-display text-lg">
            {status === "sent" ? "Check your inbox" : "You already have an account"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {status === "sent" ? (
              <>
                We sent a welcome + verification link to{" "}
                <span className="font-medium text-foreground">{sentTo}</span>. Follow it
                to finish setting up your workspace.
              </>
            ) : (
              <>
                <span className="font-medium text-foreground">{sentTo}</span> is already
                registered. Sign in below, or use "Forgot?" to reset your password.
              </>
            )}
          </p>
          {message && status === "sent" && (
            <p className="mt-2 text-xs text-muted-foreground">{message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <a
            href={`/login`}
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
