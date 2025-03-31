import { DungeonName } from '@/dungeon/dungeon-name.literal';
import { DungeonLevel } from '@/dungeon/dungeon-level.literal';

export interface Dungeon {
  readonly name: DungeonName;
  readonly minLevel: DungeonLevel;
  readonly maxLevel: DungeonLevel;
}
