"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Bookmark,
  BookmarkCheck,
  Check,
  ChevronDown,
  Pencil,
  Plus,
  Star,
  Trash2
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
  deleteView,
  findView,
  filtersToSearchParams,
  getSavedViews,
  saveView,
  setActiveView,
  updateView,
  type SavedView,
  type SavedViewStore,
  type Scope
} from "@/lib/saved-views";

interface Props {
  doctype: string;
  userEmail: string | null;
  tenantName: string | null;
}

type DialogMode = null | "save" | "rename";

function pickScope(doctype: string, userEmail: string | null, tenantName: string | null): Scope {
  return { doctype, userEmail, tenant: tenantName };
}

export function SavedViewsBar({ doctype, userEmail, tenantName }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scope = useMemo(() => pickScope(doctype, userEmail, tenantName), [doctype, userEmail, tenantName]);

  const [store, setStore] = useState<SavedViewStore>({ views: [], activeId: null });
  const [hydrated, setHydrated] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [editingView, setEditingView] = useState<SavedView | null>(null);
  const [viewName, setViewName] = useState("");
  const [asDefault, setAsDefault] = useState(false);

  // Hydrate from localStorage. Delayed until after mount so SSR shell matches.
  useEffect(() => {
    setStore(getSavedViews(scope));
    setHydrated(true);
  }, [scope]);

  const currentQ = searchParams.get("q") ?? "";
  const currentSort = searchParams.get("sort") ?? "";
  const currentOrder = searchParams.get("order") ?? "";
  const currentFilters = searchParams.get("filters") ?? "";
  const currentSize = searchParams.get("size") ?? "";
  const viewParam = searchParams.get("view") ?? "";

  const currentFiltersArray: Array<[string, string, string, string | number | boolean]> = useMemo(() => {
    if (!currentFilters) return [];
    try { return JSON.parse(currentFilters); } catch { return []; }
  }, [currentFilters]);

  const hasActiveParams = Boolean(currentQ || currentFilters || currentSort || currentSize);
  const activeIdMatchesUrl = viewParam && store.views.some((v) => v.id === viewParam);

  const applyView = useCallback(
    (view: SavedView | null) => {
      setActiveView(scope, view?.id ?? null);
      setStore(getSavedViews(scope));

      const params = new URLSearchParams();
      if (view) {
        const encoded = filtersToSearchParams(view);
        for (const [k, v] of Object.entries(encoded)) params.set(k, v);
        params.set("view", view.id);
      }
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : "?", { scroll: false });
    },
    [scope, router]
  );

  // Deep-link resolver: on hydrate, if ?view= is present but not yet applied,
  // resolve. If ?view= references a missing id → strip it and toast softly.
  // If URL is bare AND a default view exists → apply the default.
  useEffect(() => {
    if (!hydrated) return;
    if (viewParam) {
      if (activeIdMatchesUrl) return;
      const v = findView(scope, viewParam);
      if (!v) {
        const next = new URLSearchParams(searchParams);
        next.delete("view");
        const qs = next.toString();
        router.replace(qs ? `?${qs}` : "?", { scroll: false });
        // Silently fall back — the URL param referenced a view ID that
        // doesn't exist in this browser's local storage.
      }
      return;
    }
    // Bare URL → apply default if any.
    if (!hasActiveParams) {
      const def = store.views.find((v) => v.isDefault);
      if (def) applyView(def);
    }
    // Intentionally not chasing default when the user has typed a search —
    // that would fight their input.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, viewParam, activeIdMatchesUrl]);

  const activeView = store.views.find((v) => v.id === (activeIdMatchesUrl ? viewParam : store.activeId)) ?? null;

  const handleSave = useCallback(() => {
    const name = viewName.trim();
    if (!name) return;
    if (dialogMode === "rename" && editingView) {
      updateView(scope, editingView.id, { name });
    } else {
      const view = saveView(scope, {
        name,
        filters: currentFiltersArray,
        sortField: currentSort || undefined,
        sortOrder: (currentOrder as "ASC" | "DESC") || undefined,
        pageSize: currentSize ? Number(currentSize) : undefined,
        q: currentQ || undefined,
        isDefault: asDefault
      });
      // Rewrite URL to include ?view=<id>
      const params = new URLSearchParams(searchParams);
      params.set("view", view.id);
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : "?", { scroll: false });
    }
    setStore(getSavedViews(scope));
    setDialogMode(null);
    setViewName("");
    setEditingView(null);
    setAsDefault(false);
  }, [
    viewName,
    dialogMode,
    editingView,
    scope,
    currentFiltersArray,
    currentSort,
    currentOrder,
    currentSize,
    currentQ,
    asDefault,
    router,
    searchParams
  ]);

  const handleDelete = useCallback(
    (id: string) => {
      deleteView(scope, id);
      setStore(getSavedViews(scope));
      // If URL still points at deleted view, strip.
      if (viewParam === id) {
        const next = new URLSearchParams(searchParams);
        next.delete("view");
        const qs = next.toString();
        router.replace(qs ? `?${qs}` : "?", { scroll: false });
      }
    },
    [scope, viewParam, searchParams, router]
  );

  const toggleDefault = useCallback(
    (view: SavedView) => {
      updateView(scope, view.id, { isDefault: !view.isDefault });
      setStore(getSavedViews(scope));
    },
    [scope]
  );

  const openRename = useCallback((view: SavedView) => {
    setEditingView(view);
    setViewName(view.name);
    setDialogMode("rename");
  }, []);

  const openSave = useCallback(() => {
    setViewName("");
    setEditingView(null);
    setAsDefault(false);
    setDialogMode("save");
  }, []);

  if (!hydrated) return null;
  if (store.views.length === 0 && !hasActiveParams) return null;

  return (
    <>
      <div
        role="tablist"
        aria-label="Saved views"
        className="flex items-center gap-1.5 overflow-x-auto pb-1"
      >
        <Button
          role="tab"
          aria-selected={!activeView}
          variant={!activeView ? "secondary" : "ghost"}
          size="sm"
          className={cn(
            "h-7 shrink-0 gap-1 rounded-full px-3 text-xs",
            !activeView && "font-medium"
          )}
          onClick={() => applyView(null)}
        >
          All
        </Button>

        {store.views.map((view) => {
          const isActive = activeView?.id === view.id;
          return (
            <div key={view.id} className="group relative flex shrink-0 items-center">
              <Button
                role="tab"
                aria-selected={isActive}
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "h-7 gap-1 rounded-full px-3 text-xs",
                  isActive && "font-medium"
                )}
                onClick={() => applyView(view)}
              >
                {view.isDefault ? (
                  <Star className="size-3 fill-status-warning-fg text-status-warning-fg" />
                ) : (
                  <BookmarkCheck className="size-3" />
                )}
                {view.name}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="absolute -right-1 -top-1 hidden size-5 rounded-full group-hover:flex group-focus-within:flex"
                    aria-label={`Options for ${view.name}`}
                  >
                    <ChevronDown className="size-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-40">
                  <DropdownMenuItem onSelect={() => openRename(view)}>
                    <Pencil className="size-3.5" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      updateView(scope, view.id, {
                        filters: currentFiltersArray,
                        sortField: currentSort || undefined,
                        sortOrder: (currentOrder as "ASC" | "DESC") || undefined,
                        pageSize: currentSize ? Number(currentSize) : undefined,
                        q: currentQ || undefined
                      });
                      setStore(getSavedViews(scope));
                      toast.success(`Updated "${view.name}"`);
                    }}
                  >
                    <Bookmark className="size-3.5" />
                    Update filters
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => toggleDefault(view)}>
                    <Star className={cn("size-3.5", view.isDefault && "fill-current")} />
                    {view.isDefault ? "Remove default" : "Set as default"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => handleDelete(view.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}

        {hasActiveParams && !activeView && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 shrink-0 gap-1 rounded-full border border-dashed border-border px-3 text-xs text-muted-foreground hover:text-foreground"
            onClick={openSave}
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
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSave();
                  }
                }}
              />
            </div>
            {dialogMode === "save" && (
              <>
                <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={asDefault}
                    onChange={(e) => setAsDefault(e.target.checked)}
                    className="size-3.5 rounded border-border"
                  />
                  <Star className="size-3 text-status-warning-fg" />
                  Set as default view
                </label>
                {(currentFiltersArray.length > 0 || currentSort || currentQ) && (
                  <p className="rounded-md bg-muted/50 px-2 py-1.5 text-xs text-muted-foreground">
                    Captures{" "}
                    {[
                      currentQ && `search "${currentQ.slice(0, 24)}"`,
                      currentFiltersArray.length > 0 && `${currentFiltersArray.length} filter${currentFiltersArray.length === 1 ? "" : "s"}`,
                      currentSort && `sort by ${currentSort}`,
                      currentSize && `${currentSize}/page`
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
              </>
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
