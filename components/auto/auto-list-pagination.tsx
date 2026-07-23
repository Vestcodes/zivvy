"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  page: number;
  pageSize: number;
  total: number | null;
  shownOnPage: number;
}

export function AutoListPagination({ page, pageSize, total, shownOnPage }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function goto(next: number) {
    const params = new URLSearchParams(searchParams);
    if (next <= 1) params.delete("page");
    else params.set("page", String(next));
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : "?", { scroll: false });
  }

  const from = (page - 1) * pageSize + (shownOnPage > 0 ? 1 : 0);
  const to = (page - 1) * pageSize + shownOnPage;
  const totalStr = total !== null ? total.toLocaleString() : "?";
  const hasPrev = page > 1;
  const hasNext = total !== null ? to < total : shownOnPage === pageSize;

  return (
    <footer className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
      <span className="font-mono tabular-nums">
        {shownOnPage === 0 ? "0 results" : `${from.toLocaleString()}–${to.toLocaleString()} of ${totalStr}`}
      </span>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={!hasPrev}
          onClick={() => goto(page - 1)}
          className="h-7 px-2"
        >
          <ChevronLeft className="size-4" />
          Prev
        </Button>
        <span className="px-2 font-mono tabular-nums">Page {page}</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={!hasNext}
          onClick={() => goto(page + 1)}
          className="h-7 px-2"
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </footer>
  );
}
