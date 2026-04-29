import { Injectable, OnModuleInit } from '@nestjs/common';
import { BillingService } from '../billing.service';
import { createEventConsumer } from '../../infrastructure/messaging/event-consumer';
import { InvoicePaidEvent } from '../../contracts/events/invoice-paid.event';

@Injectable()
export class InvoicePaidConsumer implements OnModuleInit {
  constructor(private readonly billingService: BillingService) {}

  async onModuleInit() {
    await createEventConsumer(
      'billing.queue',
      ['invoice.paid'],
      this.handle.bind(this),
    );
  }

  private async handle(event: InvoicePaidEvent): Promise<void> {
    await this.billingService.handleInvoicePaid(event);
  }
}
