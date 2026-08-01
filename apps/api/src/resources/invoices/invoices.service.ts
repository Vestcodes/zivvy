import { Injectable } from '@nestjs/common';
import { FrappeService } from '../../frappe/frappe.service';
import { TenantContext } from '../../common/interfaces/tenant-context.interface';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class InvoicesService {
  private readonly doctype = 'Sales Invoice';

  constructor(private readonly frappe: FrappeService) {}

  async findAll(query: PaginationDto, tenant: TenantContext) {
    const orderBy = query.sort
      ? `${query.sort} ${query.order || 'desc'}`
      : 'modified desc';

    return this.frappe.getList(this.doctype, {
      fields: [
        'name', 'customer', 'customer_name', 'posting_date', 'due_date',
        'status', 'grand_total', 'outstanding_amount', 'currency',
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

  async create(dto: CreateInvoiceDto, tenant: TenantContext) {
    return this.frappe.createDoc(this.doctype, dto as any, tenant);
  }

  async update(id: string, dto: UpdateInvoiceDto, tenant: TenantContext) {
    return this.frappe.updateDoc(this.doctype, id, dto as any, tenant);
  }

  async remove(id: string, tenant: TenantContext) {
    return this.frappe.deleteDoc(this.doctype, id, tenant);
  }

  async submit(id: string, tenant: TenantContext) {
    return this.frappe.submitDoc(this.doctype, id, tenant);
  }
}
