import { Injectable } from '@nestjs/common';
import { FrappeService } from '../frappe/frappe.service';
import { TenantContext } from '../common/interfaces/tenant-context.interface';
import { PaginationDto } from '../common/dto/pagination.dto';

interface EventFilters {
  eventType?: string;
  resource?: string;
  since?: string;
}

@Injectable()
export class EventsService {
  constructor(private readonly frappe: FrappeService) {}

  async findAll(
    query: PaginationDto,
    filters: EventFilters,
    tenant: TenantContext,
  ) {
    const frappeFilters: Record<string, any> = {};

    if (filters.eventType) {
      frappeFilters.event_type = filters.eventType;
    }
    if (filters.resource) {
      frappeFilters.resource = filters.resource;
    }
    if (filters.since) {
      frappeFilters.creation = ['>=', filters.since];
    }

    const { data, total } = await this.frappe.getList('Zivvy Event Log', {
      fields: [
        'name', 'event_type', 'resource', 'resource_name',
        'payload', 'creation',
      ],
      filters: frappeFilters,
      orderBy: 'creation desc',
      limit: query.limit,
      offset: query.offset,
      tenant,
    });

    return {
      data: data.map((e: any) => ({
        id: e.name,
        event_type: e.event_type,
        resource: e.resource,
        resource_name: e.resource_name,
        payload: this.parsePayload(e.payload),
        created_at: e.creation,
      })),
      meta: { total, limit: query.limit!, offset: query.offset! },
    };
  }

  private parsePayload(payload: any) {
    if (!payload) return null;
    try {
      return typeof payload === 'string' ? JSON.parse(payload) : payload;
    } catch {
      return null;
    }
  }
}
