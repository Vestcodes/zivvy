import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SalesOrderItemResponseDto {
  @ApiProperty({ example: 'IT-001' })
  item_code: string;

  @ApiProperty({ example: 'Widget A' })
  item_name: string;

  @ApiProperty({ example: 10 })
  qty: number;

  @ApiProperty({ example: 49.99 })
  rate: number;

  @ApiProperty({ example: 499.9 })
  amount: number;
}

export class SalesOrderResponseDto {
  @ApiProperty({ example: 'SAL-ORD-00001' })
  name: string;

  @ApiProperty({ example: 'CUST-00001' })
  customer: string;

  @ApiProperty({ example: 'Acme Corp' })
  customer_name: string;

  @ApiProperty({ example: '2024-03-01' })
  transaction_date: string;

  @ApiProperty({ example: '2024-03-15' })
  delivery_date: string;

  @ApiProperty({ example: 'Draft' })
  status: string;

  @ApiProperty({ example: 499.9 })
  grand_total: number;

  @ApiPropertyOptional({ example: 'USD' })
  currency?: string;

  @ApiProperty({ type: [SalesOrderItemResponseDto] })
  items: SalesOrderItemResponseDto[];

  @ApiProperty({ example: 0, description: '0 = Draft, 1 = Submitted, 2 = Cancelled' })
  docstatus: number;

  @ApiProperty({ example: '2024-01-15 10:30:00' })
  modified: string;
}
