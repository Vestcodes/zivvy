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

export class SalesOrderItemDto {
  @ApiProperty({ example: 'IT-001', description: 'Item code' })
  @IsString()
  @IsNotEmpty()
  item_code: string;

  @ApiProperty({ example: 10, description: 'Quantity' })
  @IsNumber()
  qty: number;

  @ApiProperty({ example: 49.99, description: 'Rate per unit' })
  @IsNumber()
  rate: number;
}

export class CreateSalesOrderDto {
  @ApiProperty({ example: 'CUST-00001', description: 'Customer ID' })
  @IsString()
  @IsNotEmpty()
  customer: string;

  @ApiProperty({ example: '2024-03-15', description: 'Expected delivery date' })
  @IsDateString()
  delivery_date: string;

  @ApiProperty({ type: [SalesOrderItemDto], description: 'Order line items' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SalesOrderItemDto)
  items: SalesOrderItemDto[];

  @ApiPropertyOptional({ example: 'USD', description: 'Transaction currency' })
  @IsOptional()
  @IsString()
  currency?: string;
}
