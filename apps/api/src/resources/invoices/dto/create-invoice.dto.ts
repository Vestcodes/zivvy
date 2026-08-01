import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class InvoiceItemDto {
  @ApiProperty({ example: 'IT-001', description: 'Item code' })
  @IsString()
  @IsNotEmpty()
  item_code: string;

  @ApiProperty({ example: 5, description: 'Quantity' })
  @IsNumber()
  qty: number;

  @ApiProperty({ example: 49.99, description: 'Rate per unit' })
  @IsNumber()
  rate: number;
}

export class CreateInvoiceDto {
  @ApiProperty({ example: 'CUST-00001', description: 'Customer ID' })
  @IsString()
  @IsNotEmpty()
  customer: string;

  @ApiProperty({ example: '2024-04-15', description: 'Payment due date' })
  @IsDateString()
  due_date: string;

  @ApiProperty({ type: [InvoiceItemDto], description: 'Invoice line items' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];

  @ApiPropertyOptional({ example: 'USD', description: 'Transaction currency' })
  @IsOptional()
  @IsString()
  currency?: string;
}
