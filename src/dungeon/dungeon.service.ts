import { Injectable } from '@nestjs/common';

import { Dungeon } from '@/dungeon/dungeon.definition';
import { DungeonName } from './dungeon-name.literal';
import { PlayerLevel } from './player-level.literal';

@Injectable()
export class DungeonService {
  public static readonly Dungeons = new Map<DungeonName, Dungeon>([
    ['RagefireChasm', { name: 'RagefireChasm', minLevel: 17, maxLevel: 24 }],
    ['WailingCaverns', { name: 'WailingCaverns', minLevel: 18, maxLevel: 25 }],
    ['Deadmines', { name: 'Deadmines', minLevel: 20, maxLevel: 28 }],
  ]);

  public static checkPlayerLevel(
    dungeons: DungeonName[],
    level: PlayerLevel
  ): boolean {
    let result = true;

    dungeons.forEach((dungeon) => {
      const minLevel = this.Dungeons.get(dungeon)?.minLevel ?? 0;

      const maxLevel = this.Dungeons.get(dungeon)?.maxLevel ?? 0;

      result = result && minLevel <= level && maxLevel >= level;
    });

    return result;
  }
}
