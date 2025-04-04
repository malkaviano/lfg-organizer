import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GroupOrganizerModule } from '@/group/group-organizer.module';
import { DungeonModule } from '@/dungeon/dungeon.module';

@Module({
  imports: [DungeonModule, GroupOrganizerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
