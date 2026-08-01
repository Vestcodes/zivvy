import { Module } from '@nestjs/common';
import { PaymentReconciliationActionsController } from './payment-reconciliation.controller';
import { PaymentReconciliationActionsService } from './payment-reconciliation.service';

@Module({
  controllers: [PaymentReconciliationActionsController],
  providers: [PaymentReconciliationActionsService],
})
export class PaymentReconciliationActionsModule {}
