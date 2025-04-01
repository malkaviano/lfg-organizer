import { Module } from '@nestjs/common';

import { GroupOrganizerController } from '@/group/group-organizer.controller';
import { GroupOrganizerService } from '@/group/group-organizer.service';
import { QueuedPlayersRepository } from '@/group/queued-players.repository';
import { HelperModule } from '@/helper/helper.module';

@Module({
  imports: [HelperModule],
  controllers: [GroupOrganizerController],
  providers: [GroupOrganizerService, QueuedPlayersRepository],
})
export class GroupOrganizerModule {}
