import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MessagingModule } from './infrastructure/messaging/messaging.module';
import { UsersModule } from './users/users.module';
import { NotificationsModule } from './notifications/notifications.module';
import { BillingModule } from './billing/billing.module';
import { PaymentsModule } from './payments/payments.module';
import { DlqModule } from './dlq/dlq.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MessagingModule,
    UsersModule,
    NotificationsModule,
    BillingModule,
    PaymentsModule,
    DlqModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
