export interface InvoiceGeneratedEvent {
  id: string;
  subscriptionId: string;
  userId: string;
  amount: number;
  status: string;
  dueDate: Date;
  createdAt: Date;
}
