export interface InvoicePaidEvent {
  invoiceId: string;
  subscriptionId: string;
  userId: string;
  paidAt: Date;
}
