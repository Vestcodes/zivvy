"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { LayoutGrid, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type View = "table" | "board";

interface Props {
  currentView: View;
  boardAvailable: boolean;
}

/**
 * Small pill toggle above the AutoList that swaps between the tabular view
 * (default) and a status-grouped board view. Both routes stay URL-driven so
 * the server component can render the correct shape without client hydration
 * gymnastics.
 *
 * When boardAvailable=false (doctype has no status column) the board button
 * is disabled instead of hidden — telegraphs that Board is a real option,
 * just not for this doctype.
 */
export function AutoListViewToggle({ currentView, boardAvailable }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setView = (view: View) => {
    const params = new URLSearchParams(searchParams.toString());
    if (view === "table") params.delete("view");
    else params.set("view", view);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <div
      role="tablist"
      aria-label="List layout"
      className="inline-flex items-center gap-0.5 rounded-lg border border-border/70 bg-card p-0.5"
    >
      <Button
        type="button"
        role="tab"
        aria-selected={currentView === "table"}
        variant="ghost"
        size="sm"
        onClick={() => setView("table")}
        className={cn(
          "h-8 gap-1.5 rounded-md px-2.5 text-xs font-medium",
          currentView === "table"
            ? "bg-secondary text-secondary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Table2 className="size-3.5" />
        Table
      </Button>
      <Button
        type="button"
        role="tab"
        aria-selected={currentView === "board"}
        variant="ghost"
        size="sm"
        disabled={!boardAvailable}
        onClick={() => setView("board")}
        className={cn(
          "h-8 gap-1.5 rounded-md px-2.5 text-xs font-medium",
          currentView === "board"
            ? "bg-secondary text-secondary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
          !boardAvailable && "opacity-50"
        )}
        title={boardAvailable ? "Group by status" : "No status column on this record type"}
      >
        <LayoutGrid className="size-3.5" />
        Board
      </Button>
    </div>
  );
}
