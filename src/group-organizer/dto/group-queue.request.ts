import { PlayerLevel } from '@/dungeon/player-level.literal';
import { DungeonName } from '@/dungeon/dungeon-name.literal';
import { PlayerRole } from '@/dungeon/player-role.literal';

export interface GroupQueueRequest {
  readonly players: PlayerQueueRequest[];
  readonly dungeons: DungeonName[];
}

interface PlayerQueueRequest {
  readonly id: string;
  readonly level: PlayerLevel;
  readonly roles: PlayerRole[];
}
