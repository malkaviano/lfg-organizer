import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

import { DungeonName } from '@/dungeon/dungeon-name.literal';
import { PlayerRole } from '@/dungeon/player-role.literal';
import { PlayerLevel } from '@/dungeon/player-level.literal';
import { PlayerStatus } from '@/group/player-status.literal';

export type QueuedPlayerDocument = HydratedDocument<QueuedPlayerModel>;

@Schema()
export class QueuedPlayerModel {
  @Prop()
  public id: string;

  @Prop(Number)
  public level: PlayerLevel;

  @Prop([String])
  public roles: PlayerRole[];

  @Prop([String])
  public dungeons: DungeonName[];

  @Prop()
  public queuedAt: string;

  @Prop()
  public status: PlayerStatus;

  @Prop([String])
  public playingWith: string[];

  constructor(
    args: {
      readonly id: string;
      readonly level: PlayerLevel;
      readonly roles: PlayerRole[];
      readonly dungeons: DungeonName[];
      readonly queuedAt: string;
      readonly status: PlayerStatus;
      readonly playingWith: string[];
    } = {
      id: '',
      level: 10,
      roles: [],
      dungeons: [],
      queuedAt: '',
      status: 'WAITING',
      playingWith: [],
    }
  ) {
    const { id, level, roles, dungeons, queuedAt, status } = args;

    this.id = id;
    this.level = level;
    this.roles = roles;
    this.dungeons = dungeons;
    this.queuedAt = queuedAt;
    this.status = status;
    this.playingWith = args.playingWith;
  }
}

export const QueuedPlayerSchema =
  SchemaFactory.createForClass(QueuedPlayerModel);
