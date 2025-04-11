import { Module } from '@nestjs/common';

import { GroupMakerService } from '@/group/group-maker/group-maker.service';
import { QueuedPlayersModule } from '@/group/repository/queued-players.module';
import { GroupQueueingService } from '@/group/group-maker/group-queueing.service';
import { HelperModule } from '@/helper/helper.module';

@Module({
  imports: [HelperModule, QueuedPlayersModule],
  providers: [GroupMakerService, GroupQueueingService],
  exports: [GroupMakerService, GroupQueueingService],
})
export class GroupMakerModule {}
