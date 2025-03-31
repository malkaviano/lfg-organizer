import { DungeonName } from '@/dungeon/dungeon-name.literal';
import { PlayerLevel } from '@/dungeon/player-level.literal';

export interface Dungeon {
  readonly name: DungeonName;
  readonly minLevel: PlayerLevel;
  readonly maxLevel: PlayerLevel;
}
