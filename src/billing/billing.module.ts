import { Module } from '@nestjs/common';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { InvoicePaidConsumer } from './consumers/invoice-paid.consumer';
import { InvoicePaymentFailedConsumer } from './consumers/invoice-payment-failed.consumer';

@Module({
  controllers: [BillingController],
  providers: [
    BillingService,
    InvoicePaidConsumer,
    InvoicePaymentFailedConsumer,
  ],
})
export class BillingModule {}
