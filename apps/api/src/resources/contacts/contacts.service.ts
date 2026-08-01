import { Injectable } from '@nestjs/common';
import { FrappeService } from '../../frappe/frappe.service';
import { TenantContext } from '../../common/interfaces/tenant-context.interface';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class ContactsService {
  constructor(private readonly frappe: FrappeService) {}

  async findAll(query: PaginationDto, tenant: TenantContext) {
    const orderBy = query.sort
      ? `${query.sort} ${query.order || 'desc'}`
      : 'modified desc';

    return this.frappe.getList('Contact', {
      fields: [
        'name', 'first_name', 'last_name', 'full_name',
        'email_id', 'phone', 'company_name', 'modified',
      ],
      orderBy,
      limit: query.limit,
      offset: query.offset,
      tenant,
    });
  }

  async findOne(id: string, tenant: TenantContext) {
    return this.frappe.getDoc('Contact', id, tenant);
  }

  async create(dto: CreateContactDto, tenant: TenantContext) {
    return this.frappe.createDoc('Contact', dto as any, tenant);
  }

  async update(id: string, dto: UpdateContactDto, tenant: TenantContext) {
    return this.frappe.updateDoc('Contact', id, dto as any, tenant);
  }

  async remove(id: string, tenant: TenantContext) {
    return this.frappe.deleteDoc('Contact', id, tenant);
  }
}
