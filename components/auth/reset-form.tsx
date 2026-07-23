"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, MailCheck, Send } from "lucide-react";
import { frappeResetPassword, FrappeError } from "@/lib/frappe-client";

interface Props {
  onBack: () => void;
}

export function ResetForm({ onBack }: Props) {
  const [status, setStatus] = useState<"idle" | "submitting" | "sent">("idle");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus("submitting");
    try {
      await frappeResetPassword(email);
      setStatus("sent");
    } catch (err) {
      // Frappe intentionally does not disclose whether an account exists —
      // treat everything as success so we don't leak. Only surface true
      // network failures.
      if (err instanceof FrappeError && err.status >= 500) {
        setError("Something went wrong. Try again in a moment.");
        setStatus("idle");
        return;
      }
      setStatus("sent");
    }
  }

  if (status === "sent") {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
          <MailCheck className="size-5" />
        </div>
        <div>
          <h3 className="font-display text-lg">Check your inbox</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            If an account exists for <span className="font-medium text-foreground">{email}</span>, we've
            sent a password reset link. The link expires in 10 minutes.
          </p>
        </div>
        <div className="grid gap-2">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setStatus("idle")}
          >
            Try a different email
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={onBack}
          >
            <ArrowLeft />
            Back to sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <h3 className="font-display text-lg">Reset password</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your work email and we'll send a reset link.
        </p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="reset-email">Email</Label>
        <Input
          id="reset-email"
          type="email"
          required
          autoComplete="email"
          autoFocus
          placeholder="you@work.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={Boolean(error)}
        />
        {error && (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}
      </div>

      <Button
        type="submit"
        variant="polished"
        className="w-full"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? (
          "Sending…"
        ) : (
          <>
            Send reset link
            <Send className="size-4" />
          </>
        )}
      </Button>

      <div className="flex items-center justify-center">
        <Link
          href="/login"
          onClick={(e) => {
            e.preventDefault();
            onBack();
          }}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3" />
          Back to sign in
        </Link>
      </div>
    </form>
  );
}
