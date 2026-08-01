import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface TenantInfo {
  name: string;
  site: string;
  tier: string;
  user: string;
  addons: string[];
}

interface CacheEntry {
  tenant: TenantInfo;
  expiresAt: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

@Injectable()
export class ApiKeyService {
  private readonly logger = new Logger(ApiKeyService.name);
  private readonly cache = new Map<string, CacheEntry>();
  private readonly frappeUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.frappeUrl = this.configService.get<string>('FRAPPE_URL', '');
  }

  async validateKey(apiKey: string): Promise<TenantInfo | null> {
    // Check cache first
    const cached = this.cache.get(apiKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.tenant;
    }

    // Evict expired entry
    if (cached) {
      this.cache.delete(apiKey);
    }

    if (!this.frappeUrl) {
      this.logger.error('FRAPPE_URL is not configured');
      throw new UnauthorizedException(
        'API key validation is not configured. Contact support.',
      );
    }

    try {
      const response = await fetch(
        `${this.frappeUrl}/api/method/zivvy_brand.api.keys.validate_api_key`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ api_key: apiKey }),
        },
      );

      if (!response.ok) {
        this.logger.warn(
          `API key validation failed with status ${response.status}`,
        );
        return null;
      }

      const data = (await response.json()) as Record<string, any>;
      const message = data?.message;

      if (!message || !message.valid) {
        return null;
      }

      const tenant: TenantInfo = {
        name: message.name,
        site: message.site,
        tier: message.tier,
        user: message.user,
        addons: Array.isArray(message.addons) ? message.addons : [],
      };

      // Cache the valid key
      this.cache.set(apiKey, {
        tenant,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });

      return tenant;
    } catch (error) {
      this.logger.error(`Failed to validate API key: ${error}`);
      throw new UnauthorizedException(
        'Unable to validate API key. Please try again later.',
      );
    }
  }
}
