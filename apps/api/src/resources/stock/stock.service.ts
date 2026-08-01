import { Injectable } from '@nestjs/common';
import { FrappeService } from '../../frappe/frappe.service';
import { TenantContext } from '../../common/interfaces/tenant-context.interface';
import { StockBalanceQueryDto } from './dto/stock-balance-query.dto';
import { StockTransferDto } from './dto/stock-transfer.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class StockService {
  constructor(private readonly frappe: FrappeService) {}

  async getBalance(query: StockBalanceQueryDto, tenant: TenantContext) {
    const filters: Record<string, any> = {};
    if (query.item_code) filters.item_code = query.item_code;
    if (query.warehouse) filters.warehouse = query.warehouse;

    return this.frappe.getList('Bin', {
      fields: [
        'item_code', 'warehouse', 'actual_qty',
        'stock_uom', 'stock_value',
      ],
      filters,
      tenant,
    });
  }

  async getLedger(pagination: PaginationDto, tenant: TenantContext) {
    const orderBy = pagination.sort
      ? `${pagination.sort} ${pagination.order || 'desc'}`
      : 'posting_date desc';

    return this.frappe.getList('Stock Ledger Entry', {
      fields: [
        'name', 'item_code', 'warehouse', 'posting_date',
        'actual_qty', 'qty_after_transaction', 'valuation_rate',
        'voucher_type', 'voucher_no', 'modified',
      ],
      orderBy,
      limit: pagination.limit,
      offset: pagination.offset,
      tenant,
    });
  }

  async transfer(dto: StockTransferDto, tenant: TenantContext) {
    const stockEntryData = {
      stock_entry_type: 'Material Transfer',
      items: dto.items.map((item) => ({
        item_code: item.item_code,
        qty: item.qty,
        s_warehouse: item.s_warehouse,
        t_warehouse: item.t_warehouse,
      })),
    };

    return this.frappe.createDoc('Stock Entry', stockEntryData, tenant);
  }
}
