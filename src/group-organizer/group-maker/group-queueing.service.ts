import { Inject, Injectable } from '@nestjs/common';

import { GroupQueueRequest as PlayersQueueRequest } from '@/group/dto/group-queue.request';
import { QueuedPlayerEntity } from '@/group/entity/queued-player.entity';
import { DateTimeHelper } from '@/helper/datetime.helper';
import { DungeonService } from '@/dungeon/dungeon.service';
import { GroupDequeueRequest } from '@/group/dto/group-dequeue.request';
import {
  QueuedPlayersRepository,
  QueuedPlayersRepositoryToken,
} from '@/group/interface/queued-players-repository.interface';

@Injectable()
export class GroupQueueingService {
  constructor(
    @Inject(QueuedPlayersRepositoryToken)
    private readonly queuePlayersRepository: QueuedPlayersRepository,
    private readonly dateTimeHelper: DateTimeHelper
  ) {}

  async queueParty(
    request: PlayersQueueRequest
  ): Promise<{ result: boolean; errorMsg?: string }> {
    const timestamp = this.dateTimeHelper.timestamp();

    const party = { tank: 0, healer: 0, damage: 0 };

    const obj: { result: boolean; errorMsg?: string } = {
      result: true,
    };

    const playerIds = request.players.map((p) => p.id);

    const players = request.players.map((p) => {
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

      const dungeons = [...new Set(request.dungeons)];

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
        timestamp,
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
      return Promise.resolve(obj);
    }

    try {
      await this.queuePlayersRepository.queue(players);
    } catch (error) {
      obj.result = false;
      obj.errorMsg = 'one or more players are already queued';
    }

    return Promise.resolve(obj);
  }

  async dequeueParty(
    request: GroupDequeueRequest
  ): Promise<{ result: boolean; errorMsg?: string }> {
    const total = request.playerIds.length;

    const { playerIds } = request;

    await this.queuePlayersRepository.remove(playerIds);

    return Promise.resolve({ result: true });
  }
}
