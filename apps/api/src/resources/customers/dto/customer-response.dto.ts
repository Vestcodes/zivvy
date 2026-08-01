import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CustomerResponseDto {
  @ApiProperty({ example: 'CUST-00001' })
  name: string;

  @ApiProperty({ example: 'Acme Corp' })
  customer_name: string;

  @ApiProperty({ example: 'Company' })
  customer_type: string;

  @ApiPropertyOptional({ example: 'Commercial' })
  customer_group?: string;

  @ApiPropertyOptional({ example: 'United States' })
  territory?: string;

  @ApiPropertyOptional({ example: 'contact@acme.com' })
  email_id?: string;

  @ApiPropertyOptional({ example: '+1-555-0100' })
  mobile_no?: string;

  @ApiProperty({ example: '2024-01-15 10:30:00' })
  modified: string;
}
