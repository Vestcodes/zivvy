import { Module } from '@nestjs/common';
import { PlaidIntegrationController } from './plaid.controller';
import { PlaidIntegrationService } from './plaid.service';

@Module({
  controllers: [PlaidIntegrationController],
  providers: [PlaidIntegrationService],
})
export class PlaidIntegrationModule {}
