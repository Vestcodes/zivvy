import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateLeadDto {
  @ApiProperty({ example: 'Jane Smith', description: 'Lead name' })
  @IsString()
  @IsNotEmpty()
  lead_name: string;

  @ApiPropertyOptional({ example: 'jane@example.com', description: 'Email address' })
  @IsOptional()
  @IsString()
  email_id?: string;

  @ApiPropertyOptional({ example: '+1-555-0200', description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Example Inc', description: 'Company name' })
  @IsOptional()
  @IsString()
  company_name?: string;

  @ApiPropertyOptional({ example: 'Website', description: 'Lead source' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ example: 'Open', description: 'Lead status' })
  @IsOptional()
  @IsString()
  status?: string;
}
