"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { frappeSignup, FrappeError } from "@/lib/frappe-client";

const DATACENTERS = [
  { value: "india", label: "India (Mumbai)" },
  { value: "eu", label: "European Union (Frankfurt)" },
  { value: "us", label: "United States (Virginia)" }
] as const;

export function SignUpForm() {
  const [pending, setPending] = useState(false);
  const [dc, setDc] = useState<"india" | "eu" | "us">("us");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const data = new FormData(event.currentTarget);
    try {
      const [status, message] = await frappeSignup({
        full_name: String(data.get("full_name") ?? "").trim(),
        email: String(data.get("email") ?? "").trim(),
        company_name: String(data.get("company_name") ?? "").trim() || undefined,
        zivvy_datacenter: dc,
        redirect_to: "/dashboard"
      });
      if (status === 1) {
        toast.success(message || "Account created. Check your email.");
      } else {
        toast.info(message || "Already registered — check your email or sign in.");
      }
    } catch (err) {
      const msg = err instanceof FrappeError ? err.message : "Could not sign up.";
      toast.error(msg);
    } finally {
      setPending(false);
    }
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
      <Button type="submit" variant="polished" className="w-full" disabled={pending}>
        {pending ? "Creating account…" : (
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
