import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Acme Corp', description: 'Customer name' })
  @IsString()
  @IsNotEmpty()
  customer_name: string;

  @ApiProperty({ enum: ['Company', 'Individual'], example: 'Company' })
  @IsString()
  @IsIn(['Company', 'Individual'])
  customer_type: 'Company' | 'Individual';

  @ApiPropertyOptional({ example: 'Commercial', description: 'Customer group' })
  @IsOptional()
  @IsString()
  customer_group?: string;

  @ApiPropertyOptional({ example: 'United States', description: 'Territory' })
  @IsOptional()
  @IsString()
  territory?: string;

  @ApiPropertyOptional({ example: 'contact@acme.com' })
  @IsOptional()
  @IsString()
  email_id?: string;

  @ApiPropertyOptional({ example: '+1-555-0100' })
  @IsOptional()
  @IsString()
  mobile_no?: string;
}
