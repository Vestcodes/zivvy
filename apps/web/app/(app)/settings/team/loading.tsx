import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="space-y-2">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-4 w-96" />
      </header>
      <Card className="border-border/70 bg-card/60">
        <CardContent className="flex items-center justify-between py-5">
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-2 w-48" />
          </div>
          <Skeleton className="h-9 w-32" />
        </CardContent>
      </Card>
      <Card className="border-border/70 bg-card p-0 shadow-sm">
        <div className="space-y-2 p-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
