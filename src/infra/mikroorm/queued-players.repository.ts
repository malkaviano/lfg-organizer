import { Injectable } from '@nestjs/common';

import { QueuedPlayersRepository } from '@/group/interface/queued-players-repository.interface';
import { DungeonGroup } from '@/dungeon/dungeon-group.type';
import { DungeonName } from '@/dungeon/dungeon-name.literal';
import { PlayerRole } from '@/dungeon/player-role.literal';
import { PlayerGroupMessage } from '@/group/dto/player-group.message';
import { QueuedPlayerEntity } from '@/group/entity/queued-player.entity';
import { PlayerStatus } from '@/group/player-status.literal';

@Injectable()
export class MikroOrmQueuedPlayersRepository
  implements QueuedPlayersRepository
{
  queue(players: QueuedPlayerEntity[]): Promise<number> {
    throw new Error('Method not implemented.');
  }

  get(playerIds: string[]): Promise<QueuedPlayerEntity[]> {
    throw new Error('Method not implemented.');
  }

  return(playerIds: string[], newStatus: PlayerStatus): Promise<number> {
    throw new Error('Method not implemented.');
  }

  remove(playerIds: string[]): Promise<number> {
    throw new Error('Method not implemented.');
  }

  nextInQueue(
    dungeonName: DungeonName,
    playerRole: PlayerRole,
    ignoreIds: string[]
  ): Promise<QueuedPlayerEntity | null> {
    throw new Error('Method not implemented.');
  }

  createGroup(group: DungeonGroup, dungeonName: DungeonName): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  unSentGroups(): Promise<PlayerGroupMessage[]> {
    throw new Error('Method not implemented.');
  }

  confirmGroupsSent(groupIds: string[]): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
