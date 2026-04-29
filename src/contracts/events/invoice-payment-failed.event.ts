export interface InvoicePaymentFailedEvent {
  invoiceId: string;
  subscriptionId: string;
  userId: string;
  reason: string;
  failedAt: Date;
}
