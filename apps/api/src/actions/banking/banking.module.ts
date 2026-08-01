import { Module } from '@nestjs/common';
import { BankingActionsController } from './banking.controller';
import { BankingActionsService } from './banking.service';

@Module({
  controllers: [BankingActionsController],
  providers: [BankingActionsService],
})
export class BankingActionsModule {}
