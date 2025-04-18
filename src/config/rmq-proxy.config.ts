import { registerAs } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';

export default registerAs('rmqOptions', () => ({
  transport: Transport.RMQ,
  options: {
    urls: [
      `amqps://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_URI}/${process.env.RABBITMQ_USER}`,
    ],
    queue: process.env.RABBITMQ_CLIENT_QUEUE,
    queueOptions: {
      durable: true,
    },
    noAck: true,
  },
}));
