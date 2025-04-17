import { Module } from '@nestjs/common';

import { ReturnedPlayerController } from '@/group/queue/returned-player.controller';
import { QueuedPlayersModule } from '@/group/repository/queued-players.module';
import { RabbitMQModule } from '@/infra/rabbitmq/rabbitmq.module';

@Module({
  imports: [QueuedPlayersModule, RabbitMQModule],
  exports: [],
  providers: [],
  controllers: [ReturnedPlayerController],
})
export class QueueModule {}
