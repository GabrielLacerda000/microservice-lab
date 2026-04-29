import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { db } from '../database/connection';
import { EventBus } from '../infrastructure/messaging/event-bus';
import { SubscriptionCreatedEvent } from '../contracts/events/subscription-created.event';
import { InvoiceGeneratedEvent } from '../contracts/events/invoice-generated.event';
import { InvoicePaidEvent } from '../contracts/events/invoice-paid.event';
import { InvoicePaymentFailedEvent } from '../contracts/events/invoice-payment-failed.event';
import {
  plansTable,
  subscriptionsTable,
  invoicesTable,
} from './database/schema';
import { CreatePlanDto } from './dto/CreatePlanDto';
import { CreateSubscriptionDto } from './dto/CreateSubscriptionDto';

@Injectable()
export class BillingService {
  constructor(private readonly eventBus: EventBus) {}

  async createPlan(data: CreatePlanDto) {
    const plan = {
      id: crypto.randomUUID(),
      name: data.name,
      price: data.price,
      interval: data.interval,
      createdAt: new Date(),
    };

    await db.insert(plansTable).values(plan);
    return plan;
  }

  async createSubscription(data: CreateSubscriptionDto) {
    const [plan] = await db
      .select()
      .from(plansTable)
      .where(eq(plansTable.id, data.planId))
      .limit(1);

    const subscription = {
      id: crypto.randomUUID(),
      userId: data.userId,
      planId: data.planId,
      status: 'pending' as const,
      createdAt: new Date(),
    };

    await db.insert(subscriptionsTable).values(subscription);

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    const invoice = {
      id: crypto.randomUUID(),
      subscriptionId: subscription.id,
      userId: data.userId,
      amount: plan?.price ?? 0,
      status: 'pending' as const,
      dueDate,
      createdAt: new Date(),
    };

    await db.insert(invoicesTable).values(invoice);

    const subscriptionEvent: SubscriptionCreatedEvent = { ...subscription };
    await this.eventBus.publish('subscription.created', subscriptionEvent);

    const invoiceEvent: InvoiceGeneratedEvent = { ...invoice };
    await this.eventBus.publish('invoice.generated', invoiceEvent);

    return subscription;
  }

  async handleInvoicePaid(event: InvoicePaidEvent) {
    await db
      .update(invoicesTable)
      .set({ status: 'paid' })
      .where(eq(invoicesTable.id, event.invoiceId));

    await db
      .update(subscriptionsTable)
      .set({ status: 'active' })
      .where(eq(subscriptionsTable.id, event.subscriptionId));

    console.log(
      `✅ [Billing] Invoice ${event.invoiceId} paid — subscription ${event.subscriptionId} activated`,
    );
  }

  async handleInvoicePaymentFailed(event: InvoicePaymentFailedEvent) {
    await db
      .update(invoicesTable)
      .set({ status: 'failed' })
      .where(eq(invoicesTable.id, event.invoiceId));

    await db
      .update(subscriptionsTable)
      .set({ status: 'suspended' })
      .where(eq(subscriptionsTable.id, event.subscriptionId));

    console.log(
      `❌ [Billing] Invoice ${event.invoiceId} failed (${event.reason}) — subscription ${event.subscriptionId} suspended`,
    );
  }
}
