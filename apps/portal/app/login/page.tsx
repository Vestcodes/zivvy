"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { frappeLogin, FrappeError } from "@/lib/frappe";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await frappeLogin(email, password);
      router.replace("/");
    } catch (err) {
      if (err instanceof FrappeError) {
        setError(err.serverMessages[0] ?? err.message);
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-b from-[#3db892] to-[#1b9872]">
            <span className="text-lg font-bold text-white">Z</span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Employee Portal</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in with your Zivvy credentials
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-10 w-full items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Powered by{" "}
          <a href="https://zivvy.xyz" className="underline underline-offset-2 hover:text-foreground" target="_blank" rel="noopener">
            Zivvy
          </a>
        </p>
      </div>
    </div>
  );
}
