import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { SequelizeModule } from '@nestjs/sequelize';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { GroupOrganizerModule } from '@/group/group-organizer.module';
import { DungeonModule } from '@/dungeon/dungeon.module';
import { QueueModule } from '@/infra/queue/queue.module';
import rabbitClientConfig from '@/config/rmq-proxy.config';
import rabbitConfig from '@/config/rmq.config';
import mongodbCollection from '@/config/mongo-collection.config';
import dungeonConfig from '@/config/dungeon.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        rabbitClientConfig,
        rabbitConfig,
        mongodbCollection,
        dungeonConfig,
      ],
    }),
    ScheduleModule.forRoot(),
    DungeonModule,
    GroupOrganizerModule,
    SequelizeModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get('PG_DATABASE_HOST'),
        port: +configService.get('PG_DATABASE_PORT'),
        username: configService.get('PG_DATABASE_USER'),
        password: configService.get('PG_DATABASE_PASSWORD'),
        database: configService.get('PG_DATABASE_NAME'),
      }),
      inject: [ConfigService],
    }),
    QueueModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
