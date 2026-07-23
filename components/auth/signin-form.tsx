"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LogIn, Mail } from "lucide-react";
import { frappeLogin, frappeSendLoginLink, FrappeError } from "@/lib/frappe-client";

interface Props {
  onForgotPassword?: () => void;
}

export function SignInForm({ onForgotPassword }: Props = {}) {
  const [pending, setPending] = useState(false);
  const [linkPending, setLinkPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    try {
      await frappeLogin(email, password);
      toast.success("Welcome back.");
      window.location.href = "/dashboard";
    } catch (err) {
      const msg = err instanceof FrappeError ? err.message : "Sign in failed.";
      toast.error(msg);
    } finally {
      setPending(false);
    }
  }

  async function onMagicLink() {
    const emailEl = document.querySelector<HTMLInputElement>("input[name=email]");
    const email = emailEl?.value.trim();
    if (!email) {
      toast.info("Enter your email above first.");
      emailEl?.focus();
      return;
    }
    setLinkPending(true);
    try {
      await frappeSendLoginLink(email);
      toast.success("Sign-in link sent. Check your email.");
    } catch (err) {
      const msg = err instanceof FrappeError ? err.message : "Could not send link.";
      toast.error(msg);
    } finally {
      setLinkPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="signin-email">Email</Label>
        <Input
          id="signin-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@work.com"
        />
      </div>
      <div className="grid gap-2">
        <div className="flex items-baseline justify-between">
          <Label htmlFor="signin-password">Password</Label>
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-xs text-muted-foreground underline-offset-2 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded"
          >
            Forgot?
          </button>
        </div>
        <Input
          id="signin-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
      </div>
      <Button type="submit" variant="polished" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : (
          <>
            Sign in
            <LogIn className="size-4" />
          </>
        )}
      </Button>
      <div className="flex items-center gap-3 py-2" aria-hidden>
        <span className="h-px flex-1 bg-border/60" />
        <span className="text-xs text-muted-foreground">or</span>
        <span className="h-px flex-1 bg-border/60" />
      </div>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={onMagicLink}
        disabled={linkPending}
      >
        <Mail className="size-4" />
        {linkPending ? "Sending link…" : "Email me a sign-in link"}
      </Button>
    </form>
  );
}
