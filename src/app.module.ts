import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';

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
import { QueueModule } from '@/infra/queue/queue.module';

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
    MikroOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        driver: PostgreSqlDriver,
        dbName: configService.get<string>('PG_DATABASE_NAME'),
        host: configService.get<string>('PG_DATABASE_HOST'),
        port: configService.get<number>('PG_DATABASE_PORT'),
        user: configService.get<string>('PG_DATABASE_USER'),
        password: configService.get<string>('PG_DATABASE_PASSWORD'),
        entities: ['../dist/group-organizer/model'],
        entitiesTs: ['../src/group-organizer/model'],
        autoLoadEntities: true,
      }),
    }),
    QueueModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
