import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StockBalanceResponseDto {
  @ApiProperty({ example: 'IT-001' })
  item_code: string;

  @ApiPropertyOptional({ example: 'Widget A' })
  item_name?: string;

  @ApiProperty({ example: 'Stores - Z' })
  warehouse: string;

  @ApiProperty({ example: 150 })
  actual_qty: number;

  @ApiProperty({ example: 'Nos' })
  stock_uom: string;

  @ApiPropertyOptional({ example: 7485.0 })
  stock_value?: number;
}

export class StockLedgerEntryResponseDto {
  @ApiProperty({ example: 'SLE-00001' })
  name: string;

  @ApiProperty({ example: 'IT-001' })
  item_code: string;

  @ApiProperty({ example: 'Stores - Z' })
  warehouse: string;

  @ApiProperty({ example: '2024-03-01' })
  posting_date: string;

  @ApiProperty({ example: 10 })
  actual_qty: number;

  @ApiProperty({ example: 160 })
  qty_after_transaction: number;

  @ApiProperty({ example: 49.99 })
  valuation_rate: number;

  @ApiProperty({ example: 'Stock Entry' })
  voucher_type: string;

  @ApiProperty({ example: 'STE-00001' })
  voucher_no: string;

  @ApiProperty({ example: '2024-03-01 14:30:00' })
  modified: string;
}

export class StockTransferResponseDto {
  @ApiProperty({ example: 'STE-00001' })
  name: string;

  @ApiProperty({ example: 'Material Transfer' })
  stock_entry_type: string;

  @ApiProperty({ example: 0 })
  docstatus: number;

  @ApiProperty({ example: '2024-03-01 14:30:00' })
  modified: string;
}
