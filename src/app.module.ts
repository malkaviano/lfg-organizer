import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { GroupOrganizerModule } from '@/group/group-organizer.module';
import { DungeonModule } from '@/dungeon/dungeon.module';
import mongodbConnection from '@/config/mongo-connection.config';
import { MongodbModule } from '@/infra/mongodb/mongodb.module';
import rabbitClientConfig from '@/config/rmq-proxy.config';
import rabbitConfig from '@/config/rmq.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [mongodbConnection, rabbitClientConfig, rabbitConfig],
    }),
    ScheduleModule.forRoot(),
    DungeonModule,
    GroupOrganizerModule,
    MongodbModule.forRootAsync(mongodbConnection.asProvider()),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
