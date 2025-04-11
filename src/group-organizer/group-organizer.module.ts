import { Module } from '@nestjs/common';

import { GroupOrganizerController } from '@/group/group-organizer.controller';
import { HelperModule } from '@/helper/helper.module';
import { CoordinatorService } from '@/group/coordinator.service';
import { GroupProducedToken } from '@/group/interface/group-producer.interface';
import { GroupFormedProducer } from '@/group/group-formed.producer';
import { RabbitMQModule } from '@/group/rabbitmq/rabbitmq.module';
import { GroupMakerModule } from '@/group/group-maker/group-maker.module';

@Module({
  imports: [HelperModule, RabbitMQModule, GroupMakerModule],
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
