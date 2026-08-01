import { Injectable } from '@nestjs/common';
import { FrappeService } from '../frappe/frappe.service';
import { TenantContext } from '../common/interfaces/tenant-context.interface';
import { PaginationDto } from '../common/dto/pagination.dto';
import { RESOURCES } from '../registry/resources';

@Injectable()
export class WebhooksService {
  constructor(private readonly frappe: FrappeService) {}

  async findAll(query: PaginationDto, tenant: TenantContext) {
    const { data, total } = await this.frappe.getList('Zivvy Webhook', {
      fields: ['name', 'url', 'events', 'label', 'enabled', 'created_by', 'modified'],
      orderBy: 'modified desc',
      limit: query.limit,
      offset: query.offset,
      tenant,
    });
    return {
      data: data.map(this.formatWebhook),
      meta: { total, limit: query.limit!, offset: query.offset! },
    };
  }

  async findOne(id: string, tenant: TenantContext) {
    const doc = await this.frappe.getDoc('Zivvy Webhook', id, tenant);
    return this.formatWebhook(doc);
  }

  async create(dto: { url: string; events: string[]; secret?: string; label?: string }, tenant: TenantContext) {
    const doc = await this.frappe.createDoc('Zivvy Webhook', {
      url: dto.url,
      events: JSON.stringify(dto.events),
      secret: dto.secret || '',
      label: dto.label || '',
      enabled: 1,
    }, tenant);
    return this.formatWebhook(doc);
  }

  async remove(id: string, tenant: TenantContext) {
    return this.frappe.deleteDoc('Zivvy Webhook', id, tenant);
  }

  async listDeliveries(webhookId: string, query: PaginationDto, tenant: TenantContext) {
    const { data, total } = await this.frappe.getList('Zivvy Webhook Delivery', {
      fields: ['name', 'webhook', 'event', 'status_code', 'success', 'response_time_ms', 'error', 'creation'],
      filters: { webhook: webhookId },
      orderBy: 'creation desc',
      limit: query.limit,
      offset: query.offset,
      tenant,
    });
    return {
      data,
      meta: { total, limit: query.limit!, offset: query.offset! },
    };
  }

  getEventCatalog() {
    const catalog: Record<string, string[]> = {};
    for (const res of RESOURCES) {
      if (res.events && res.events.length > 0) {
        catalog[res.slug] = res.events.map((e) => `${res.slug}.${e}`);
      }
    }

    const allEvents = Object.values(catalog).flat();

    return {
      events: allEvents,
      by_resource: catalog,
      wildcard: '*',
      total: allEvents.length,
    };
  }

  private formatWebhook(doc: any) {
    let events: string[] = [];
    try {
      events = typeof doc.events === 'string' ? JSON.parse(doc.events) : doc.events || [];
    } catch {
      events = [];
    }
    return {
      id: doc.name,
      url: doc.url,
      events,
      label: doc.label || null,
      enabled: Boolean(doc.enabled),
      created_at: doc.creation || doc.modified,
    };
  }
}
