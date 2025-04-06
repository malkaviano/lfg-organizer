import { Injectable } from '@nestjs/common';

import { QueuedPlayersRepository } from '@/group/queued-players.repository';
import { DungeonName } from '@/dungeon/dungeon-name.literal';

export type Party = {
  readonly tank: string;
  readonly healer: string;
  readonly damage: string[];
};

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

  async partyFor(dungeonName: DungeonName): Promise<Party | null> {
    const tank = await this.queuePlayersRepository.nextInQueue(
      dungeonName,
      'Tank'
    );

    if (!tank) {
      return Promise.resolve(null);
    }

    const healer = await this.queuePlayersRepository.nextInQueue(
      dungeonName,
      'Healer',
      [tank.id]
    );

    if (!healer) {
      return Promise.resolve(null);
    }

    const damage1 = await this.queuePlayersRepository.nextInQueue(
      dungeonName,
      'Damage',
      [tank.id, healer.id]
    );

    if (!damage1) {
      return Promise.resolve(null);
    }
    const damage2 = await this.queuePlayersRepository.nextInQueue(
      dungeonName,
      'Damage',
      [tank.id, healer.id, damage1.id]
    );

    if (!damage2) {
      return Promise.resolve(null);
    }

    const damage3 = await this.queuePlayersRepository.nextInQueue(
      dungeonName,
      'Damage',
      [tank.id, healer.id, damage1.id, damage2.id]
    );

    if (!damage3) {
      return Promise.resolve(null);
    }

    const party: Party = {
      tank: tank.id,
      healer: healer.id,
      damage: [damage1.id, damage2.id, damage3.id],
    };

    return Promise.resolve(party);
  }
}
