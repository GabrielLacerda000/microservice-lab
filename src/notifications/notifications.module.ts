import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { UserCreatedConsumer } from './consumers/user-created.consumer';

@Module({
  providers: [NotificationsService, UserCreatedConsumer],
})
export class NotificationsModule {}
