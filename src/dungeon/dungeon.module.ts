import { Global, Module } from '@nestjs/common';

import { DungeonService } from '@/dungeon/dungeon.service';

@Global()
@Module({
  providers: [DungeonService],
  exports: [DungeonService],
})
export class DungeonModule {}
