import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { DocsModule } from './docs/docs.module';
import { FrappeModule } from './frappe/frappe.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { EventsModule } from './events/events.module';
import { BankingActionsModule } from './actions/banking/banking.module';
import { PaymentReconciliationActionsModule } from './actions/payment-reconciliation/payment-reconciliation.module';
import { PaymentRequestsActionsModule } from './actions/payment-requests/payment-requests.module';
import { PlaidIntegrationModule } from './integrations/plaid/plaid.module';
import { AddonsModule } from './resources/addons/addons.module';
import { TiersModule } from './resources/tiers/tiers.module';
import { RESOURCES, createResourceModule } from './registry';

const resourceModules = RESOURCES.map((def) => createResourceModule(def));

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    AuthModule,
    DocsModule,
    FrappeModule,
    WebhooksModule,
    EventsModule,
    BankingActionsModule,
    PaymentReconciliationActionsModule,
    PaymentRequestsActionsModule,
    PlaidIntegrationModule,
    AddonsModule,
    TiersModule,
    ...resourceModules,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
