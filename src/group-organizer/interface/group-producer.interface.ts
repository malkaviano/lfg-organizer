import { DungeonGroup } from '@/group/group-maker.service';

export const GroupProducedToken = Symbol('GroupProduced');

export interface GroupProducer {
  send(group: DungeonGroup): Promise<void>;
}
