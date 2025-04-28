import { ClientsModule, RmqOptions } from '@nestjs/microservices';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { QueuedPlayerController } from '@/infra/queue/queued-player.controller';
import { GroupProducerService } from '@/infra/queue/group-producer.service';
import {
  GroupProducedToken,
  QueueClientToken,
} from '@/group/interface/group-producer.interface';
import { GroupMakerModule } from '@/group/group-maker/group-maker.module';

@Module({
  imports: [
    GroupMakerModule,
    ClientsModule.registerAsync([
      {
        name: QueueClientToken,
        useFactory: async (configService: ConfigService) =>
          configService.get<RmqOptions>('rmqOptions')!,
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [QueuedPlayerController],
  providers: [{ provide: GroupProducedToken, useClass: GroupProducerService }],
})
export class QueueModule {}
