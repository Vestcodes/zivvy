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
import { SalesOrdersService } from './sales-orders.service';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { UpdateSalesOrderDto } from './dto/update-sales-order.dto';
import { SalesOrderResponseDto } from './dto/sales-order-response.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ErrorResponse } from '../../common/dto/api-response.dto';
import { Tenant } from '../../common/decorators/tenant.decorator';
import { TenantContext } from '../../common/interfaces/tenant-context.interface';

@ApiTags('Sales Orders')
@ApiSecurity('api-key')
@Controller('sales-orders')
export class SalesOrdersController {
  constructor(private readonly salesOrdersService: SalesOrdersService) {}

  @Get()
  @ApiOperation({ summary: 'List sales orders', description: 'Retrieve a paginated list of sales orders.' })
  @ApiResponse({ status: 200, description: 'Paginated list of sales orders' })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponse })
  async findAll(
    @Query() pagination: PaginationDto,
    @Tenant() tenant?: TenantContext,
  ) {
    const { data, total } = await this.salesOrdersService.findAll(pagination, tenant!);
    return {
      data,
      meta: { total, limit: pagination.limit!, offset: pagination.offset! },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a sales order', description: 'Retrieve a single sales order by ID.' })
  @ApiParam({ name: 'id', description: 'Sales order ID' })
  @ApiResponse({ status: 200, description: 'Sales order details', type: SalesOrderResponseDto })
  @ApiResponse({ status: 404, description: 'Sales order not found', type: ErrorResponse })
  async findOne(
    @Param('id') id: string,
    @Tenant() tenant?: TenantContext,
  ) {
    return this.salesOrdersService.findOne(id, tenant!);
  }

  @Post()
  @ApiOperation({ summary: 'Create a sales order', description: 'Create a new sales order.' })
  @ApiResponse({ status: 201, description: 'Sales order created', type: SalesOrderResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error', type: ErrorResponse })
  async create(
    @Body() dto: CreateSalesOrderDto,
    @Tenant() tenant?: TenantContext,
  ) {
    return this.salesOrdersService.create(dto, tenant!);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a sales order', description: 'Partially update an existing sales order.' })
  @ApiParam({ name: 'id', description: 'Sales order ID' })
  @ApiResponse({ status: 200, description: 'Sales order updated', type: SalesOrderResponseDto })
  @ApiResponse({ status: 404, description: 'Sales order not found', type: ErrorResponse })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSalesOrderDto,
    @Tenant() tenant?: TenantContext,
  ) {
    return this.salesOrdersService.update(id, dto, tenant!);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a sales order', description: 'Delete a sales order (only if in Draft status).' })
  @ApiParam({ name: 'id', description: 'Sales order ID' })
  @ApiResponse({ status: 200, description: 'Sales order deleted' })
  @ApiResponse({ status: 404, description: 'Sales order not found', type: ErrorResponse })
  async remove(
    @Param('id') id: string,
    @Tenant() tenant?: TenantContext,
  ) {
    await this.salesOrdersService.remove(id, tenant!);
    return { message: 'Sales order deleted successfully' };
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit a sales order', description: 'Submit a draft sales order (sets docstatus to 1).' })
  @ApiParam({ name: 'id', description: 'Sales order ID' })
  @ApiResponse({ status: 200, description: 'Sales order submitted', type: SalesOrderResponseDto })
  @ApiResponse({ status: 404, description: 'Sales order not found', type: ErrorResponse })
  async submit(
    @Param('id') id: string,
    @Tenant() tenant?: TenantContext,
  ) {
    return this.salesOrdersService.submit(id, tenant!);
  }
}
