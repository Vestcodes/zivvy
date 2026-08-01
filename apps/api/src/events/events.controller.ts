import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiSecurity,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { EventsService } from './events.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ErrorResponse } from '../common/dto/api-response.dto';
import { Tenant } from '../common/decorators/tenant.decorator';
import { TenantContext } from '../common/interfaces/tenant-context.interface';

@ApiTags('Events')
@ApiSecurity('api-key')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiOperation({
    summary: 'List events',
    description: 'Retrieve a chronological log of events for your account. Use this to replay missed webhook deliveries or audit activity.',
  })
  @ApiQuery({ name: 'event_type', required: false, description: 'Filter by event type (e.g. "sales-order.created")' })
  @ApiQuery({ name: 'resource', required: false, description: 'Filter by resource slug (e.g. "sales-orders")' })
  @ApiQuery({ name: 'since', required: false, description: 'ISO 8601 timestamp — only events after this time' })
  @ApiResponse({ status: 200, description: 'Paginated list of events' })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponse })
  async findAll(
    @Query() pagination: PaginationDto,
    @Query('event_type') eventType?: string,
    @Query('resource') resource?: string,
    @Query('since') since?: string,
    @Tenant() tenant?: TenantContext,
  ) {
    return this.eventsService.findAll(pagination, { eventType, resource, since }, tenant!);
  }
}
