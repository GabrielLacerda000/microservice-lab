import { Injectable, OnModuleInit } from '@nestjs/common';
import { BillingService } from '../billing.service';
import { createEventConsumer } from '../../infrastructure/messaging/event-consumer';
import { InvoicePaymentFailedEvent } from '../../contracts/events/invoice-payment-failed.event';

@Injectable()
export class InvoicePaymentFailedConsumer implements OnModuleInit {
  constructor(private readonly billingService: BillingService) {}

  async onModuleInit() {
    await createEventConsumer(
      'billing.queue',
      ['invoice.payment_failed'],
      this.handle.bind(this),
    );
  }

  private async handle(event: InvoicePaymentFailedEvent): Promise<void> {
    await this.billingService.handleInvoicePaymentFailed(event);
  }
}
