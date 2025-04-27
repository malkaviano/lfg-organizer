import { Table, PrimaryKey, Column, AllowNull } from 'sequelize-typescript';

import { DungeonName } from '@/dungeon/dungeon-name.literal';
import { PlayerRole } from '@/dungeon/player-role.literal';
import { PlayerStatus } from '@/group/player-status.literal';
import { PlayerLevel } from '@/dungeon/player-level.literal';

@Table({ tableName: 'queued_players' })
export class QueuedPlayerModel {
  @PrimaryKey
  public id!: string;

  @Column({ type: 'smallint' })
  @AllowNull(false)
  public level!: PlayerLevel;

  @Column({ type: 'string[]' })
  @AllowNull(false)
  public roles!: PlayerRole[];

  @Column({ type: 'string[]' })
  @AllowNull(false)
  public dungeons!: DungeonName[];

  @Column({ type: 'string' })
  @AllowNull(false)
  public queuedAt!: string;

  @Column({ type: 'string' })
  @AllowNull(false)
  public status!: PlayerStatus;

  @Column({ type: 'string[]' })
  @AllowNull(false)
  public playingWith!: string[];

  @Column({ type: 'string' })
  @AllowNull(true)
  public groupId?: string;

  @Column({ type: 'string' })
  @AllowNull(true)
  public groupedAt?: string;
}
