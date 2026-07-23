"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Send } from "lucide-react";

type Status = "idle" | "submitting" | "sent";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError(null);
    const data = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/method/zivvy_brand.analytics.contact.submit_contact", {
        method: "POST",
        credentials: "include",
        body: data
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus("sent");
    } catch (err) {
      setStatus("idle");
      setError("Couldn't send your message. Please try again in a moment.");
    }
  }

  if (status === "sent") {
    return (
      <Card className="border-border/70 bg-card/60">
        <CardContent className="flex flex-col items-center py-14 text-center" role="status" aria-live="polite">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="size-5" />
          </div>
          <h3 className="mt-3 font-display text-lg">Message received</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            We'll be in touch within one business day. Faster on Business.
          </p>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="mt-4 text-sm font-medium text-primary underline-offset-2 hover:underline"
          >
            Send another
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/70 bg-card/60">
      <CardHeader>
        <CardTitle className="font-display">Send us a message</CardTitle>
        <CardDescription>Tell us what you're building or what's blocking you.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required autoComplete="name" placeholder="Jane Doe" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@work.com"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              name="message"
              required
              rows={5}
              placeholder="Tell us about your business, or what you're evaluating…"
            />
          </div>
          <Button
            type="submit"
            variant="polished"
            className="w-full"
            disabled={status === "submitting"}
          >
            {status === "submitting" ? "Sending…" : (
              <>
                Send message
                <Send className="size-4" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
