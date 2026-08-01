/**
 * localStorage-backed saved views per (user, tenant, doctype).
 *
 * The key includes a hash of the user email and the tenant slug so that:
 *   - Multi-user shared browsers don't leak views across accounts.
 *   - Switching tenants (org-per-tenant) scopes to that tenant's views.
 *
 * A missing user/tenant means "not signed in" — hydrated data is empty
 * and writes are no-ops (safer than falling back to a global key).
 */

const STORAGE_PREFIX = "zivvy:views:v2:";
const LEGACY_PREFIX = "zivvy:views:";

export interface SavedView {
  id: string;
  name: string;
  filters: Array<[string, string, string, string | number | boolean]>;
  sortField?: string;
  sortOrder?: "ASC" | "DESC";
  pageSize?: number;
  q?: string;
  isDefault?: boolean;
}

export interface SavedViewStore {
  views: SavedView[];
  activeId: string | null;
}

const EMPTY_STORE: SavedViewStore = { views: [], activeId: null };

export interface Scope {
  userEmail: string | null;
  tenant: string | null;
  doctype: string;
}

function hashKey(userEmail: string, tenant: string): string {
  // Non-cryptographic — we only need low-collision namespacing on a device.
  // DJB2 over the userEmail+tenant pair.
  const input = `${userEmail}|${tenant}`;
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) + h + input.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(36);
}

function storageKey(scope: Scope): string | null {
  if (!scope.userEmail || !scope.tenant) return null;
  return `${STORAGE_PREFIX}${hashKey(scope.userEmail, scope.tenant)}:${scope.doctype}`;
}

function read(scope: Scope): SavedViewStore {
  if (typeof window === "undefined") return { ...EMPTY_STORE };
  const key = storageKey(scope);
  if (!key) return { ...EMPTY_STORE };
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return { ...EMPTY_STORE };
    const parsed = JSON.parse(raw) as SavedViewStore;
    if (!Array.isArray(parsed.views)) return { ...EMPTY_STORE };
    return parsed;
  } catch {
    return { ...EMPTY_STORE };
  }
}

function write(scope: Scope, store: SavedViewStore): void {
  if (typeof window === "undefined") return;
  const key = storageKey(scope);
  if (!key) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(store));
  } catch {
    // quota exceeded or storage disabled — silently drop; the user will
    // see the tab strip return to its last-saved state, which is safer
    // than showing a phantom "saved" tab that isn't persisted.
  }
}

export function getSavedViews(scope: Scope): SavedViewStore {
  return read(scope);
}

export function getDefaultView(scope: Scope): SavedView | null {
  const store = read(scope);
  return store.views.find((v) => v.isDefault) ?? null;
}

export function setActiveView(scope: Scope, viewId: string | null): void {
  const store = read(scope);
  store.activeId = viewId;
  write(scope, store);
}

export function saveView(scope: Scope, view: Omit<SavedView, "id">): SavedView {
  const store = read(scope);
  const id = `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  const newView: SavedView = { ...view, id };
  // If this view is being saved as default, un-default all others.
  if (newView.isDefault) {
    store.views = store.views.map((v) => ({ ...v, isDefault: false }));
  }
  store.views.push(newView);
  store.activeId = id;
  write(scope, store);
  return newView;
}

export function updateView(
  scope: Scope,
  id: string,
  updates: Partial<Omit<SavedView, "id">>
): void {
  const store = read(scope);
  const idx = store.views.findIndex((v) => v.id === id);
  if (idx === -1) return;
  // If this view is being promoted to default, demote everything else.
  if (updates.isDefault === true) {
    store.views = store.views.map((v) => ({ ...v, isDefault: false }));
  }
  store.views[idx] = { ...store.views[idx], ...updates };
  write(scope, store);
}

export function deleteView(scope: Scope, id: string): void {
  const store = read(scope);
  store.views = store.views.filter((v) => v.id !== id);
  if (store.activeId === id) store.activeId = null;
  write(scope, store);
}

export function findView(scope: Scope, id: string): SavedView | null {
  const store = read(scope);
  return store.views.find((v) => v.id === id) ?? null;
}

export function filtersToSearchParams(view: SavedView | null): Record<string, string> {
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
  if (view.q) {
    params.q = view.q;
  }
  return params;
}

/**
 * Clear every zivvy saved-views entry from localStorage. Call on logout.
 * Also purges legacy (un-namespaced) keys from v1.
 */
export function purgeAllSavedViews(): void {
  if (typeof window === "undefined") return;
  const keys: string[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i);
    if (!k) continue;
    if (k.startsWith(STORAGE_PREFIX) || k.startsWith(LEGACY_PREFIX)) {
      keys.push(k);
    }
  }
  for (const k of keys) window.localStorage.removeItem(k);
}
