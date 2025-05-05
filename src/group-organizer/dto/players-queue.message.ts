import { PlayerLevel } from '@/dungeon/player-level.literal';
import { DungeonName } from '@/dungeon/dungeon-name.literal';
import { PlayerRole } from '@/dungeon/player-role.literal';

export interface PlayersQueueMessage {
  readonly players: PlayerQueue[];
  readonly dungeons: DungeonName[];
  readonly queuedAt: string;
}

interface PlayerQueue {
  readonly id: string;
  readonly level: PlayerLevel;
  readonly roles: PlayerRole[];
}
