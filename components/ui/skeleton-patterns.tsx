import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function KpiCardSkeleton() {
  return (
    <Card className="border-border/70 bg-card shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-28" />
          </div>
          <Skeleton className="size-9 rounded-md" />
        </div>
        <Skeleton className="mt-3 h-3 w-32" />
      </CardContent>
    </Card>
  );
}

export function KpiRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <KpiCardSkeleton key={i} />
      ))}
    </section>
  );
}

export function DashboardHeroSkeleton() {
  return (
    <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-36" />
        <Skeleton className="h-9 w-32" />
      </div>
    </section>
  );
}

export function ListRowSkeleton({ count = 8, cols = 4 }: { count?: number; cols?: number }) {
  return (
    <Card className="border-border/70 bg-card p-0 shadow-sm">
      <div className="border-b border-border/60 bg-secondary/40 px-6 py-3">
        <div className="flex gap-6">
          <Skeleton className="h-3 w-24" />
          {Array.from({ length: cols - 1 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-20" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-border/40">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-6 px-6 py-3">
            <Skeleton className="h-4 w-32 shrink-0" />
            {Array.from({ length: cols - 1 }).map((_, j) => (
              <Skeleton
                key={j}
                className={cn("h-4 shrink-0", j === 0 ? "w-40" : "w-20")}
              />
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}

export function AutoListSkeleton({ title }: { title?: string }) {
  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          {title ? (
            <h1 className="font-display text-2xl tracking-tight sm:text-3xl">{title}</h1>
          ) : (
            <Skeleton className="h-9 w-48" />
          )}
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-9 w-20" />
        </div>
      </header>
      <ListRowSkeleton count={8} cols={4} />
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
}

export function FormSectionSkeleton({ fields = 6 }: { fields?: number }) {
  return (
    <Card className="border-border/70 bg-card shadow-sm">
      <CardContent className="space-y-4 py-6">
        <Skeleton className="h-5 w-32" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="grid gap-4">
            {Array.from({ length: Math.ceil(fields / 2) }).map((_, i) => (
              <div key={i} className="grid gap-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </div>
          <div className="grid gap-4">
            {Array.from({ length: Math.floor(fields / 2) }).map((_, i) => (
              <div key={i} className="grid gap-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AutoFormSkeleton({ sections = 2 }: { sections?: number }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Skeleton className="size-8" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-9 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
      {Array.from({ length: sections }).map((_, i) => (
        <FormSectionSkeleton key={i} fields={i === 0 ? 8 : 4} />
      ))}
    </div>
  );
}

export function AttentionListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <Card className="border-border/70 bg-card shadow-sm">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-16" />
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-border/60">
          {Array.from({ length: count }).map((_, i) => (
            <li key={i} className="flex items-center gap-3 px-6 py-3">
              <Skeleton className="size-9 shrink-0 rounded-md" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-3 w-40" />
              </div>
              <Skeleton className="h-5 w-16 shrink-0 rounded-full" />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
