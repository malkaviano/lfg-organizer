import { Module } from '@nestjs/common';

import { GroupOrganizerController } from '@/group/group-organizer.controller';
import { GroupOrganizerService } from '@/group/group-organizer.service';
import { DungeonModule } from '@/dungeon/dungeon.module';

@Module({
  imports: [DungeonModule],
  controllers: [GroupOrganizerController],
  providers: [GroupOrganizerService],
})
export class GroupOrganizerModule {}
