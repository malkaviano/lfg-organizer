import { ClientsModule, RmqOptions, Transport } from '@nestjs/microservices';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ReturnedPlayerController } from '@/group/queue/returned-player.controller';
import { QueuedPlayersModule } from '@/group/repository/queued-players.module';
import { GroupProducerService } from '@/group/queue/group-producer.service';
import {
  GroupProducedToken,
  QueueClientToken,
} from '@/group/interface/group-producer.interface';

@Module({
  imports: [
    QueuedPlayersModule,
    ClientsModule.registerAsync([
      {
        name: QueueClientToken,
        useFactory: async (configService: ConfigService) =>
          configService.get<RmqOptions>('rmqOptions')!,
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [ReturnedPlayerController],
  providers: [{ provide: GroupProducedToken, useClass: GroupProducerService }],
  exports: [{ provide: GroupProducedToken, useClass: GroupProducerService }],
})
export class QueueModule {}
