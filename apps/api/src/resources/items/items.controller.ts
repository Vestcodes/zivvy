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
  ApiQuery,
} from '@nestjs/swagger';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ItemResponseDto } from './dto/item-response.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ErrorResponse } from '../../common/dto/api-response.dto';
import { Tenant } from '../../common/decorators/tenant.decorator';
import { TenantContext } from '../../common/interfaces/tenant-context.interface';

@ApiTags('Items')
@ApiSecurity('api-key')
@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  @ApiOperation({ summary: 'List items', description: 'Retrieve a paginated list of items with optional filters.' })
  @ApiQuery({ name: 'item_group', required: false, description: 'Filter by item group' })
  @ApiQuery({ name: 'has_variants', required: false, type: Boolean, description: 'Filter by variant flag' })
  @ApiQuery({ name: 'is_stock_item', required: false, type: Boolean, description: 'Filter by stock item flag' })
  @ApiResponse({ status: 200, description: 'Paginated list of items' })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponse })
  async findAll(
    @Query() pagination: PaginationDto,
    @Query('item_group') itemGroup?: string,
    @Query('has_variants') hasVariants?: boolean,
    @Query('is_stock_item') isStockItem?: boolean,
    @Tenant() tenant?: TenantContext,
  ) {
    const { data, total } = await this.itemsService.findAll(
      pagination,
      { item_group: itemGroup, has_variants: hasVariants, is_stock_item: isStockItem },
      tenant!,
    );
    return {
      data,
      meta: { total, limit: pagination.limit!, offset: pagination.offset! },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an item', description: 'Retrieve a single item by its item_code or name.' })
  @ApiParam({ name: 'id', description: 'Item code or name' })
  @ApiResponse({ status: 200, description: 'Item details', type: ItemResponseDto })
  @ApiResponse({ status: 404, description: 'Item not found', type: ErrorResponse })
  async findOne(
    @Param('id') id: string,
    @Tenant() tenant?: TenantContext,
  ) {
    return this.itemsService.findOne(id, tenant!);
  }

  @Post()
  @ApiOperation({ summary: 'Create an item', description: 'Create a new item in the inventory.' })
  @ApiResponse({ status: 201, description: 'Item created', type: ItemResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error', type: ErrorResponse })
  async create(
    @Body() dto: CreateItemDto,
    @Tenant() tenant?: TenantContext,
  ) {
    return this.itemsService.create(dto, tenant!);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an item', description: 'Partially update an existing item.' })
  @ApiParam({ name: 'id', description: 'Item code or name' })
  @ApiResponse({ status: 200, description: 'Item updated', type: ItemResponseDto })
  @ApiResponse({ status: 404, description: 'Item not found', type: ErrorResponse })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateItemDto,
    @Tenant() tenant?: TenantContext,
  ) {
    return this.itemsService.update(id, dto, tenant!);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an item', description: 'Permanently delete an item.' })
  @ApiParam({ name: 'id', description: 'Item code or name' })
  @ApiResponse({ status: 200, description: 'Item deleted' })
  @ApiResponse({ status: 404, description: 'Item not found', type: ErrorResponse })
  async remove(
    @Param('id') id: string,
    @Tenant() tenant?: TenantContext,
  ) {
    await this.itemsService.remove(id, tenant!);
    return { message: 'Item deleted successfully' };
  }
}
