import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  ValidateNested,
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class StockTransferItemDto {
  @ApiProperty({ example: 'IT-001', description: 'Item code' })
  @IsString()
  @IsNotEmpty()
  item_code: string;

  @ApiProperty({ example: 10, description: 'Quantity to transfer' })
  @IsNumber()
  @Min(1)
  qty: number;

  @ApiProperty({ example: 'Stores - Z', description: 'Source warehouse' })
  @IsString()
  @IsNotEmpty()
  s_warehouse: string;

  @ApiProperty({ example: 'Finished Goods - Z', description: 'Target warehouse' })
  @IsString()
  @IsNotEmpty()
  t_warehouse: string;
}

export class StockTransferDto {
  @ApiProperty({ type: [StockTransferItemDto], description: 'Items to transfer between warehouses' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockTransferItemDto)
  items: StockTransferItemDto[];
}
