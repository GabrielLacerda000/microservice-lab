import { Injectable, OnModuleInit } from '@nestjs/common';
import { createEventConsumer } from '../../infrastructure/messaging/event-consumer';
import { InvoiceGeneratedEvent } from '../../contracts/events/invoice-generated.event';

@Injectable()
export class InvoiceGeneratedConsumer implements OnModuleInit {
  async onModuleInit() {
    await createEventConsumer(
      'payments.queue',
      ['invoice.generated'],
      this.handle.bind(this),
    );
  }

  private async handle(event: InvoiceGeneratedEvent): Promise<void> {
    // Simulates an unreliable payment gateway (70% failure rate)
    // Demonstrates the full DLX/retry/DLQ cycle
    if (Math.random() < 0.7) {
      throw new Error(`Payment gateway timeout for invoice ${event.id}`);
    }

    console.log(
      `💳 [Payments] Invoice ${event.id} processed — amount: ${event.amount}`,
    );
  }
}
