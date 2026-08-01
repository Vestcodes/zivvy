import { Skeleton } from "@/components/ui/skeleton";

export default function ModuleRecordsLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-5" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading workspace records</span>
      <header className="flex flex-col gap-4 border-b border-border/70 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-64 max-w-[70vw]" />
          <Skeleton className="h-10 w-28" />
        </div>
      </header>
      <div className="hidden overflow-hidden rounded-xl border border-border/70 md:block">
        <div className="grid grid-cols-4 gap-4 border-b bg-secondary/35 p-4">
          {Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-4 w-24" />)}
        </div>
        {Array.from({ length: 7 }, (_, row) => (
          <div key={row} className="grid min-h-13 grid-cols-4 items-center gap-4 border-b px-4 last:border-b-0">
            {Array.from({ length: 4 }, (_, cell) => <Skeleton key={cell} className="h-4 w-3/4" />)}
          </div>
        ))}
      </div>
      <div className="grid gap-2 md:hidden">
        {Array.from({ length: 5 }, (_, row) => (
          <div key={row} className="space-y-3 rounded-xl border border-border/70 p-4">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
