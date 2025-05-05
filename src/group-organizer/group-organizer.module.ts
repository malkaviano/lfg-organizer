import { Module } from '@nestjs/common';

import { HelperModule } from '@/helper/helper.module';
import { CoordinatorService } from '@/group/coordinator.service';
import { GroupMakerModule } from '@/group/group-maker/group-maker.module';

@Module({
  imports: [HelperModule, GroupMakerModule],
  controllers: [],
  providers: [CoordinatorService],
})
export class GroupOrganizerModule {}
