import { Inject, Injectable } from '@nestjs/common';

import { QueuedPlayerEntity } from '@/group/entity/queued-player.entity';
import { DungeonService } from '@/dungeon/dungeon.service';
import { PlayersDequeueMessage } from '@/group/dto/players-dequeue.message';
import {
  QueuedPlayersRepository,
  QueuedPlayersRepositoryToken,
} from '@/group/interface/queued-players-repository.interface';
import { PlayersQueueMessage } from '@/group/dto/players-queue.message';
import { PlayersUnGroupMessage } from '@/group/dto/players-ungroup.message';

@Injectable()
export class PlayersQueueingService {
  constructor(
    @Inject(QueuedPlayersRepositoryToken)
    private readonly queuePlayersRepository: QueuedPlayersRepository
  ) {}

  async queue(
    message: PlayersQueueMessage
  ): Promise<{ result: boolean; errorMsg?: string }> {
    const party = { tank: 0, healer: 0, damage: 0 };

    const obj: { result: boolean; errorMsg?: string } = {
      result: true,
    };

    const playerIds = message.players.map((p) => p.id);

    const players = message.players.map((p) => {
      const roles = [...new Set(p.roles)];

      roles.reduce((acc, role) => {
        switch (role) {
          case 'Damage':
            acc.damage += 1;
            break;
          case 'Healer':
            acc.healer += 1;
            break;
          case 'Tank':
            acc.tank += 1;
            break;
        }

        return acc;
      }, party);

      const dungeons = [...new Set(message.dungeons)];

      if (!DungeonService.checkPlayerLevel(dungeons, p.level)) {
        obj.result = false;
        obj.errorMsg =
          'one or more players have incorrect level for selected dungeons';
      }

      const entity = new QueuedPlayerEntity(
        p.id,
        p.level,
        roles,
        dungeons,
        message.queuedAt,
        playerIds.filter((id) => id !== p.id)
      );

      return entity;
    });

    if (party.tank > 1) {
      obj.result = false;
      obj.errorMsg = 'a group cannot have more than one tank';
    } else if (party.healer > 1) {
      obj.result = false;
      obj.errorMsg = 'a group cannot have more than one healer';
    } else if (party.damage > 3) {
      obj.result = false;
      obj.errorMsg = 'a group cannot have more than three damage dealers';
    }

    if (!obj.result) {
      return obj;
    }

    try {
      await this.queuePlayersRepository.add(players);
    } catch (error) {
      obj.result = false;
      obj.errorMsg = 'one or more players are already queued';
    }

    return obj;
  }

  async dequeue(
    request: PlayersDequeueMessage
  ): Promise<{ result: boolean; errorMsg?: string }> {
    const { playerIds, processedAt } = request;

    await this.queuePlayersRepository.remove(playerIds, processedAt);

    return { result: true };
  }

  async unGroup(message: PlayersUnGroupMessage): Promise<number> {
    return this.queuePlayersRepository.return(message.playerIds);
  }
}
