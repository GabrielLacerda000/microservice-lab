import { Module } from '@nestjs/common';
import { InvoiceGeneratedConsumer } from './consumers/invoice-generated.consumer';

@Module({
  providers: [InvoiceGeneratedConsumer],
})
export class PaymentsModule {}
