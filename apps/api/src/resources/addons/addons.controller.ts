import { Controller, Get, Post, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiSecurity,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { AddonsService } from './addons.service';
import { ErrorResponse } from '../../common/dto/api-response.dto';
import { Tenant } from '../../common/decorators/tenant.decorator';
import { TenantContext } from '../../common/interfaces/tenant-context.interface';
import { Public } from '../../auth/decorators';

@ApiTags('Add-ons')
@Controller('addons')
export class AddonsController {
  constructor(private readonly svc: AddonsService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'List available add-ons',
    description:
      'Public catalog of add-ons available for purchase (name, slug, description, price, features). No API key required.',
  })
  @ApiResponse({ status: 200, description: 'Add-on catalog' })
  async list() {
    return this.svc.listPublic();
  }

  @Get('mine')
  @ApiSecurity('api-key')
  @ApiOperation({
    summary: 'List add-ons subscribed by the current tenant',
    description:
      'Returns add-ons the authenticated tenant has subscribed to, including status and renewal date.',
  })
  @ApiResponse({ status: 200, description: 'Subscribed add-ons' })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponse })
  async listMine(@Tenant() tenant: TenantContext) {
    return this.svc.listMine(tenant);
  }

  @Post(':slug/subscribe')
  @ApiSecurity('api-key')
  @ApiOperation({
    summary: 'Subscribe to an add-on',
    description:
      'Enables the given add-on for the authenticated tenant. Provisions billing and activates the associated resources.',
  })
  @ApiParam({ name: 'slug', description: 'Add-on slug (e.g. "ecommerce-integrations")' })
  @ApiResponse({ status: 201, description: 'Subscription activated' })
  @ApiResponse({ status: 400, description: 'Validation error', type: ErrorResponse })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponse })
  @ApiResponse({ status: 404, description: 'Add-on not found', type: ErrorResponse })
  async subscribe(
    @Param('slug') slug: string,
    @Tenant() tenant: TenantContext,
  ) {
    return this.svc.subscribe(slug, tenant);
  }

  @Post(':slug/cancel')
  @ApiSecurity('api-key')
  @ApiOperation({
    summary: 'Cancel an add-on subscription',
    description:
      'Cancels the given add-on for the authenticated tenant. Access continues through the paid period, then the add-on is disabled.',
  })
  @ApiParam({ name: 'slug', description: 'Add-on slug (e.g. "ecommerce-integrations")' })
  @ApiResponse({ status: 200, description: 'Subscription cancelled' })
  @ApiResponse({ status: 400, description: 'Validation error', type: ErrorResponse })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponse })
  @ApiResponse({ status: 404, description: 'Add-on not found', type: ErrorResponse })
  async cancel(
    @Param('slug') slug: string,
    @Tenant() tenant: TenantContext,
  ) {
    return this.svc.cancel(slug, tenant);
  }
}
