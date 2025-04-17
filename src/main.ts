import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { rabbitConnection } from '@/config/rabbitmq.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.connectMicroservice<MicroserviceOptions>(
    configService.get<MicroserviceOptions>(rabbitConnection.KEY)!
  );

  await app.startAllMicroservices();

  await app.listen(process.env.SERVER_PORT ?? 3000);
}
bootstrap();
