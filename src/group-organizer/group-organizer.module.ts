import { Module } from '@nestjs/common';

import { GroupOrganizerController } from '@/group/group-organizer.controller';
import { HelperModule } from '@/helper/helper.module';
import { CoordinatorService } from '@/group/coordinator.service';
import { GroupMakerModule } from '@/group/group-maker/group-maker.module';
import { QueueModule } from '@/infra/queue/queue.module';

@Module({
  imports: [HelperModule, GroupMakerModule, QueueModule],
  controllers: [GroupOrganizerController],
  providers: [CoordinatorService],
})
export class GroupOrganizerModule {}
