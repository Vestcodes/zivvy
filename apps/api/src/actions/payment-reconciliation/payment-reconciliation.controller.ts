import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiSecurity,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';
import {
  AllocationsPayload,
  PaymentReconciliationActionsService,
} from './payment-reconciliation.service';
import { ErrorResponse } from '../../common/dto/api-response.dto';
import { Tenant } from '../../common/decorators/tenant.decorator';
import { TenantContext } from '../../common/interfaces/tenant-context.interface';
import { requireTier } from '../../common/utils/tier';

class AllocationsBody implements AllocationsPayload {
  @ApiPropertyOptional({
    type: 'array',
    items: { type: 'object' },
    description: 'Allocation rows linking payments to invoices with amounts',
  })
  @IsOptional() @IsArray()
  allocations?: any[];

  @ApiPropertyOptional({ type: 'array', items: { type: 'object' } })
  @IsOptional() @IsArray()
  payments?: any[];

  @ApiPropertyOptional({ type: 'array', items: { type: 'object' } })
  @IsOptional() @IsArray()
  invoices?: any[];
}

@ApiTags('Payment Reconciliation')
@ApiSecurity('api-key')
@Controller('payment-reconciliation')
export class PaymentReconciliationActionsController {
  constructor(private readonly svc: PaymentReconciliationActionsService) {}

  @Get('unreconciled')
  @ApiOperation({
    summary: 'Get unreconciled payments and invoices',
    description: 'Returns outstanding invoices and unallocated payments for a party that can be matched against each other.',
  })
  @ApiQuery({ name: 'party_type', required: false, description: 'Customer, Supplier, or Employee' })
  @ApiQuery({ name: 'party', required: false, description: 'Party name matching party_type' })
  @ApiQuery({ name: 'company', required: false, description: 'Company filter' })
  @ApiResponse({ status: 200, description: 'Unreconciled entries' })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponse })
  @ApiResponse({ status: 403, description: 'Requires Pro plan', type: ErrorResponse })
  async unreconciled(
    @Query('party_type') partyType: string | undefined,
    @Query('party') party: string | undefined,
    @Query('company') company: string | undefined,
    @Tenant() tenant: TenantContext,
  ) {
    requireTier(tenant, 'pro');
    return this.svc.getUnreconciledEntries(
      { party_type: partyType, party, company },
      tenant,
    );
  }

  @Post('allocate')
  @ApiOperation({
    summary: 'Allocate payments to invoices',
    description: 'Runs the auto-allocation pass that pairs selected payments with selected invoices.',
  })
  @ApiResponse({ status: 200, description: 'Allocations computed' })
  @ApiResponse({ status: 400, description: 'Validation error', type: ErrorResponse })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponse })
  @ApiResponse({ status: 403, description: 'Requires Pro plan', type: ErrorResponse })
  async allocate(
    @Body() body: AllocationsBody,
    @Tenant() tenant: TenantContext,
  ) {
    requireTier(tenant, 'pro');
    return this.svc.allocateEntries(body, tenant);
  }

  @Post('reconcile')
  @ApiOperation({
    summary: 'Post reconciliation entries',
    description: 'Commits the allocations to the ledger, creating any required gain/loss journals.',
  })
  @ApiResponse({ status: 200, description: 'Reconciliation posted' })
  @ApiResponse({ status: 400, description: 'Validation error', type: ErrorResponse })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponse })
  @ApiResponse({ status: 403, description: 'Requires Pro plan', type: ErrorResponse })
  async reconcile(
    @Body() body: AllocationsBody,
    @Tenant() tenant: TenantContext,
  ) {
    requireTier(tenant, 'pro');
    return this.svc.reconcile(body, tenant);
  }

  @Get('dimension-filters')
  @ApiOperation({
    summary: 'Get accounting dimension filter queries',
    description: 'Returns query definitions for dimension filters used by the reconciliation form.',
  })
  @ApiQuery({ name: 'company', required: false })
  @ApiResponse({ status: 200, description: 'Dimension filter map' })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponse })
  @ApiResponse({ status: 403, description: 'Requires Pro plan', type: ErrorResponse })
  async dimensionFilters(
    @Query('company') company: string | undefined,
    @Tenant() tenant: TenantContext,
  ) {
    requireTier(tenant, 'pro');
    return this.svc.getDimensionFilters(company, tenant);
  }

  @Get('auto-process-enabled')
  @ApiOperation({
    summary: 'Check auto-reconcile flag',
    description: 'Returns whether the automated payment reconciliation process is enabled for this tenant.',
  })
  @ApiResponse({ status: 200, description: 'Auto-process flag' })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponse })
  @ApiResponse({ status: 403, description: 'Requires Pro plan', type: ErrorResponse })
  async autoProcessEnabled(@Tenant() tenant: TenantContext) {
    requireTier(tenant, 'pro');
    return this.svc.isAutoProcessEnabled(tenant);
  }
}
