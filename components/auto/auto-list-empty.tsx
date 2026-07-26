"use client";

import Link from "next/link";
import { Inbox, LogIn, Plus, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requestOpenNew } from "@/components/auto/auto-list-new-button";
import { singular } from "@/lib/next-action";

export function AutoListEmpty({
  title,
  basePath,
  reason
}: {
  title: string;
  basePath: string;
  reason: "empty" | "auth" | "unavailable";
}) {
  if (reason === "auth") {
    return (
      <Card className="border-border/70 bg-card">
        <CardContent className="flex flex-col items-center py-16 text-center">
          <div className="grid size-12 place-items-center rounded-full bg-secondary text-secondary-foreground">
            <LogIn className="size-5" />
          </div>
          <p className="mt-3 font-display text-lg">Sign in to load {title.toLowerCase()}</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            This view reads live data from your Zivvy workspace. Sign in with your
            work account to see records.
          </p>
          <Button asChild variant="polished" className="mt-4">
            <Link href="/login">
              <LogIn />
              Sign in
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (reason === "unavailable") {
    return (
      <Card className="border-border/70 bg-card">
        <CardContent className="flex flex-col items-center py-16 text-center">
          <div className="grid size-12 place-items-center rounded-full bg-secondary text-muted-foreground">
            <Lock className="size-5" />
          </div>
          <p className="mt-3 font-display text-lg">
            {title} aren&apos;t available yet
          </p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            This module may not be included in your current plan, or your session
            may have expired. Try refreshing, or upgrade your plan to unlock it.
          </p>
          <div className="mt-4 flex gap-2">
            <Button asChild variant="outline">
              <Link href={basePath}>Refresh</Link>
            </Button>
            <Button asChild variant="polished">
              <Link href="/billing">View plan</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/70 bg-card">
      <CardContent className="flex flex-col items-center py-16 text-center">
        <div className="grid size-12 place-items-center rounded-full bg-secondary text-secondary-foreground">
          <Inbox className="size-5" />
        </div>
        <p className="mt-3 font-display text-lg">No {title.toLowerCase()} yet</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Get started by creating your first record. It'll appear here.
        </p>
        <Button
          type="button"
          variant="polished"
          className="mt-4"
          onClick={() => requestOpenNew()}
        >
          <Plus />
          New {singular(title).toLowerCase()}
        </Button>
      </CardContent>
    </Card>
  );
}
