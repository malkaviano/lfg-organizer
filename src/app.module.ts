import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { GroupOrganizerModule } from '@/group/group-organizer.module';
import { DungeonModule } from '@/dungeon/dungeon.module';
import { MongodbModule } from '@/infra/mongodb/mongodb.module';
import mongodbConnection from '@/config/mongo-connection.config';
import rabbitClientConfig from '@/config/rmq-proxy.config';
import rabbitConfig from '@/config/rmq.config';
import mongodbCollection from '@/config/mongo-collection.config';
import dungeonConfig from '@/config/dungeon.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        mongodbConnection,
        rabbitClientConfig,
        rabbitConfig,
        mongodbCollection,
        dungeonConfig,
      ],
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
