import { Module } from '@nestjs/common';

import { GroupOrganizerController } from '@/group/group-organizer.controller';
import { HelperModule } from '@/helper/helper.module';
import { CoordinatorService } from '@/group/coordinator.service';
import { GroupProducedToken } from '@/group/interface/group-producer.interface';
import { GroupFormedProducer } from '@/group/group-formed.producer';
import { GroupMakerModule } from '@/group/group-maker/group-maker.module';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [HelperModule, GroupMakerModule, QueueModule],
  controllers: [GroupOrganizerController],
  providers: [
    CoordinatorService,
    {
      provide: GroupProducedToken,
      useClass: GroupFormedProducer,
    },
  ],
})
export class GroupOrganizerModule {}
