import { Module } from '@nestjs/common';

import { GroupMakerService } from '@/group/group-maker/group-maker.service';
import { GroupQueueingService } from '@/group/group-maker/group-queueing.service';
import { HelperModule } from '@/helper/helper.module';
import { DamageTankStrategy } from '@/group/group-maker/strategy/damage-tank.strategy';
import { HealerTankStrategy } from '@/group/group-maker/strategy/healer-tank.strategy';
import { TankHealerStrategy } from '@/group/group-maker/strategy/tank-healer.strategy';
import { MongodbModule } from '@/infra/mongodb/mongodb.module';

@Module({
  imports: [HelperModule, MongodbModule],
  providers: [
    GroupMakerService,
    GroupQueueingService,
    TankHealerStrategy,
    DamageTankStrategy,
    HealerTankStrategy,
  ],
  exports: [GroupMakerService, GroupQueueingService],
})
export class GroupMakerModule {}
