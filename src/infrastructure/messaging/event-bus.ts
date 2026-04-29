import { Injectable } from '@nestjs/common';
import { getRabbitChannel } from './rabbit.connection';

@Injectable()
export class EventBus {
  async publish(eventName: string, payload: any) {
    const channel = await getRabbitChannel();

    channel.publish(
      'domain.events', // exchange
      eventName, // routing key
      Buffer.from(JSON.stringify(payload)),
      { persistent: true },
    );

    console.log(`📢 Event published → ${eventName}`);
  }
}
