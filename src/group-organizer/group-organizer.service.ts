import { Injectable } from '@nestjs/common';

import { AddPlayersQueueRequest } from '@/group/dto/add-players.request';
import { QueuedPlayersRepository } from '@/group/queued-players.repository';
import { QueuedPlayerEntity } from './entity/queued-player.entity';
import { DateTimeHelper } from '@/helper/datetime.helper';

@Injectable()
export class GroupOrganizerService {
  constructor(
    private readonly queuePlayersRepository: QueuedPlayersRepository,
    private readonly dateTimeHelper: DateTimeHelper
  ) {}

  async queuePlayers(request: AddPlayersQueueRequest): Promise<void> {
    const timestamp = this.dateTimeHelper.timestamp();

    const players = request.players.map((p) => {
      const roles = new Set(p.roles);

      const dungeons = new Set(p.dungeons);

      const entity = new QueuedPlayerEntity(
        p.id,
        p.level,
        [...roles],
        [...dungeons],
        timestamp
      );

      return entity;
    });

    this.queuePlayersRepository.queue(players);
  }
}
