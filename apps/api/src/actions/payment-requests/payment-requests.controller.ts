import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiSecurity,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import {
  MakePaymentRequestDto,
  PaymentRequestsActionsService,
} from './payment-requests.service';
import { ErrorResponse } from '../../common/dto/api-response.dto';
import { Tenant } from '../../common/decorators/tenant.decorator';
import { TenantContext } from '../../common/interfaces/tenant-context.interface';
import { requireTier } from '../../common/utils/tier';

class MakePaymentRequestBody implements MakePaymentRequestDto {
  @ApiProperty({ example: 'Sales Invoice', description: 'Reference doctype (Sales Invoice, Sales Order, Purchase Invoice, Purchase Order)' })
  @IsString() @IsNotEmpty()
  dt: string;

  @ApiProperty({ example: 'ACC-SINV-2026-00001', description: 'Reference document name' })
  @IsString() @IsNotEmpty()
  dn: string;

  @ApiPropertyOptional({ example: false, description: 'Submit the resulting Payment Request immediately' })
  @IsOptional() @IsBoolean()
  submit_doc?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Suppress the customer notification email' })
  @IsOptional() @IsBoolean()
  mute_email?: boolean;

  @ApiPropertyOptional({ example: 'Sales', description: 'Order type category' })
  @IsOptional() @IsString()
  order_type?: string;
}

@ApiTags('Payment Requests Actions')
@ApiSecurity('api-key')
@Controller('payment-requests')
export class PaymentRequestsActionsController {
  constructor(private readonly svc: PaymentRequestsActionsService) {}

  @Post('from-invoice')
  @ApiOperation({
    summary: 'Create Payment Request from source doc',
    description: 'Creates a Payment Request against a Sales Invoice, Sales Order, Purchase Invoice, or Purchase Order.',
  })
  @ApiResponse({ status: 201, description: 'Payment Request created' })
  @ApiResponse({ status: 400, description: 'Validation error', type: ErrorResponse })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponse })
  @ApiResponse({ status: 403, description: 'Requires Pro plan', type: ErrorResponse })
  @ApiResponse({ status: 404, description: 'Reference document not found', type: ErrorResponse })
  async fromInvoice(
    @Body() body: MakePaymentRequestBody,
    @Tenant() tenant: TenantContext,
  ) {
    requireTier(tenant, 'pro');
    return this.svc.makeFromInvoice(body, tenant);
  }

  @Post(':name/actions/resend')
  @ApiOperation({
    summary: 'Resend payment request email',
    description: 'Re-sends the payment link email associated with a Payment Request.',
  })
  @ApiParam({ name: 'name', description: 'Payment Request name' })
  @ApiResponse({ status: 200, description: 'Email queued' })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponse })
  @ApiResponse({ status: 403, description: 'Requires Pro plan', type: ErrorResponse })
  @ApiResponse({ status: 404, description: 'Payment Request not found', type: ErrorResponse })
  async resend(
    @Param('name') name: string,
    @Tenant() tenant: TenantContext,
  ) {
    requireTier(tenant, 'pro');
    return this.svc.resend(name, tenant);
  }

  @Post(':name/actions/make-payment-entry')
  @ApiOperation({
    summary: 'Create Payment Entry from request',
    description: 'Generates a Payment Entry that settles the Payment Request against the referenced invoice.',
  })
  @ApiParam({ name: 'name', description: 'Payment Request name' })
  @ApiResponse({ status: 201, description: 'Payment Entry created' })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponse })
  @ApiResponse({ status: 403, description: 'Requires Pro plan', type: ErrorResponse })
  @ApiResponse({ status: 404, description: 'Payment Request not found', type: ErrorResponse })
  async makePaymentEntry(
    @Param('name') name: string,
    @Tenant() tenant: TenantContext,
  ) {
    requireTier(tenant, 'pro');
    return this.svc.makePaymentEntry(name, tenant);
  }

  @Get(':name/subscription-details')
  @ApiOperation({
    summary: 'Get subscription plans for request',
    description: 'Returns the subscription plans linked to the invoice referenced by this Payment Request.',
  })
  @ApiParam({ name: 'name', description: 'Payment Request name' })
  @ApiResponse({ status: 200, description: 'Subscription plan list' })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ErrorResponse })
  @ApiResponse({ status: 403, description: 'Requires Pro plan', type: ErrorResponse })
  @ApiResponse({ status: 404, description: 'Payment Request not found', type: ErrorResponse })
  async subscriptionDetails(
    @Param('name') name: string,
    @Tenant() tenant: TenantContext,
  ) {
    requireTier(tenant, 'pro');
    return this.svc.getSubscriptionDetails(name, tenant);
  }
}
