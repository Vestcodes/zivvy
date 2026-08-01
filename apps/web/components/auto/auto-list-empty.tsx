"use client";

import Link from "next/link";
import { ArrowRight, Inbox, LogIn, Plus, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requestOpenNew } from "@/components/auto/auto-list-new-button";
import { singular } from "@/lib/next-action";

export function AutoListEmpty({
  title,
  basePath,
  reason,
  emptyState,
  moduleHref
}: {
  title: string;
  basePath: string;
  reason: "empty" | "auth" | "unavailable";
  emptyState?: string;
  moduleHref?: string;
}) {
  if (reason === "auth") {
    return (
      <Card className="border-border/70 bg-card">
        <CardContent className="flex flex-col items-center px-4 py-16 text-center">
          <div className="grid size-12 place-items-center rounded-full bg-secondary text-secondary-foreground">
            <LogIn className="size-5" />
          </div>
          <p className="mt-3 max-w-xs font-display text-lg break-words sm:max-w-sm">Sign in to load {title.toLowerCase()}</p>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground break-words sm:max-w-sm">
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
        <CardContent className="flex flex-col items-center px-4 py-16 text-center">
          <div className="grid size-12 place-items-center rounded-full bg-secondary text-muted-foreground">
            <Wrench className="size-5" />
          </div>
          <p className="mt-3 max-w-xs font-display text-lg break-words sm:max-w-sm">
            {title} couldn&apos;t be loaded
          </p>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground break-words sm:max-w-sm">
            Live data is unavailable. Check that the backend app is installed
            and your role has access, then retry.
          </p>
          <div className="mt-4 flex gap-2">
            <Button asChild variant="outline">
              <Link href={basePath}>Refresh</Link>
            </Button>
            <Button asChild variant="polished">
              <Link href="/help">Get help</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/70 bg-card">
      <CardContent className="flex flex-col items-center px-4 py-16 text-center">
        <div className="grid size-12 place-items-center rounded-full bg-secondary text-secondary-foreground">
          <Inbox className="size-5" />
        </div>
        <p className="mt-3 max-w-xs font-display text-lg break-words sm:max-w-sm">No {title.toLowerCase()} yet</p>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground break-words sm:max-w-sm">
          {emptyState ?? "Create the first record to begin this workflow. It will appear here."}
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
        {moduleHref ? (
          <Button asChild variant="ghost" className="mt-2">
            <Link href={moduleHref}>
              View module overview
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
