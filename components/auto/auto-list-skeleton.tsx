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
        <p className="text-sm text-muted-foreground">Couldn't load metadata.</p>
      </div>
      <Card className="border-border/70 bg-card">
        <CardContent className="flex flex-col items-center py-16 text-center">
          <div className="grid size-12 place-items-center rounded-full bg-secondary text-secondary-foreground">
            <AlertTriangle className="size-5 text-chart-2" />
          </div>
          <p className="mt-3 font-display text-lg">Can't load {title.toLowerCase()}</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            We couldn't reach your Zivvy workspace. This usually means you
            aren't signed in, or Zivvy is temporarily unavailable. Sign in to preview real data.
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
