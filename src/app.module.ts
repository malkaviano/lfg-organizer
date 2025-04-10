import { Module } from '@nestjs/common';

import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GroupOrganizerModule } from '@/group/group-organizer.module';
import { DungeonModule } from '@/dungeon/dungeon.module';

import { mongoConnection } from '@/config/mongo-connection.config';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forRootAsync(mongoConnection.asProvider()),
    DungeonModule,
    GroupOrganizerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
