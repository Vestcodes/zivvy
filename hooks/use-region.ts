"use client";

/**
 * Client hook for reading the current region snapshot.
 *
 * Delegates to `<RegionProvider>` for the actual state; this exists
 * mostly to give consumers a stable import path (`@/hooks/use-region`)
 * that matches the sibling `use-mobile` / `use-notifications` convention.
 *
 * When called outside a provider (e.g. a Storybook mount or a component
 * that renders before the layout wires the provider), the return value
 * falls back to a USD/US snapshot with a no-op setter — same defaults
 * the middleware would eventually mint on the first real request.
 */

import { useRegionContext } from "@/components/pricing/region-provider";

export function useRegion() {
  return useRegionContext();
}
