import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GroupOrganizerModule } from '@/group/group-organizer.module';
import { DungeonModule } from '@/dungeon/dungeon.module';

import { mongodbConnection } from '@/config/mongo-connection.config';
import { MongodbModule } from '@/infra/mongodb/mongodb.module';
import { RabbitMQModule } from '@/infra/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    DungeonModule,
    GroupOrganizerModule,
    MongodbModule.forRootAsync(mongodbConnection.asProvider()),
    RabbitMQModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
