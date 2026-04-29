import { Injectable, OnModuleInit } from '@nestjs/common';
import { createEventConsumer } from '../../infrastructure/messaging/event-consumer';
import { UserCreatedEvent } from '../../contracts/events/user-created.event';

@Injectable()
export class UserCreatedConsumer implements OnModuleInit {
  async onModuleInit() {
    await createEventConsumer(
      'notifications.queue',
      ['user.created'],
      this.handle.bind(this),
    );
  }

  private async handle(event: UserCreatedEvent): Promise<void> {
    console.log(
      `📧 [Notifications] Welcome email sent to ${event.email} (${event.name})`,
    );
  }
}
