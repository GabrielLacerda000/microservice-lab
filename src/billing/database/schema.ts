import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const plansTable = sqliteTable('plans', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  price: integer('price').notNull(),
  interval: text('interval', { enum: ['monthly', 'yearly'] }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const subscriptionsTable = sqliteTable('subscriptions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  planId: text('plan_id').notNull(),
  status: text('status', {
    enum: ['pending', 'active', 'suspended'],
  }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const invoicesTable = sqliteTable('invoices', {
  id: text('id').primaryKey(),
  subscriptionId: text('subscription_id').notNull(),
  userId: text('user_id').notNull(),
  amount: integer('amount').notNull(),
  status: text('status', { enum: ['pending', 'paid', 'failed'] }).notNull(),
  dueDate: integer('due_date', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
