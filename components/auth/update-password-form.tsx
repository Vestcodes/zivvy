"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Eye, EyeOff, KeyRound } from "lucide-react";
import { frappeUpdatePassword, FrappeError } from "@/lib/frappe-client";

interface Props {
  resetKey: string;
}

export function UpdatePasswordForm({ resetKey }: Props) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const mismatch = confirm.length > 0 && password !== confirm;
  const tooShort = password.length > 0 && password.length < 8;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm || password.length < 8) return;

    setError(null);
    setStatus("submitting");
    try {
      await frappeUpdatePassword(resetKey, password);
      setStatus("done");
    } catch (err) {
      if (err instanceof FrappeError) {
        if (err.status === 404 || err.message.toLowerCase().includes("expired")) {
          setError("This reset link has expired. Please request a new one.");
        } else {
          setError(err.serverMessages[0] ?? err.message);
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <Card className="w-full max-w-md border-border/70 bg-card/80 shadow-elevation-lg backdrop-blur">
        <CardContent className="space-y-4 pt-6 text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="size-5" />
          </div>
          <div>
            <h3 className="font-display text-lg">Password updated</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Your password has been changed. You can now sign in with your new password.
            </p>
          </div>
          <Button
            variant="polished"
            className="w-full"
            onClick={() => router.push("/login")}
          >
            Sign in
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-border/70 bg-card/80 shadow-elevation-lg backdrop-blur">
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
              <KeyRound className="size-5" />
            </div>
            <h3 className="text-center font-display text-lg">Set new password</h3>
            <p className="mt-1 text-center text-sm text-muted-foreground">
              Choose a strong password for your account.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="new-password">New password</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                autoComplete="new-password"
                autoFocus
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {tooShort && (
              <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Confirm password</Label>
            <Input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              placeholder="Type it again"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              aria-invalid={mismatch || undefined}
            />
            {mismatch && (
              <p className="text-xs text-destructive">Passwords don't match</p>
            )}
          </div>

          {error && (
            <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}

          <Button
            type="submit"
            variant="polished"
            className="w-full"
            disabled={status === "submitting" || mismatch || tooShort || !password || !confirm}
          >
            {status === "submitting" ? "Updating…" : "Update password"}
          </Button>

          <div className="flex items-center justify-center">
            <Link
              href="/login"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Back to sign in
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
