import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InvoiceItemResponseDto {
  @ApiProperty({ example: 'IT-001' })
  item_code: string;

  @ApiProperty({ example: 'Widget A' })
  item_name: string;

  @ApiProperty({ example: 5 })
  qty: number;

  @ApiProperty({ example: 49.99 })
  rate: number;

  @ApiProperty({ example: 249.95 })
  amount: number;
}

export class InvoiceResponseDto {
  @ApiProperty({ example: 'SINV-00001' })
  name: string;

  @ApiProperty({ example: 'CUST-00001' })
  customer: string;

  @ApiProperty({ example: 'Acme Corp' })
  customer_name: string;

  @ApiProperty({ example: '2024-03-01' })
  posting_date: string;

  @ApiProperty({ example: '2024-04-15' })
  due_date: string;

  @ApiProperty({ example: 'Unpaid' })
  status: string;

  @ApiProperty({ example: 249.95 })
  grand_total: number;

  @ApiProperty({ example: 249.95 })
  outstanding_amount: number;

  @ApiPropertyOptional({ example: 'USD' })
  currency?: string;

  @ApiProperty({ type: [InvoiceItemResponseDto] })
  items: InvoiceItemResponseDto[];

  @ApiProperty({ example: 0, description: '0 = Draft, 1 = Submitted, 2 = Cancelled' })
  docstatus: number;

  @ApiProperty({ example: '2024-01-15 10:30:00' })
  modified: string;
}
