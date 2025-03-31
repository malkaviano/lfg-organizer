import { Module } from '@nestjs/common';

import { DungeonService } from '@/dungeon/dungeon.service';

@Module({
  providers: [DungeonService],
  exports: [DungeonService],
})
export class DungeonModule {}
