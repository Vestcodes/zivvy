import {
  DashboardHeroSkeleton,
  KpiRowSkeleton,
  AttentionListSkeleton
} from "@/components/ui/skeleton-patterns";

export default function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <DashboardHeroSkeleton />
      <KpiRowSkeleton count={4} />
      <div className="grid gap-4 lg:grid-cols-3">
        <AttentionListSkeleton count={4} />
        <AttentionListSkeleton count={4} />
      </div>
    </div>
  );
}
