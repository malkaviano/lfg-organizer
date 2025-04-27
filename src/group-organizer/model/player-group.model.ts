import { Entity, PrimaryKey } from '@mikro-orm/core';

import { DungeonGroup } from '@/dungeon/dungeon-group.type';
import { DungeonName } from '@/dungeon/dungeon-name.literal';

@Entity()
export class PlayerGroupModel {
  @PrimaryKey() public id: string;

  public sentAt: string | null;

  constructor(
    id: string,
    public readonly dungeon: DungeonName,
    public readonly group: DungeonGroup,
    public readonly createdAt: string
  ) {
    this.id = id;

    this.sentAt = null;
  }
}
