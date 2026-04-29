import amqp, { Channel, ChannelModel } from 'amqplib';

let channel: Channel;

export async function getRabbitChannel(): Promise<Channel> {
  if (channel) return channel;

  const connection: ChannelModel = await amqp.connect(
    process.env.RABBITMQ_URL!,
  );

  channel = await connection.createChannel();

  // 🔴 CRIA O EXCHANGE PRINCIPAL DO SISTEMA
  await channel.assertExchange('domain.events', 'topic', {
    durable: true,
  });

  console.log('🐰 RabbitMQ connected');

  return channel;
}
