import { DungeonGroup } from '@/dungeon/dungeon-group.type';
import { DungeonName } from '@/dungeon/dungeon-name.literal';

export class PlayerGroupModel {
  public sentAt?: string;

  constructor(
    public readonly id: string,
    public readonly dungeon: DungeonName,
    public readonly group: DungeonGroup,
    public readonly createdAt: string
  ) {}
}
