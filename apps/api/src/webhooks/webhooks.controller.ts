import {
  Controller,
  Get,
  Post,
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
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUrl, IsArray, IsOptional } from 'class-validator';
import { WebhooksService } from './webhooks.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ErrorResponse } from '../common/dto/api-response.dto';
import { Tenant } from '../common/decorators/tenant.decorator';
import { TenantContext } from '../common/interfaces/tenant-context.interface';

export class CreateWebhookDto {
  @ApiProperty({ example: 'https://example.com/webhooks/zivvy', description: 'URL to receive webhook payloads' })
  @IsUrl({ require_tld: false })
  @IsNotEmpty()
  url: string;

  @ApiProperty({
    example: ['sales-order.created', 'invoice.submitted'],
    description: 'Events to subscribe to. Use "*" for all events.',
  })
  @IsArray()
  @IsString({ each: true })
  events: string[];

  @ApiPropertyOptional({ example: 'whsec_mykey123', description: 'Shared secret for HMAC-SHA256 signature verification' })
  @IsOptional()
  @IsString()
  secret?: string;

  @ApiPropertyOptional({ example: 'Production order alerts', description: 'Optional label for this webhook' })
  @IsOptional()
  @IsString()
  label?: string;
}

@ApiTags('Webhooks')
@ApiSecurity('api-key')
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Get()
  @ApiOperation({ summary: 'List webhook subscriptions', description: 'Retrieve all registered webhook subscriptions for your account.' })
  @ApiResponse({ status: 200, description: 'List of webhooks' })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponse })
  async findAll(
    @Query() pagination: PaginationDto,
    @Tenant() tenant: TenantContext,
  ) {
    return this.webhooksService.findAll(pagination, tenant);
  }

  @Get('events')
  @ApiOperation({ summary: 'List available events', description: 'Returns the full catalog of events you can subscribe to.' })
  @ApiResponse({ status: 200, description: 'Event catalog' })
  async listEvents() {
    return this.webhooksService.getEventCatalog();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a webhook subscription', description: 'Retrieve details of a specific webhook subscription.' })
  @ApiParam({ name: 'id', description: 'Webhook subscription ID' })
  @ApiResponse({ status: 200, description: 'Webhook details' })
  @ApiResponse({ status: 404, description: 'Webhook not found', type: ErrorResponse })
  async findOne(
    @Param('id') id: string,
    @Tenant() tenant: TenantContext,
  ) {
    return this.webhooksService.findOne(id, tenant);
  }

  @Post()
  @ApiOperation({ summary: 'Create a webhook subscription', description: 'Register a new webhook endpoint to receive event notifications.' })
  @ApiResponse({ status: 201, description: 'Webhook created' })
  @ApiResponse({ status: 400, description: 'Validation error', type: ErrorResponse })
  async create(
    @Body() dto: CreateWebhookDto,
    @Tenant() tenant: TenantContext,
  ) {
    return this.webhooksService.create(dto, tenant);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a webhook subscription', description: 'Remove a webhook subscription. No further events will be delivered.' })
  @ApiParam({ name: 'id', description: 'Webhook subscription ID' })
  @ApiResponse({ status: 200, description: 'Webhook deleted' })
  @ApiResponse({ status: 404, description: 'Webhook not found', type: ErrorResponse })
  async remove(
    @Param('id') id: string,
    @Tenant() tenant: TenantContext,
  ) {
    await this.webhooksService.remove(id, tenant);
    return { message: 'Webhook subscription deleted' };
  }

  @Get(':id/deliveries')
  @ApiOperation({ summary: 'List webhook deliveries', description: 'View recent delivery attempts for a webhook subscription.' })
  @ApiParam({ name: 'id', description: 'Webhook subscription ID' })
  @ApiResponse({ status: 200, description: 'List of deliveries' })
  async listDeliveries(
    @Param('id') id: string,
    @Query() pagination: PaginationDto,
    @Tenant() tenant: TenantContext,
  ) {
    return this.webhooksService.listDeliveries(id, pagination, tenant);
  }
}
