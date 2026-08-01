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
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerResponseDto } from './dto/customer-response.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ErrorResponse } from '../../common/dto/api-response.dto';
import { Tenant } from '../../common/decorators/tenant.decorator';
import { TenantContext } from '../../common/interfaces/tenant-context.interface';

@ApiTags('Customers')
@ApiSecurity('api-key')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @ApiOperation({ summary: 'List customers', description: 'Retrieve a paginated list of customers.' })
  @ApiResponse({ status: 200, description: 'Paginated list of customers' })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponse })
  async findAll(
    @Query() pagination: PaginationDto,
    @Tenant() tenant?: TenantContext,
  ) {
    const { data, total } = await this.customersService.findAll(pagination, tenant!);
    return {
      data,
      meta: { total, limit: pagination.limit!, offset: pagination.offset! },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a customer', description: 'Retrieve a single customer by ID.' })
  @ApiParam({ name: 'id', description: 'Customer ID or name' })
  @ApiResponse({ status: 200, description: 'Customer details', type: CustomerResponseDto })
  @ApiResponse({ status: 404, description: 'Customer not found', type: ErrorResponse })
  async findOne(
    @Param('id') id: string,
    @Tenant() tenant?: TenantContext,
  ) {
    return this.customersService.findOne(id, tenant!);
  }

  @Post()
  @ApiOperation({ summary: 'Create a customer', description: 'Create a new customer record.' })
  @ApiResponse({ status: 201, description: 'Customer created', type: CustomerResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error', type: ErrorResponse })
  async create(
    @Body() dto: CreateCustomerDto,
    @Tenant() tenant?: TenantContext,
  ) {
    return this.customersService.create(dto, tenant!);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a customer', description: 'Partially update an existing customer.' })
  @ApiParam({ name: 'id', description: 'Customer ID or name' })
  @ApiResponse({ status: 200, description: 'Customer updated', type: CustomerResponseDto })
  @ApiResponse({ status: 404, description: 'Customer not found', type: ErrorResponse })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
    @Tenant() tenant?: TenantContext,
  ) {
    return this.customersService.update(id, dto, tenant!);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a customer', description: 'Permanently delete a customer.' })
  @ApiParam({ name: 'id', description: 'Customer ID or name' })
  @ApiResponse({ status: 200, description: 'Customer deleted' })
  @ApiResponse({ status: 404, description: 'Customer not found', type: ErrorResponse })
  async remove(
    @Param('id') id: string,
    @Tenant() tenant?: TenantContext,
  ) {
    await this.customersService.remove(id, tenant!);
    return { message: 'Customer deleted successfully' };
  }
}
