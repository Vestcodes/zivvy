/**
 * localStorage-backed saved views per doctype.
 * Each view stores a name, filters, sort config, and page size.
 */

export interface SavedView {
  id: string;
  name: string;
  filters: Array<[string, string, string, string | number | boolean]>;
  sortField?: string;
  sortOrder?: "ASC" | "DESC";
  pageSize?: number;
}

export interface SavedViewStore {
  views: SavedView[];
  activeId: string | null;
}

const STORAGE_PREFIX = "zivvy:views:";

function storageKey(doctype: string): string {
  return `${STORAGE_PREFIX}${doctype}`;
}

function read(doctype: string): SavedViewStore {
  if (typeof window === "undefined") return { views: [], activeId: null };
  try {
    const raw = localStorage.getItem(storageKey(doctype));
    if (!raw) return { views: [], activeId: null };
    return JSON.parse(raw) as SavedViewStore;
  } catch {
    return { views: [], activeId: null };
  }
}

function write(doctype: string, store: SavedViewStore) {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(doctype), JSON.stringify(store));
}

export function getSavedViews(doctype: string): SavedViewStore {
  return read(doctype);
}

export function getActiveView(doctype: string): SavedView | null {
  const store = read(doctype);
  if (!store.activeId) return null;
  return store.views.find((v) => v.id === store.activeId) ?? null;
}

export function setActiveView(doctype: string, viewId: string | null) {
  const store = read(doctype);
  store.activeId = viewId;
  write(doctype, store);
}

export function saveView(doctype: string, view: Omit<SavedView, "id">): SavedView {
  const store = read(doctype);
  const id = `v_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const newView: SavedView = { ...view, id };
  store.views.push(newView);
  store.activeId = id;
  write(doctype, store);
  return newView;
}

export function updateView(doctype: string, id: string, updates: Partial<Omit<SavedView, "id">>) {
  const store = read(doctype);
  const idx = store.views.findIndex((v) => v.id === id);
  if (idx === -1) return;
  store.views[idx] = { ...store.views[idx], ...updates };
  write(doctype, store);
}

export function deleteView(doctype: string, id: string) {
  const store = read(doctype);
  store.views = store.views.filter((v) => v.id !== id);
  if (store.activeId === id) store.activeId = null;
  write(doctype, store);
}

export function filtersToSearchParams(
  view: SavedView | null
): Record<string, string> {
  if (!view) return {};
  const params: Record<string, string> = {};
  if (view.filters.length > 0) {
    params.filters = JSON.stringify(view.filters);
  }
  if (view.sortField) {
    params.sort = view.sortField;
    params.order = view.sortOrder ?? "DESC";
  }
  if (view.pageSize) {
    params.size = String(view.pageSize);
  }
  return params;
}
