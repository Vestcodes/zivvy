import "server-only";

import { cache } from "react";
import type { ZivvyTier } from "@/lib/boot-types";
import {
  DOCTYPE_MIN_TIER as FALLBACK_DOCTYPE_MIN_TIER,
  MODULE_MIN_TIER as FALLBACK_MODULE_MIN_TIER
} from "@/lib/plan-features";
import { FRAPPE_ORIGIN } from "@/lib/frappe-origin";

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
        next: { revalidate: 300 },
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
