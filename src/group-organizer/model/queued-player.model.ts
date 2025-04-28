import { DungeonName } from '@/dungeon/dungeon-name.literal';
import { PlayerRole } from '@/dungeon/player-role.literal';
import { PlayerStatus } from '@/group/player-status.literal';
import { PlayerLevel } from '@/dungeon/player-level.literal';

export class QueuedPlayerModel {
  public id!: string;

  public level!: PlayerLevel;

  public roles!: PlayerRole[];

  public dungeons!: DungeonName[];

  public queuedAt!: string;

  public status!: PlayerStatus;

  public playingWith!: string[];

  public groupId?: string;

  public groupedAt?: string;
}
