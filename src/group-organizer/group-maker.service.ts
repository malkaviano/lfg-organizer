import { Injectable } from '@nestjs/common';

import { QueuedPlayersRepository } from '@/group/queued-players.repository';
import { DateTimeHelper } from '@/helper/datetime.helper';

@Injectable()
export class GroupMakerService {
  constructor(
    private readonly queuePlayersRepository: QueuedPlayersRepository
  ) {}

  async group(playerIds: string[]): Promise<boolean> {
    const result = await this.queuePlayersRepository.changeStatus(
      playerIds,
      'GROUPED'
    );

    const allChanged = result === playerIds.length;

    if (!allChanged) {
      await this.queuePlayersRepository.changeStatus(playerIds, 'WAITING');
    }

    return Promise.resolve(allChanged);
  }

  async reset(playerIds: string[]): Promise<void> {
    await this.queuePlayersRepository.changeStatus(playerIds, 'WAITING');
  }
}
