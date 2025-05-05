import { DungeonGroup } from '@/dungeon/dungeon-group.type';
import { DungeonName } from '@/dungeon/dungeon-name.literal';
import { PlayerRole } from '@/dungeon/player-role.literal';
import { QueuedPlayerEntity } from '@/group/entity/queued-player.entity';
import { PlayerStatus } from '@/group/player-status.literal';
import { PlayerGroupMessage } from '@/group/dto/player-group.message';

export const QueuedPlayersRepositoryToken = Symbol('QueuedPlayersRepository');

export interface QueuedPlayersRepository {
  add(players: QueuedPlayerEntity[]): Promise<number>;

  get(playerIds: string[]): Promise<QueuedPlayerEntity[]>;

  return(playerIds: string[]): Promise<number>;

  remove(playerIds: string[]): Promise<number>;

  nextInQueue(
    dungeonName: DungeonName,
    playerRole: PlayerRole,
    ignoreIds: string[]
  ): Promise<QueuedPlayerEntity | null>;

  createGroup(group: DungeonGroup, dungeonName: DungeonName): Promise<boolean>;

  groupsToSend(): Promise<PlayerGroupMessage[]>;

  groupsSent(groupIds: string[]): Promise<void>;
}
