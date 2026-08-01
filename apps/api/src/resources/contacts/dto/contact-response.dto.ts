import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ContactResponseDto {
  @ApiProperty({ example: 'CON-00001' })
  name: string;

  @ApiProperty({ example: 'John' })
  first_name: string;

  @ApiPropertyOptional({ example: 'Doe' })
  last_name?: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  full_name?: string;

  @ApiPropertyOptional({ example: 'john@acme.com' })
  email_id?: string;

  @ApiPropertyOptional({ example: '+1-555-0100' })
  phone?: string;

  @ApiPropertyOptional({ example: 'Acme Corp' })
  company_name?: string;

  @ApiProperty({ example: '2024-01-15 10:30:00' })
  modified: string;
}
