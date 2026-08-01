import { Injectable } from '@nestjs/common';
import { FrappeService } from '../../frappe/frappe.service';
import { TenantContext } from '../../common/interfaces/tenant-context.interface';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class LeadsService {
  constructor(private readonly frappe: FrappeService) {}

  async findAll(query: PaginationDto, tenant: TenantContext) {
    const orderBy = query.sort
      ? `${query.sort} ${query.order || 'desc'}`
      : 'modified desc';

    return this.frappe.getList('Lead', {
      fields: [
        'name', 'lead_name', 'email_id', 'phone',
        'company_name', 'source', 'status', 'modified',
      ],
      orderBy,
      limit: query.limit,
      offset: query.offset,
      tenant,
    });
  }

  async findOne(id: string, tenant: TenantContext) {
    return this.frappe.getDoc('Lead', id, tenant);
  }

  async create(dto: CreateLeadDto, tenant: TenantContext) {
    return this.frappe.createDoc('Lead', dto as any, tenant);
  }

  async update(id: string, dto: UpdateLeadDto, tenant: TenantContext) {
    return this.frappe.updateDoc('Lead', id, dto as any, tenant);
  }

  async remove(id: string, tenant: TenantContext) {
    return this.frappe.deleteDoc('Lead', id, tenant);
  }
}
