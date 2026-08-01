import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateItemDto {
  @ApiProperty({ example: 'IT-001', description: 'Unique item code' })
  @IsString()
  @IsNotEmpty()
  item_code: string;

  @ApiProperty({ example: 'Widget A', description: 'Item display name' })
  @IsString()
  @IsNotEmpty()
  item_name: string;

  @ApiProperty({ example: 'Products', description: 'Item group classification' })
  @IsString()
  @IsNotEmpty()
  item_group: string;

  @ApiPropertyOptional({ example: 'Nos', description: 'Stock unit of measure', default: 'Nos' })
  @IsOptional()
  @IsString()
  stock_uom?: string = 'Nos';

  @ApiPropertyOptional({ example: 'A premium widget for industrial use' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  has_variants?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  is_stock_item?: boolean;

  @ApiPropertyOptional({ example: 49.99, description: 'Standard selling rate' })
  @IsOptional()
  @IsNumber()
  standard_rate?: number;

  @ApiPropertyOptional({ example: 'https://example.com/image.png' })
  @IsOptional()
  @IsString()
  image?: string;
}
