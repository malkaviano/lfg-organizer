import { Module } from '@nestjs/common';

import { GroupOrganizerController } from '@/group/group-organizer.controller';
import { GroupQueueingService } from '@/group/group-queueing.service';
import { QueuedPlayersRepository } from '@/group/repository/queued-players.repository';
import { HelperModule } from '@/helper/helper.module';
import { GroupMakerService } from '@/group/group-maker.service';
import { CoordinatorService } from '@/group/coordinator.service';
import { GroupProducedToken } from '@/group/interface/group-producer.interface';
import { GroupFormedProducer } from '@/group/group-formed.producer';
import { QueuedPlayersModule } from '@/group/repository/queued-players.module';

@Module({
  imports: [HelperModule, QueuedPlayersModule],
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
  ],
})
export class GroupOrganizerModule {}
