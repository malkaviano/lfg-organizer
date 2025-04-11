import { Module } from '@nestjs/common';

import { ReturnedPlayerController } from './returned-player.controller';
import { GroupMakerModule } from '@/group/group-maker/group-maker.module';

@Module({
  imports: [GroupMakerModule],
  controllers: [ReturnedPlayerController],
})
export class RabbitMQModule {}
