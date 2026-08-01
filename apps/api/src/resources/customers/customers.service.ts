import { Injectable } from '@nestjs/common';
import { FrappeService } from '../../frappe/frappe.service';
import { TenantContext } from '../../common/interfaces/tenant-context.interface';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly frappe: FrappeService) {}

  async findAll(query: PaginationDto, tenant: TenantContext) {
    const orderBy = query.sort
      ? `${query.sort} ${query.order || 'desc'}`
      : 'modified desc';

    return this.frappe.getList('Customer', {
      fields: [
        'name', 'customer_name', 'customer_type', 'customer_group',
        'territory', 'email_id', 'mobile_no', 'modified',
      ],
      orderBy,
      limit: query.limit,
      offset: query.offset,
      tenant,
    });
  }

  async findOne(id: string, tenant: TenantContext) {
    return this.frappe.getDoc('Customer', id, tenant);
  }

  async create(dto: CreateCustomerDto, tenant: TenantContext) {
    return this.frappe.createDoc('Customer', dto as any, tenant);
  }

  async update(id: string, dto: UpdateCustomerDto, tenant: TenantContext) {
    return this.frappe.updateDoc('Customer', id, dto as any, tenant);
  }

  async remove(id: string, tenant: TenantContext) {
    return this.frappe.deleteDoc('Customer', id, tenant);
  }
}
