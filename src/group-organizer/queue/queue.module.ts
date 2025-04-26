import { ClientsModule, RmqOptions } from '@nestjs/microservices';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ReturnedPlayerController } from '@/group/queue/returned-player.controller';
import { GroupProducerService } from '@/group/queue/group-producer.service';
import {
  GroupProducedToken,
  QueueClientToken,
} from '@/group/interface/group-producer.interface';
import { MongodbModule } from '@/infra/mongodb/mongodb.module';

@Module({
  imports: [
    MongodbModule,
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
