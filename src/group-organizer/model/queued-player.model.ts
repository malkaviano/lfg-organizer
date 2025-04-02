import { DungeonName } from '@/dungeon/dungeon-name.literal';
import { PlayerRole } from '@/dungeon/dungeon-role.literal';
import { PlayerLevel } from '@/dungeon/player-level.literal';
import { PlayerStatus } from '@/group/player-status.literal';

export class QueuedPlayerModel {
  public id: string;
  public level: PlayerLevel;
  public roles: PlayerRole[];
  public dungeons: DungeonName[];
  public queuedAt: string;
  public status: PlayerStatus;

  constructor(
    args: {
      readonly id: string;
      readonly level: PlayerLevel;
      readonly roles: PlayerRole[];
      readonly dungeons: DungeonName[];
      readonly queuedAt: string;
      readonly status: PlayerStatus;
    } = {
      id: '',
      level: 10,
      roles: [],
      dungeons: [],
      queuedAt: '',
      status: 'WAITING',
    }
  ) {
    const { id, level, roles, dungeons, queuedAt, status } = args;

    this.id = id;
    this.level = level;
    this.roles = roles;
    this.dungeons = dungeons;
    this.queuedAt = queuedAt;
    this.status = status;
  }
}
