import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiSecurity,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { StockService } from './stock.service';
import { StockBalanceQueryDto } from './dto/stock-balance-query.dto';
import { StockTransferDto } from './dto/stock-transfer.dto';
import {
  StockBalanceResponseDto,
  StockLedgerEntryResponseDto,
  StockTransferResponseDto,
} from './dto/stock-response.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { ErrorResponse } from '../../common/dto/api-response.dto';
import { Tenant } from '../../common/decorators/tenant.decorator';
import { TenantContext } from '../../common/interfaces/tenant-context.interface';

@ApiTags('Stock')
@ApiSecurity('api-key')
@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get('balance')
  @ApiOperation({
    summary: 'Get stock balance',
    description: 'Retrieve current stock balance per item and warehouse. Reads from the Bin doctype.',
  })
  @ApiQuery({ name: 'item_code', required: false, description: 'Filter by item code' })
  @ApiQuery({ name: 'warehouse', required: false, description: 'Filter by warehouse' })
  @ApiResponse({ status: 200, description: 'Stock balance list', type: [StockBalanceResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponse })
  async getBalance(
    @Query() query: StockBalanceQueryDto,
    @Tenant() tenant?: TenantContext,
  ) {
    const { data, total } = await this.stockService.getBalance(query, tenant!);
    return { data, meta: { total } };
  }

  @Get('ledger')
  @ApiOperation({
    summary: 'Get stock ledger',
    description: 'Retrieve stock ledger entries (read-only, paginated). Shows historical stock movements.',
  })
  @ApiResponse({ status: 200, description: 'Paginated stock ledger entries', type: [StockLedgerEntryResponseDto] })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponse })
  async getLedger(
    @Query() pagination: PaginationDto,
    @Tenant() tenant?: TenantContext,
  ) {
    const { data, total } = await this.stockService.getLedger(pagination, tenant!);
    return {
      data,
      meta: { total, limit: pagination.limit!, offset: pagination.offset! },
    };
  }

  @Post('transfer')
  @ApiOperation({
    summary: 'Create a stock transfer',
    description: 'Create a Material Transfer stock entry to move items between warehouses.',
  })
  @ApiResponse({ status: 201, description: 'Stock transfer created', type: StockTransferResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error', type: ErrorResponse })
  async transfer(
    @Body() dto: StockTransferDto,
    @Tenant() tenant?: TenantContext,
  ) {
    return this.stockService.transfer(dto, tenant!);
  }
}
