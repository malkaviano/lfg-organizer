import { DungeonGroup } from '@/dungeon/dungeon-group.type';

export const GroupProducedToken = Symbol('GroupProduced');

export interface GroupProducer {
  send(group: DungeonGroup): Promise<void>;
}
