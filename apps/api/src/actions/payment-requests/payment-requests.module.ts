import { Module } from '@nestjs/common';
import { PaymentRequestsActionsController } from './payment-requests.controller';
import { PaymentRequestsActionsService } from './payment-requests.service';

@Module({
  controllers: [PaymentRequestsActionsController],
  providers: [PaymentRequestsActionsService],
})
export class PaymentRequestsActionsModule {}
