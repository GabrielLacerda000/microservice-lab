import { Injectable } from '@nestjs/common';
import { getRabbitChannel } from '../infrastructure/messaging/rabbit.connection';

@Injectable()
export class DlqService {
  async getQueueInfo(queueName: string) {
    const channel = await getRabbitChannel();
    const info = await channel.checkQueue(queueName);
    return { queue: queueName, messageCount: info.messageCount };
  }

  async reprocessOne(queueName: string) {
    const channel = await getRabbitChannel();
    const msg = await channel.get(queueName, { noAck: false });

    if (!msg) {
      return { reprocessed: false, reason: 'Queue is empty' };
    }

    // x-death entries are ordered newest-first; the last entry has the original routing key
    const deaths = msg.properties.headers?.['x-death'] as
      | Array<{ 'routing-keys': string[] }>
      | undefined;
    const originalRoutingKey = deaths?.at(-1)?.['routing-keys']?.[0];

    if (!originalRoutingKey) {
      channel.nack(msg, false, true);
      return {
        reprocessed: false,
        reason: 'Could not determine original routing key',
      };
    }

    channel.publish('domain.events', originalRoutingKey, msg.content, {
      persistent: true,
    });
    channel.ack(msg);

    console.log(
      `♻️  [DLQ] Reprocessing message from ${queueName} → ${originalRoutingKey}`,
    );

    return {
      reprocessed: true,
      queue: queueName,
      routingKey: originalRoutingKey,
    };
  }
}
