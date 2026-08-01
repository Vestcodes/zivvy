import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ItemResponseDto {
  @ApiProperty({ example: 'IT-001' })
  name: string;

  @ApiProperty({ example: 'IT-001' })
  item_code: string;

  @ApiProperty({ example: 'Widget A' })
  item_name: string;

  @ApiProperty({ example: 'Products' })
  item_group: string;

  @ApiProperty({ example: 'Nos' })
  stock_uom: string;

  @ApiPropertyOptional({ example: 'A premium widget' })
  description?: string;

  @ApiProperty({ example: false })
  has_variants: boolean;

  @ApiProperty({ example: true })
  is_stock_item: boolean;

  @ApiPropertyOptional({ example: 49.99 })
  standard_rate?: number;

  @ApiPropertyOptional({ example: 'https://example.com/image.png' })
  image?: string;

  @ApiProperty({ example: '2024-01-15 10:30:00' })
  modified: string;
}
