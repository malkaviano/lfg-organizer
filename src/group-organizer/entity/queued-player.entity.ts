import { DungeonName } from '@/dungeon/dungeon-name.literal';
import { PlayerRole } from '@/dungeon/dungeon-role.literal';
import { PlayerLevel } from '@/dungeon/player-level.literal';

export class QueuedPlayerEntity {
  constructor(
    public readonly id: string,
    public readonly level: PlayerLevel,
    public readonly roles: PlayerRole[],
    public readonly dungeons: DungeonName[],
    public readonly queuedAt: string
  ) {}
}
