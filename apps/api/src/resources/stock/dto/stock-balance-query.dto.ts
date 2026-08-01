import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class StockBalanceQueryDto {
  @ApiPropertyOptional({ example: 'IT-001', description: 'Filter by item code' })
  @IsOptional()
  @IsString()
  item_code?: string;

  @ApiPropertyOptional({ example: 'Stores - Z', description: 'Filter by warehouse' })
  @IsOptional()
  @IsString()
  warehouse?: string;
}
