import { DungeonGroup } from '@/dungeon/dungeon-group.type';
import { DungeonName } from '@/dungeon/dungeon-name.literal';
import { PlayerRole } from '@/dungeon/player-role.literal';
import { QueuedPlayerEntity } from '@/group/entity/queued-player.entity';
import { PlayerStatus } from '@/group/player-status.literal';

export const QueuedPlayersRepositoryToken = Symbol('QueuedPlayersRepository');

export interface QueuedPlayersRepository {
  queue(players: QueuedPlayerEntity[]): Promise<number>;

  get(playerIds: string[]): Promise<QueuedPlayerEntity[]>;

  return(playerIds: string[], newStatus: PlayerStatus): Promise<number>;

  remove(playerIds: string[]): Promise<number>;

  nextInQueue(
    dungeonName: DungeonName,
    playerRole: PlayerRole,
    ignoreIds: string[]
  ): Promise<QueuedPlayerEntity | null>;

  createGroup(group: DungeonGroup): Promise<boolean>;
}
