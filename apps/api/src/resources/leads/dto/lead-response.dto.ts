import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LeadResponseDto {
  @ApiProperty({ example: 'CRM-LEAD-00001' })
  name: string;

  @ApiProperty({ example: 'Jane Smith' })
  lead_name: string;

  @ApiPropertyOptional({ example: 'jane@example.com' })
  email_id?: string;

  @ApiPropertyOptional({ example: '+1-555-0200' })
  phone?: string;

  @ApiPropertyOptional({ example: 'Example Inc' })
  company_name?: string;

  @ApiPropertyOptional({ example: 'Website' })
  source?: string;

  @ApiProperty({ example: 'Open' })
  status: string;

  @ApiProperty({ example: '2024-01-15 10:30:00' })
  modified: string;
}
