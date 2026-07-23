"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  Pencil,
  Plus,
  Trash2,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  getSavedViews,
  setActiveView,
  saveView,
  updateView,
  deleteView,
  type SavedView,
  type SavedViewStore
} from "@/lib/saved-views";

interface Props {
  doctype: string;
}

type DialogMode = null | "save" | "rename";

export function SavedViewsBar({ doctype }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [store, setStore] = useState<SavedViewStore>({ views: [], activeId: null });
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [editingView, setEditingView] = useState<SavedView | null>(null);
  const [viewName, setViewName] = useState("");

  useEffect(() => {
    setStore(getSavedViews(doctype));
  }, [doctype]);

  const currentQ = searchParams.get("q") ?? "";
  const currentSort = searchParams.get("sort") ?? "";
  const currentOrder = searchParams.get("order") ?? "";
  const currentFilters = searchParams.get("filters") ?? "";

  const currentFiltersArray: Array<[string, string, string, string | number | boolean]> = (() => {
    if (!currentFilters) return [];
    try { return JSON.parse(currentFilters); } catch { return []; }
  })();

  const hasActiveFilters = currentQ || currentFilters || currentSort;

  const applyView = useCallback((view: SavedView | null) => {
    setActiveView(doctype, view?.id ?? null);
    setStore(getSavedViews(doctype));

    const params = new URLSearchParams();
    if (view) {
      if (view.filters.length > 0) {
        params.set("filters", JSON.stringify(view.filters));
      }
      if (view.sortField) {
        params.set("sort", view.sortField);
        params.set("order", view.sortOrder ?? "DESC");
      }
      if (view.pageSize) {
        params.set("size", String(view.pageSize));
      }
    }
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : "?", { scroll: false });
  }, [doctype, router]);

  const handleSave = useCallback(() => {
    if (!viewName.trim()) return;
    if (dialogMode === "rename" && editingView) {
      updateView(doctype, editingView.id, { name: viewName.trim() });
    } else {
      saveView(doctype, {
        name: viewName.trim(),
        filters: currentFiltersArray,
        sortField: currentSort || undefined,
        sortOrder: (currentOrder as "ASC" | "DESC") || undefined,
        pageSize: searchParams.get("size") ? Number(searchParams.get("size")) : undefined
      });
    }
    setStore(getSavedViews(doctype));
    setDialogMode(null);
    setViewName("");
    setEditingView(null);
  }, [viewName, dialogMode, editingView, doctype, currentFiltersArray, currentSort, currentOrder, searchParams]);

  const handleDelete = useCallback((id: string) => {
    deleteView(doctype, id);
    setStore(getSavedViews(doctype));
  }, [doctype]);

  const openRename = useCallback((view: SavedView) => {
    setEditingView(view);
    setViewName(view.name);
    setDialogMode("rename");
  }, []);

  if (store.views.length === 0 && !hasActiveFilters) return null;

  return (
    <>
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <Button
          variant={!store.activeId ? "secondary" : "ghost"}
          size="sm"
          className={cn(
            "h-7 shrink-0 gap-1 rounded-full px-3 text-xs",
            !store.activeId && "font-medium"
          )}
          onClick={() => applyView(null)}
        >
          All
        </Button>

        {store.views.map((view) => (
          <div key={view.id} className="group relative flex shrink-0 items-center">
            <Button
              variant={store.activeId === view.id ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "h-7 gap-1 rounded-full px-3 text-xs",
                store.activeId === view.id && "font-medium"
              )}
              onClick={() => applyView(view)}
            >
              <BookmarkCheck className="size-3" />
              {view.name}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="absolute -right-1 -top-1 hidden size-5 rounded-full group-hover:flex"
                >
                  <ChevronDown className="size-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-36">
                <DropdownMenuItem onClick={() => openRename(view)}>
                  <Pencil className="size-3.5" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  updateView(doctype, view.id, {
                    filters: currentFiltersArray,
                    sortField: currentSort || undefined,
                    sortOrder: (currentOrder as "ASC" | "DESC") || undefined
                  });
                  setStore(getSavedViews(doctype));
                }}>
                  <Bookmark className="size-3.5" />
                  Update filters
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDelete(view.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 shrink-0 gap-1 rounded-full border border-dashed border-border px-3 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => {
              setViewName("");
              setEditingView(null);
              setDialogMode("save");
            }}
          >
            <Plus className="size-3" />
            Save view
          </Button>
        )}
      </div>

      <Dialog open={dialogMode !== null} onOpenChange={(o) => !o && setDialogMode(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "rename" ? "Rename view" : "Save current view"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid gap-1.5">
              <Label htmlFor="view-name">View name</Label>
              <Input
                id="view-name"
                value={viewName}
                onChange={(e) => setViewName(e.target.value)}
                placeholder="e.g. Overdue invoices"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
              />
            </div>
            {dialogMode === "save" && currentFiltersArray.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Saves current filters ({currentFiltersArray.length} active)
                {currentSort && `, sorted by ${currentSort}`}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogMode(null)}>
              Cancel
            </Button>
            <Button variant="polished" onClick={handleSave} disabled={!viewName.trim()}>
              {dialogMode === "rename" ? "Rename" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
