import { getRabbitChannel } from './rabbit.connection';

export async function createEventConsumer(
  queueName: string,
  routingKeys: string[],
  handler: (event: any) => Promise<void>,
) {
  const channel = await getRabbitChannel();

  // cria fila do módulo
  const q = await channel.assertQueue(queueName, {
    durable: true,
  });

  // liga fila ao exchange com routing keys
  for (const key of routingKeys) {
    await channel.bindQueue(q.queue, 'domain.events', key);
  }

  await channel.consume(q.queue, async (msg) => {
    if (!msg) return;

    try {
      const data = JSON.parse(msg.content.toString());

      console.log(`📥 Event received → ${msg.fields.routingKey}`);

      await handler(data);

      channel.ack(msg);
    } catch (err) {
      console.error('❌ Error processing event', err);
      channel.nack(msg); // volta pra fila
    }
  });
}
