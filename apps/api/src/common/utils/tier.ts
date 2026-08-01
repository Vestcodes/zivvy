import { ForbiddenException } from '@nestjs/common';
import { TenantContext } from '../interfaces/tenant-context.interface';

export const TIER_RANK: Record<string, number> = {
  free: 0,
  pro: 1,
  business: 2,
};

const TIER_LABELS: Record<string, string> = {
  free: 'Free',
  pro: 'Pro',
  business: 'Business',
};

/**
 * Assert that the tenant's tier meets the minimum required tier.
 * Throws ForbiddenException with an upgrade prompt when the tier is too low.
 */
export function requireTier(tenant: TenantContext, minTier: keyof typeof TIER_RANK): void {
  const tenantRank = TIER_RANK[tenant.tier] ?? 0;
  const requiredRank = TIER_RANK[minTier] ?? 0;
  if (tenantRank < requiredRank) {
    throw new ForbiddenException(
      `This resource requires the ${TIER_LABELS[minTier]} plan. ` +
        `Upgrade at https://zivvy.xyz/billing to access ${TIER_LABELS[minTier]}-tier features.`,
    );
  }
}
