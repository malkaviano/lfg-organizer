import { ClientsModule, RmqOptions } from '@nestjs/microservices';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { QueuedPlayerController } from '@/infra/queue/queued-player.controller';
import { GroupProducerService } from '@/infra/queue/group-producer.service';
import { GroupMakerModule } from '@/group/group-maker/group-maker.module';
import { GroupProducedToken, GroupProducedProxyToken } from '../../tokens';

@Module({
  imports: [
    GroupMakerModule,
    ClientsModule.registerAsync([
      {
        name: GroupProducedProxyToken,
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
