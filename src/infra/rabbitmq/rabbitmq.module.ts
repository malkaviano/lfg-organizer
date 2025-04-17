import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';

import { rabbitConnection } from '@/config/rabbitmq.config';

@Module({
  imports: [
    ClientsModule.register([rabbitConnection, { name: 'RABBITMQ_PRODUCER' }]),
  ],
})
export class RabbitMQModule {}
