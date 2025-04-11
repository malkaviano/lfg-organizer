import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [
        `amqps://${process.env.AMQP_USER}:${process.env.AMQP_PASSWORD}@${process.env.AMQP_URI}/${process.env.AMQP_USER}`,
      ],
      queue: process.env.AMQP_QUEUE,
      queueOptions: {
        durable: true,
      },
      noAck: false,
    },
  });

  await app.startAllMicroservices();

  await app.listen(process.env.SERVER_PORT ?? 3000);
}
bootstrap();
