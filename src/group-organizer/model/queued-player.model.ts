import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

import { DungeonName } from '@/dungeon/dungeon-name.literal';
import { PlayerRole } from '@/dungeon/player-role.literal';
import { PlayerLevel } from '@/dungeon/player-level.literal';
import { PlayerStatus } from '@/group/player-status.literal';

@Entity({ tableName: 'queued_players' })
export class QueuedPlayerModel {
  @PrimaryKey({ type: 'string' })
  public id!: string;

  @Property({ type: 'smallint' })
  public level!: PlayerLevel;

  @Property({ type: 'string[]' })
  public roles!: PlayerRole[];

  @Property({ type: 'string[]' })
  public dungeons!: DungeonName[];

  @Property({ type: 'string' })
  public queuedAt!: string;

  @Property({ type: 'string' })
  public status!: PlayerStatus;

  @Property({ type: 'string[]' })
  public playingWith!: string[];

  @Property({ type: 'string' })
  public groupId?: string;

  @Property({ type: 'string' })
  public groupedAt?: string;
}
