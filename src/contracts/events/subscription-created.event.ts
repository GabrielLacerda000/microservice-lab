export interface SubscriptionCreatedEvent {
  id: string;
  userId: string;
  planId: string;
  status: string;
  createdAt: Date;
}
