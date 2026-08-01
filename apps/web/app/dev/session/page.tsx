import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, KeyRound, Trash2 } from "lucide-react";

export const metadata: Metadata = { title: "Dev session — Zivvy" };

interface Props {
  searchParams: Promise<{ err?: string }>;
}

export default async function DevSessionPage({ searchParams }: Props) {
  if (process.env.NODE_ENV !== "development") notFound();

  const { err } = await searchParams;
  const cookieStore = await cookies();
  const currentSid = cookieStore.get("sid")?.value ?? "";

  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <Card className="border-border/70 bg-card shadow-sm">
        <CardHeader>
          <div className="grid size-10 place-items-center rounded-md bg-primary text-primary-foreground">
            <KeyRound className="size-5" />
          </div>
          <CardTitle className="mt-2 font-display text-2xl">Dev session</CardTitle>
          <CardDescription>
            Paste a Zivvy <code className="text-xs">sid</code> session cookie
            to preview authenticated pages locally. Never do this in production.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-secondary/50 p-3 text-xs">
            <p className="font-medium">How to get your sid</p>
            <ol className="mt-1.5 list-decimal space-y-1 pl-4 text-muted-foreground">
              <li>
                Sign in at{" "}
                <a
                  href="https://zivvy.xyz/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  zivvy.xyz/login
                </a>
              </li>
              <li>
                DevTools → Application → Cookies → <code>https://zivvy.xyz</code>
              </li>
              <li>
                Copy the <code>Value</code> of the <code>sid</code> row and paste it below.
              </li>
              <li>
                (Optional) also copy <code>csrf_token</code> to enable writes.
              </li>
            </ol>
          </div>

          {err === "missing" && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              Empty sid. Paste a value first.
            </div>
          )}

          {currentSid && (
            <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-xs">
              <p className="font-medium">Currently set</p>
              <p className="mt-0.5 font-mono text-muted-foreground">
                sid = {currentSid.slice(0, 24)}…{currentSid.slice(-6)}
              </p>
            </div>
          )}

          <form action="/api/dev/session" method="post" className="space-y-3">
            <div className="grid gap-2">
              <Label htmlFor="sid">Session ID (sid)</Label>
              <Input
                id="sid"
                name="sid"
                autoComplete="off"
                spellCheck={false}
                required
                placeholder="paste sid value"
                className="font-mono text-xs"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="csrf">
                CSRF token{" "}
                <span className="text-xs text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="csrf"
                name="csrf"
                autoComplete="off"
                spellCheck={false}
                placeholder="paste csrf_token (needed for writes)"
                className="font-mono text-xs"
              />
            </div>
            <Button type="submit" variant="polished" className="w-full">
              Set cookie and open /apps
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between text-xs">
          <Button asChild variant="ghost" size="sm">
            <Link href="/">Back to marketing</Link>
          </Button>
          {currentSid && (
            <form action="/api/dev/session" method="post">
              <input type="hidden" name="_method" value="DELETE" />
              <Button
                type="submit"
                formAction="/api/dev/session"
                formMethod="delete"
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 />
                Clear
              </Button>
            </form>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
