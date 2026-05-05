import { getRabbitChannel } from './rabbit.connection';

interface ConsumerOptions {
  maxRetries?: number;
  retryTtl?: number;
}

export async function createEventConsumer(
  queueName: string,
  routingKeys: string[],
  handler: (event: any) => Promise<void>,
  options: ConsumerOptions = {},
) {
  const { maxRetries = 3, retryTtl = 5000 } = options;

  // Derive names from queue (e.g. "billing.queue" → module = "billing")
  const moduleName = queueName.split('.')[0];
  const dlxName = `${moduleName}.dlx`;
  const retryQueueName = `${moduleName}.retry`;
  const dlqName = `${moduleName}.dlq`;

  const channel = await getRabbitChannel();

  // Per-module DLX (fanout preserves original routing key through the retry cycle)
  await channel.assertExchange(dlxName, 'fanout', { durable: true });

  // Retry queue: messages sleep here for retryTtl ms, then return to domain.events
  // with the original routing key (no x-dead-letter-routing-key → key is preserved)
  await channel.assertQueue(retryQueueName, {
    durable: true,
    arguments: {
      'x-message-ttl': retryTtl,
      'x-dead-letter-exchange': 'domain.events',
    },
  });
  await channel.bindQueue(retryQueueName, dlxName, '');

  // DLQ: plain durable queue — no auto-processing
  await channel.assertQueue(dlqName, { durable: true });

  // Main queue: on nack-without-requeue, messages go to module DLX
  // NOTE: if this queue already exists without these arguments, RabbitMQ will throw
  // PRECONDITION_FAILED. Delete existing queues via Management UI or `docker compose down -v`.
  const q = await channel.assertQueue(queueName, {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': dlxName,
    },
  });

  for (const key of routingKeys) {
    await channel.bindQueue(q.queue, 'domain.events', key);
  }

  await channel.consume(q.queue, (msg) => {
    if (!msg) return;

    void (async () => {
      try {
        const data = JSON.parse(msg.content.toString()) as unknown;
        console.log(`📥 Event received → ${msg.fields.routingKey}`);
        await handler(data);
        channel.ack(msg);
      } catch (err) {
        const deaths = msg.properties.headers?.['x-death'] as
          | Array<{ count: number; queue: string }>
          | undefined;
        const retryCount =
          deaths?.find((d) => d.queue === queueName)?.count ?? 0;

        console.error(
          `❌ [${msg.fields.routingKey}] attempt ${retryCount + 1}/${maxRetries} failed`,
          (err as Error).message,
        );

        if (retryCount < maxRetries) {
          // nack without requeue → goes to module DLX → retry queue (sleeps retryTtl ms)
          channel.nack(msg, false, false);
          console.log(
            `🔄 Retry ${retryCount + 1}/${maxRetries} scheduled in ${retryTtl}ms → ${retryQueueName}`,
          );
        } else {
          // Exhausted retries: publish to DLQ explicitly and ack the original
          channel.publish('', dlqName, msg.content, {
            persistent: true,
            headers: msg.properties.headers,
          });
          channel.ack(msg);
          console.log(`💀 Message moved to DLQ → ${dlqName}`);
        }
      }
    })();
  });
}
