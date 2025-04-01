import { Injectable } from '@nestjs/common';

import { AddPlayersQueueRequest } from '@/group/dto/add-players.request';
import { QueuedPlayersRepository } from '@/group/queued-players.repository';
import { QueuedPlayerEntity } from './entity/queued-player.entity';
import { DateTimeHelper } from '@/helper/datetime.helper';
import { DungeonService } from '@/dungeon/dungeon.service';

@Injectable()
export class GroupOrganizerService {
  constructor(
    private readonly queuePlayersRepository: QueuedPlayersRepository,
    private readonly dateTimeHelper: DateTimeHelper
  ) {}

  async queuePlayers(request: AddPlayersQueueRequest): Promise<void> {
    const timestamp = this.dateTimeHelper.timestamp();

    const party = { tank: 0, healer: 0, damage: 0 };

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

      const dungeons = [...new Set(p.dungeons)];

      if (!DungeonService.checkPlayerLevel(dungeons, p.level)) {
        throw new Error(
          'one or more players have incorrect level for selected dungeons'
        );
      }

      const entity = new QueuedPlayerEntity(
        p.id,
        p.level,
        roles,
        dungeons,
        timestamp
      );

      return entity;
    });

    if (party.tank > 1) {
      throw new Error('a group cannot have more than one tank');
    } else if (party.healer > 1) {
      throw new Error('a group cannot have more than one healer');
    } else if (party.damage > 3) {
      throw new Error('a group cannot have more than three damage dealers');
    }

    await this.queuePlayersRepository.queue(players);
  }
}
