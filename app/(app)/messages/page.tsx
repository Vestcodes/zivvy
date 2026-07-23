import type { Metadata } from "next";
import Link from "next/link";
import { MessagesSquare, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Messages — Zivvy" };

export default function MessagesPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 py-8">
      <div>
        <h1 className="font-display text-3xl tracking-tight">Messages</h1>
        <p className="mt-1 text-muted-foreground">
          Talk to your team, follow doc discussions, and get notified about mentions.
        </p>
      </div>

      <Card className="border-border/70 bg-card shadow-sm">
        <CardContent className="flex flex-col items-center py-14 text-center">
          <div className="bg-primary-gradient grid size-14 place-items-center rounded-2xl text-primary-foreground shadow-sm">
            <MessagesSquare className="size-6" strokeWidth={1.75} />
          </div>
          <h2 className="mt-4 font-display text-xl">Coming soon</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Team chat and doctype discussions land here in Phase 3. Meanwhile,
            comments on records still work — open any invoice, order, or item.
          </p>
          <div className="mt-5 flex gap-2">
            <Button asChild variant="outline">
              <Link href="/dashboard">
                Back to dashboard
              </Link>
            </Button>
            <Button asChild variant="polished">
              <Link href="/apps">
                All apps
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
