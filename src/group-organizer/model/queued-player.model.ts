import { Entity, PrimaryKey } from '@mikro-orm/core';

import { DungeonName } from '@/dungeon/dungeon-name.literal';
import { PlayerRole } from '@/dungeon/player-role.literal';
import { PlayerLevel } from '@/dungeon/player-level.literal';
import { PlayerStatus } from '@/group/player-status.literal';

@Entity()
export class QueuedPlayerModel {
  @PrimaryKey({ autoincrement: true })
  public id!: BigInt;

  public level: PlayerLevel;

  public roles: PlayerRole[];

  public dungeons: DungeonName[];

  public queuedAt: string;

  public status: PlayerStatus;

  public playingWith: string[];

  public groupId?: string;

  public groupedAt?: string;

  constructor(
    args: {
      readonly level: PlayerLevel;
      readonly roles: PlayerRole[];
      readonly dungeons: DungeonName[];
      readonly queuedAt: string;
      readonly status: PlayerStatus;
      readonly playingWith: string[];
    } = {
      level: 10,
      roles: [],
      dungeons: [],
      queuedAt: '',
      status: 'WAITING',
      playingWith: [],
    }
  ) {
    const { level, roles, dungeons, queuedAt, status } = args;

    this.level = level;
    this.roles = roles;
    this.dungeons = dungeons;
    this.queuedAt = queuedAt;
    this.status = status;
    this.playingWith = args.playingWith;
  }
}
