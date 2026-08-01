import { Injectable } from '@nestjs/common';
import { FrappeService } from '../../frappe/frappe.service';
import { TenantContext } from '../../common/interfaces/tenant-context.interface';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class ItemsService {
  constructor(private readonly frappe: FrappeService) {}

  async findAll(
    query: PaginationDto,
    filters: { item_group?: string; has_variants?: boolean; is_stock_item?: boolean },
    tenant: TenantContext,
  ) {
    const frappeFilters: Record<string, any> = {};
    if (filters.item_group) frappeFilters.item_group = filters.item_group;
    if (filters.has_variants !== undefined) frappeFilters.has_variants = filters.has_variants ? 1 : 0;
    if (filters.is_stock_item !== undefined) frappeFilters.is_stock_item = filters.is_stock_item ? 1 : 0;

    const orderBy = query.sort
      ? `${query.sort} ${query.order || 'desc'}`
      : 'modified desc';

    return this.frappe.getList('Item', {
      fields: [
        'name', 'item_code', 'item_name', 'item_group', 'stock_uom',
        'description', 'has_variants', 'is_stock_item', 'standard_rate',
        'image', 'modified',
      ],
      filters: frappeFilters,
      orderBy,
      limit: query.limit,
      offset: query.offset,
      tenant,
    });
  }

  async findOne(id: string, tenant: TenantContext) {
    return this.frappe.getDoc('Item', id, tenant);
  }

  async create(dto: CreateItemDto, tenant: TenantContext) {
    return this.frappe.createDoc('Item', dto as any, tenant);
  }

  async update(id: string, dto: UpdateItemDto, tenant: TenantContext) {
    return this.frappe.updateDoc('Item', id, dto as any, tenant);
  }

  async remove(id: string, tenant: TenantContext) {
    return this.frappe.deleteDoc('Item', id, tenant);
  }
}
