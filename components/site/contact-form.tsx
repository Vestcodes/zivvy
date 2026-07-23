"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Send } from "lucide-react";

type Status = "idle" | "submitting" | "sent" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    const data = new FormData(event.currentTarget);
    try {
      const res = await fetch("/api/method/zivvy_brand.analytics.contact.submit_contact", {
        method: "POST",
        credentials: "include",
        body: data
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus("sent");
      toast.success("Message received. We'll be in touch shortly.");
      event.currentTarget.reset();
    } catch (err) {
      setStatus("error");
      toast.error("Could not send. Try again in a moment.");
    }
  }

  return (
    <Card className="border-border/70 bg-card/60">
      <CardHeader>
        <CardTitle className="font-display">Send us a message</CardTitle>
        <CardDescription>Tell us what you're building or what's blocking you.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
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
