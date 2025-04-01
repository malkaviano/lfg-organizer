import { Injectable } from '@nestjs/common';

import { AddPlayersQueueRequest } from '@/group/dto/add-players.request';
import { QueuedPlayersRepository } from '@/group/queued-players.repository';
import { QueuedPlayerEntity } from './entity/queued-player.entity';

@Injectable()
export class GroupOrganizerService {
  constructor(
    private readonly queuePlayersRepository: QueuedPlayersRepository
  ) {}

  async queuePlayers(request: AddPlayersQueueRequest): Promise<void> {
    const players = request.players.map((p) => {
      const roles = new Set(p.roles);

      const dungeons = new Set(p.dungeons);

      const entity = new QueuedPlayerEntity(
        p.id,
        p.level,
        [...roles],
        [...dungeons]
      );

      return entity;
    });

    this.queuePlayersRepository.queue(players);
  }
}
