import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiSecurity,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadResponseDto } from './dto/lead-response.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ErrorResponse } from '../../common/dto/api-response.dto';
import { Tenant } from '../../common/decorators/tenant.decorator';
import { TenantContext } from '../../common/interfaces/tenant-context.interface';

@ApiTags('Leads')
@ApiSecurity('api-key')
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  @ApiOperation({ summary: 'List leads', description: 'Retrieve a paginated list of leads.' })
  @ApiResponse({ status: 200, description: 'Paginated list of leads' })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponse })
  async findAll(
    @Query() pagination: PaginationDto,
    @Tenant() tenant?: TenantContext,
  ) {
    const { data, total } = await this.leadsService.findAll(pagination, tenant!);
    return {
      data,
      meta: { total, limit: pagination.limit!, offset: pagination.offset! },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a lead', description: 'Retrieve a single lead by ID.' })
  @ApiParam({ name: 'id', description: 'Lead ID or name' })
  @ApiResponse({ status: 200, description: 'Lead details', type: LeadResponseDto })
  @ApiResponse({ status: 404, description: 'Lead not found', type: ErrorResponse })
  async findOne(
    @Param('id') id: string,
    @Tenant() tenant?: TenantContext,
  ) {
    return this.leadsService.findOne(id, tenant!);
  }

  @Post()
  @ApiOperation({ summary: 'Create a lead', description: 'Create a new lead record.' })
  @ApiResponse({ status: 201, description: 'Lead created', type: LeadResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error', type: ErrorResponse })
  async create(
    @Body() dto: CreateLeadDto,
    @Tenant() tenant?: TenantContext,
  ) {
    return this.leadsService.create(dto, tenant!);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a lead', description: 'Partially update an existing lead.' })
  @ApiParam({ name: 'id', description: 'Lead ID or name' })
  @ApiResponse({ status: 200, description: 'Lead updated', type: LeadResponseDto })
  @ApiResponse({ status: 404, description: 'Lead not found', type: ErrorResponse })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateLeadDto,
    @Tenant() tenant?: TenantContext,
  ) {
    return this.leadsService.update(id, dto, tenant!);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a lead', description: 'Permanently delete a lead.' })
  @ApiParam({ name: 'id', description: 'Lead ID or name' })
  @ApiResponse({ status: 200, description: 'Lead deleted' })
  @ApiResponse({ status: 404, description: 'Lead not found', type: ErrorResponse })
  async remove(
    @Param('id') id: string,
    @Tenant() tenant?: TenantContext,
  ) {
    await this.leadsService.remove(id, tenant!);
    return { message: 'Lead deleted successfully' };
  }
}
