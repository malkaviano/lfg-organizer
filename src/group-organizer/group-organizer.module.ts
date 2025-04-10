import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { GroupOrganizerController } from '@/group/group-organizer.controller';
import { GroupQueueingService } from '@/group/group-queueing.service';
import { QueuedPlayersRepository } from '@/group/repository/queued-players.repository';
import { HelperModule } from '@/helper/helper.module';
import { GroupMakerService } from '@/group/group-maker.service';
import { CoordinatorService } from '@/group/coordinator.service';
import { GroupProducedToken } from '@/group/interface/group-producer.interface';
import { GroupFormedProducer } from '@/group/group-formed.producer';
import {
  QueuedPlayerModel,
  QueuedPlayerSchema,
} from '@/group/model/queued-player.model';
import { MongoQueuedPlayersRepository } from '@/group/repository/mongo-queued-players.repository';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HelperModule,
    MongooseModule.forFeature([
      { name: QueuedPlayerModel.name, schema: QueuedPlayerSchema },
    ]),
  ],
  controllers: [GroupOrganizerController],
  providers: [
    GroupQueueingService,
    QueuedPlayersRepository,
    GroupMakerService,
    CoordinatorService,
    {
      provide: GroupProducedToken,
      useClass: GroupFormedProducer,
    },
    MongoQueuedPlayersRepository,
  ],
})
export class GroupOrganizerModule {}
