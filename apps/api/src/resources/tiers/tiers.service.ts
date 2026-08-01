import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FrappeService } from '../../frappe/frappe.service';
import { TenantContext } from '../../common/interfaces/tenant-context.interface';

const M = {
  listTiers: 'zivvy_brand.billing.tier_checkout.list_tiers',
  getMySubscription: 'zivvy_brand.billing.tier_checkout.get_my_subscription',
  subscribeTier: 'zivvy_brand.billing.tier_checkout.subscribe_tier',
} as const;

type Billing = 'monthly' | 'annual';

@Injectable()
export class TiersService {
  private readonly logger = new Logger(TiersService.name);
  private readonly frappeUrl: string;

  constructor(
    private readonly frappe: FrappeService,
    private readonly configService: ConfigService,
  ) {
    this.frappeUrl = this.configService.get<string>(
      'FRAPPE_URL',
      'https://api.zivvy.xyz',
    );
  }

  /**
   * Public tier catalog — no tenant context required.
   */
  async listPublic(): Promise<any> {
    const url = `${this.frappeUrl}/api/method/${M.listTiers}`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        this.logger.warn(
          `Public list_tiers failed with status ${response.status}`,
        );
        throw new InternalServerErrorException(
          'Failed to load tier catalog. Please try again later.',
        );
      }

      const json = (await response.json()) as Record<string, any>;
      return json.message ?? json;
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error(
        `list_tiers request failed`,
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException(
        'Failed to load tier catalog. Please try again later.',
      );
    }
  }

  getMine(tenant: TenantContext) {
    return this.frappe.call(M.getMySubscription, {}, tenant);
  }

  subscribe(slug: string, billing: Billing, tenant: TenantContext) {
    if (!slug) {
      throw new BadRequestException('Tier slug is required.');
    }
    const normalized = slug.toLowerCase();
    if (normalized !== 'pro' && normalized !== 'business') {
      throw new BadRequestException('Tier must be "pro" or "business".');
    }
    const cadence = billing === 'annual' ? 'annual' : 'monthly';
    return this.frappe.call(
      M.subscribeTier,
      { tier: normalized, billing: cadence },
      tenant,
    );
  }
}
