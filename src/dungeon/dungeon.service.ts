import { Injectable } from '@nestjs/common';

import { Dungeon } from '@/dungeon/dungeon.definition';

@Injectable()
export class DungeonService {
  public static readonly Dungeons: Dungeon[] = [
    { name: 'RagefireChasm', minLevel: 17, maxLevel: 24 },
    { name: 'WailingCaverns', minLevel: 18, maxLevel: 25 },
    { name: 'Deadmines', minLevel: 20, maxLevel: 28 },
  ];
}
