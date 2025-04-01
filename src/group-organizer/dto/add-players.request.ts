import { PlayerLevel } from '@/dungeon/player-level.literal';
import { DungeonName } from '@/dungeon/dungeon-name.literal';
import { DungeonRole } from '@/dungeon/dungeon-role.literal';

export interface AddPlayersQueueRequest {
  readonly players: PlayerQueueRequest[];
}

interface PlayerQueueRequest {
  readonly id: string;
  readonly level: PlayerLevel;
  readonly roles: DungeonRole[];
  readonly dungeons: DungeonName[];
}
