import { Module } from '@nestjs/common';

import { GroupOrganizerController } from '@/group/group-organizer.controller';
import { GroupQueueingService } from '@/group/group-queueing.service';
import { QueuedPlayersRepository } from '@/group/queued-players.repository';
import { HelperModule } from '@/helper/helper.module';
import { GroupMakerService } from '@/group/group-maker.service';

@Module({
  imports: [HelperModule],
  controllers: [GroupOrganizerController],
  providers: [GroupQueueingService, QueuedPlayersRepository, GroupMakerService],
})
export class GroupOrganizerModule {}
