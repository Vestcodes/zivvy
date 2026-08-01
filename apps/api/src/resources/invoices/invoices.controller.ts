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
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceResponseDto } from './dto/invoice-response.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ErrorResponse } from '../../common/dto/api-response.dto';
import { Tenant } from '../../common/decorators/tenant.decorator';
import { TenantContext } from '../../common/interfaces/tenant-context.interface';

@ApiTags('Invoices')
@ApiSecurity('api-key')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @ApiOperation({ summary: 'List invoices', description: 'Retrieve a paginated list of sales invoices.' })
  @ApiResponse({ status: 200, description: 'Paginated list of invoices' })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponse })
  async findAll(
    @Query() pagination: PaginationDto,
    @Tenant() tenant?: TenantContext,
  ) {
    const { data, total } = await this.invoicesService.findAll(pagination, tenant!);
    return {
      data,
      meta: { total, limit: pagination.limit!, offset: pagination.offset! },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an invoice', description: 'Retrieve a single sales invoice by ID.' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiResponse({ status: 200, description: 'Invoice details', type: InvoiceResponseDto })
  @ApiResponse({ status: 404, description: 'Invoice not found', type: ErrorResponse })
  async findOne(
    @Param('id') id: string,
    @Tenant() tenant?: TenantContext,
  ) {
    return this.invoicesService.findOne(id, tenant!);
  }

  @Post()
  @ApiOperation({ summary: 'Create an invoice', description: 'Create a new sales invoice.' })
  @ApiResponse({ status: 201, description: 'Invoice created', type: InvoiceResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error', type: ErrorResponse })
  async create(
    @Body() dto: CreateInvoiceDto,
    @Tenant() tenant?: TenantContext,
  ) {
    return this.invoicesService.create(dto, tenant!);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an invoice', description: 'Partially update an existing invoice.' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiResponse({ status: 200, description: 'Invoice updated', type: InvoiceResponseDto })
  @ApiResponse({ status: 404, description: 'Invoice not found', type: ErrorResponse })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateInvoiceDto,
    @Tenant() tenant?: TenantContext,
  ) {
    return this.invoicesService.update(id, dto, tenant!);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an invoice', description: 'Delete an invoice (only if in Draft status).' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiResponse({ status: 200, description: 'Invoice deleted' })
  @ApiResponse({ status: 404, description: 'Invoice not found', type: ErrorResponse })
  async remove(
    @Param('id') id: string,
    @Tenant() tenant?: TenantContext,
  ) {
    await this.invoicesService.remove(id, tenant!);
    return { message: 'Invoice deleted successfully' };
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit an invoice', description: 'Submit a draft invoice (sets docstatus to 1).' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiResponse({ status: 200, description: 'Invoice submitted', type: InvoiceResponseDto })
  @ApiResponse({ status: 404, description: 'Invoice not found', type: ErrorResponse })
  async submit(
    @Param('id') id: string,
    @Tenant() tenant?: TenantContext,
  ) {
    return this.invoicesService.submit(id, tenant!);
  }
}
