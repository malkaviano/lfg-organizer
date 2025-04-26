import { Module } from '@nestjs/common';

import { GroupOrganizerController } from '@/group/group-organizer.controller';
import { HelperModule } from '@/helper/helper.module';
import { CoordinatorService } from '@/group/coordinator.service';
import { GroupMakerModule } from '@/group/group-maker/group-maker.module';

@Module({
  imports: [HelperModule, GroupMakerModule],
  controllers: [GroupOrganizerController],
  providers: [CoordinatorService],
})
export class GroupOrganizerModule {}
