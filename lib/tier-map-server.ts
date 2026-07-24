import "server-only";

import { cache } from "react";
import type { ZivvyTier } from "@/lib/boot-types";
import {
  DOCTYPE_MIN_TIER as FALLBACK_DOCTYPE_MIN_TIER,
  MODULE_MIN_TIER as FALLBACK_MODULE_MIN_TIER
} from "@/lib/plan-features";

/**
 * Fetch the authoritative tier map from the backend.
 *
 * The backend's zivvy_brand.gating.tiers is the truth — the frontend's
 * lib/plan-features.ts is a fallback for when the endpoint isn't reachable
 * (during a deploy window or when the backend is down). React.cache dedupes
 * across the request tree; the payload is <5 KB so we don't bother caching
 * it beyond a single request.
 */

const FRAPPE_ORIGIN =
  process.env.FRAPPE_ORIGIN ||
  process.env.NEXT_PUBLIC_FRAPPE_ORIGIN ||
  "https://zivvy.xyz";

interface TierMap {
  module_min_tier: Record<string, ZivvyTier>;
  doctype_min_tier: Record<string, ZivvyTier>;
}

export const fetchTierMap = cache(_fetchTierMap);

async function _fetchTierMap(): Promise<TierMap> {
  try {
    const res = await fetch(
      `${FRAPPE_ORIGIN}/api/method/zivvy_brand.gating.api.get_tier_map`,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-Requested-With": "XMLHttpRequest"
        }
      }
    );
    if (!res.ok) return fallback();
    const json = (await res.json()) as {
      message?: {
        module_min_tier?: Record<string, ZivvyTier>;
        doctype_min_tier?: Record<string, ZivvyTier>;
      };
    };
    const msg = json.message;
    if (!msg) return fallback();
    return {
      module_min_tier: msg.module_min_tier ?? FALLBACK_MODULE_MIN_TIER,
      doctype_min_tier: msg.doctype_min_tier ?? FALLBACK_DOCTYPE_MIN_TIER
    };
  } catch {
    return fallback();
  }
}

function fallback(): TierMap {
  return {
    module_min_tier: FALLBACK_MODULE_MIN_TIER,
    doctype_min_tier: FALLBACK_DOCTYPE_MIN_TIER
  };
}
