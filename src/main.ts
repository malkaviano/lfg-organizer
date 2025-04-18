import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const rmq = configService.get<MicroserviceOptions>('rabbitConnection')!;

  app.connectMicroservice<MicroserviceOptions>(rmq);

  await app.startAllMicroservices();

  await app.listen(process.env.SERVER_PORT ?? 3000);
}
bootstrap();
