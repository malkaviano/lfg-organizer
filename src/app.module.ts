import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { GroupOrganizerModule } from '@/group/group-organizer.module';
import { DungeonModule } from '@/dungeon/dungeon.module';
import { QueueModule } from '@/infra/queue/queue.module';

import rabbitGroupsClientConfig from '@/config/rmq-groups-proxy.config';
import rabbitPlayersConfig from '@/config/rmq-players.config';
import dungeonConfig from '@/config/dungeon.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [rabbitGroupsClientConfig, rabbitPlayersConfig, dungeonConfig],
    }),
    ScheduleModule.forRoot(),
    DungeonModule,
    GroupOrganizerModule,
    QueueModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
