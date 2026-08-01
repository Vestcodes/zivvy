import { Injectable } from '@nestjs/common';
import { FrappeService } from '../../frappe/frappe.service';
import { TenantContext } from '../../common/interfaces/tenant-context.interface';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { UpdateSalesOrderDto } from './dto/update-sales-order.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class SalesOrdersService {
  private readonly doctype = 'Sales Order';

  constructor(private readonly frappe: FrappeService) {}

  async findAll(query: PaginationDto, tenant: TenantContext) {
    const orderBy = query.sort
      ? `${query.sort} ${query.order || 'desc'}`
      : 'modified desc';

    return this.frappe.getList(this.doctype, {
      fields: [
        'name', 'customer', 'customer_name', 'transaction_date',
        'delivery_date', 'status', 'grand_total', 'currency',
        'docstatus', 'modified',
      ],
      orderBy,
      limit: query.limit,
      offset: query.offset,
      tenant,
    });
  }

  async findOne(id: string, tenant: TenantContext) {
    return this.frappe.getDoc(this.doctype, id, tenant);
  }

  async create(dto: CreateSalesOrderDto, tenant: TenantContext) {
    return this.frappe.createDoc(this.doctype, dto as any, tenant);
  }

  async update(id: string, dto: UpdateSalesOrderDto, tenant: TenantContext) {
    return this.frappe.updateDoc(this.doctype, id, dto as any, tenant);
  }

  async remove(id: string, tenant: TenantContext) {
    return this.frappe.deleteDoc(this.doctype, id, tenant);
  }

  async submit(id: string, tenant: TenantContext) {
    return this.frappe.submitDoc(this.doctype, id, tenant);
  }
}
