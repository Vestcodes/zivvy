import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiSecurity,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { TiersService } from './tiers.service';
import { ErrorResponse } from '../../common/dto/api-response.dto';
import { Tenant } from '../../common/decorators/tenant.decorator';
import { TenantContext } from '../../common/interfaces/tenant-context.interface';
import { Public } from '../../auth/decorators';

@ApiTags('Tiers')
@Controller('tiers')
export class TiersController {
  constructor(private readonly svc: TiersService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'List paid tiers (Pro, Business)',
    description:
      'Public tier catalog with monthly / annual pricing. No API key required.',
  })
  @ApiResponse({ status: 200, description: 'Tier catalog' })
  async list() {
    return this.svc.listPublic();
  }

  @Get('mine')
  @ApiSecurity('api-key')
  @ApiOperation({
    summary: 'Get the current tenant subscription snapshot',
    description:
      'Returns the authenticated tenant\'s current plan tier, status, and Polar sync fields.',
  })
  @ApiResponse({ status: 200, description: 'Current subscription state' })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponse })
  async mine(@Tenant() tenant: TenantContext) {
    return this.svc.getMine(tenant);
  }

  @Post(':slug/subscribe')
  @ApiSecurity('api-key')
  @ApiOperation({
    summary: 'Start Polar checkout for a paid tier',
    description:
      'Creates a Polar checkout session for the given tier + billing cadence and returns a checkout_url the caller should redirect to.',
  })
  @ApiParam({ name: 'slug', description: 'Tier slug ("pro" or "business")' })
  @ApiQuery({
    name: 'billing',
    required: false,
    enum: ['monthly', 'annual'],
    description: 'Billing cadence — defaults to "monthly".',
  })
  @ApiResponse({ status: 201, description: 'Checkout URL returned' })
  @ApiResponse({ status: 400, description: 'Validation error', type: ErrorResponse })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponse })
  @ApiResponse({ status: 404, description: 'Tier not found', type: ErrorResponse })
  async subscribe(
    @Param('slug') slug: string,
    @Query('billing') billing: 'monthly' | 'annual' | undefined,
    @Tenant() tenant: TenantContext,
  ) {
    const cadence = billing === 'annual' ? 'annual' : 'monthly';
    return this.svc.subscribe(slug, cadence, tenant);
  }
}
