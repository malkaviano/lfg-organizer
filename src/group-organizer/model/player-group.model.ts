import { Entity, PrimaryKey } from '@mikro-orm/core';

import { DungeonGroup } from '@/dungeon/dungeon-group.type';
import { DungeonName } from '@/dungeon/dungeon-name.literal';

@Entity()
export class PlayerGroupModel {
  @PrimaryKey({ autoincrement: true })
  public id!: BigInt;

  public sentAt: string | null;

  constructor(
    public readonly dungeon: DungeonName,
    public readonly group: DungeonGroup,
    public readonly createdAt: string
  ) {
    this.sentAt = null;
  }
}
