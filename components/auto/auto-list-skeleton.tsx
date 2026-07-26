import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function AutoListSkeleton({
  title,
  basePath,
  reason
}: {
  title: string;
  basePath: string;
  reason: "unavailable";
}) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl tracking-tight sm:text-3xl">{title}</h1>
        <p className="text-sm text-muted-foreground">This module couldn&apos;t be loaded right now.</p>
      </div>
      <Card className="border-border/70 bg-card">
        <CardContent className="flex flex-col items-center py-16 text-center">
          <div className="grid size-12 place-items-center rounded-full bg-secondary text-secondary-foreground">
            <AlertTriangle className="size-5 text-chart-2" />
          </div>
          <p className="mt-3 font-display text-lg">{title} couldn&apos;t be loaded</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Your session may have expired, or this module isn&apos;t available on your
            current plan. Try signing in again.
          </p>
          <div className="mt-4 flex gap-2">
            <Button asChild variant="outline">
              <Link href={basePath}>Retry</Link>
            </Button>
            <Button asChild variant="polished">
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
