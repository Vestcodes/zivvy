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
  listAddons: 'zivvy_brand.api.addons.list_addons',
  listMyAddons: 'zivvy_brand.api.addons.list_my_addons',
  subscribe: 'zivvy_brand.api.addons.subscribe',
  cancel: 'zivvy_brand.api.addons.cancel',
} as const;

@Injectable()
export class AddonsService {
  private readonly logger = new Logger(AddonsService.name);
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
   * Public catalog — no tenant context required. Hits the Frappe backend
   * directly so anonymous callers can browse the available add-ons.
   */
  async listPublic(): Promise<any> {
    const url = `${this.frappeUrl}/api/method/${M.listAddons}`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        this.logger.warn(
          `Public list_addons failed with status ${response.status}`,
        );
        throw new InternalServerErrorException(
          'Failed to load add-on catalog. Please try again later.',
        );
      }

      const json = (await response.json()) as Record<string, any>;
      return json.message ?? json;
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error(
        `list_addons request failed`,
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException(
        'Failed to load add-on catalog. Please try again later.',
      );
    }
  }

  listMine(tenant: TenantContext) {
    return this.frappe.call(M.listMyAddons, {}, tenant);
  }

  subscribe(slug: string, tenant: TenantContext) {
    if (!slug) {
      throw new BadRequestException('Add-on slug is required.');
    }
    return this.frappe.call(M.subscribe, { addon_slug: slug }, tenant);
  }

  cancel(slug: string, tenant: TenantContext) {
    if (!slug) {
      throw new BadRequestException('Add-on slug is required.');
    }
    return this.frappe.call(M.cancel, { addon_slug: slug }, tenant);
  }
}
