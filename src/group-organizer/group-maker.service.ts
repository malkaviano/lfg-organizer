import { Injectable } from '@nestjs/common';

import { QueuedPlayersRepository } from '@/group/queued-players.repository';
import { DungeonName } from '@/dungeon/dungeon-name.literal';
import { PlayerRole } from '@/dungeon/dungeon-role.literal';

export type DungeonGroup = {
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

  async groupFor(dungeonName: DungeonName): Promise<DungeonGroup | null> {
    let result = await this.tankThenHealer(dungeonName);

    if (result) {
      return Promise.resolve(result);
    }

    result = await this.healerThenTank(dungeonName);

    if (result) {
      return Promise.resolve(result);
    }

    return this.damageThenTank(dungeonName);
  }

  private getPlayer(
    dungeonName: DungeonName,
    playerRole: PlayerRole,
    ...ignored: string[]
  ) {
    return this.queuePlayersRepository.nextInQueue(
      dungeonName,
      playerRole,
      ignored
    );
  }

  private async tankThenHealer(dungeonName: DungeonName) {
    const tank = await this.getPlayer(dungeonName, 'Tank');

    if (!tank) {
      return Promise.resolve(null);
    }

    const healer = await this.getPlayer(dungeonName, 'Healer', tank.id);

    if (!healer) {
      return Promise.resolve(null);
    }

    const damage1 = await this.getPlayer(
      dungeonName,
      'Damage',
      tank.id,
      healer.id
    );

    if (!damage1) {
      return Promise.resolve(null);
    }
    const damage2 = await this.getPlayer(
      dungeonName,
      'Damage',
      tank.id,
      healer.id,
      damage1.id
    );

    if (!damage2) {
      return Promise.resolve(null);
    }

    const damage3 = await this.getPlayer(
      dungeonName,
      'Damage',
      tank.id,
      healer.id,
      damage1.id,
      damage2.id
    );

    if (!damage3) {
      return Promise.resolve(null);
    }

    const party: DungeonGroup = {
      tank: tank.id,
      healer: healer.id,
      damage: [damage1.id, damage2.id, damage3.id],
    };

    return Promise.resolve(party);
  }

  private async healerThenTank(dungeonName: DungeonName) {
    const healer = await this.getPlayer(dungeonName, 'Healer');

    if (!healer) {
      return Promise.resolve(null);
    }

    const tank = await this.getPlayer(dungeonName, 'Tank', healer.id);

    if (!tank) {
      return Promise.resolve(null);
    }

    const damage1 = await this.getPlayer(
      dungeonName,
      'Damage',
      tank.id,
      healer.id
    );

    if (!damage1) {
      return Promise.resolve(null);
    }
    const damage2 = await this.getPlayer(
      dungeonName,
      'Damage',
      tank.id,
      healer.id,
      damage1.id
    );

    if (!damage2) {
      return Promise.resolve(null);
    }

    const damage3 = await this.getPlayer(
      dungeonName,
      'Damage',
      tank.id,
      healer.id,
      damage1.id,
      damage2.id
    );

    if (!damage3) {
      return Promise.resolve(null);
    }

    const party: DungeonGroup = {
      tank: tank.id,
      healer: healer.id,
      damage: [damage1.id, damage2.id, damage3.id],
    };

    return Promise.resolve(party);
  }

  private async damageThenTank(dungeonName: DungeonName) {
    const damage1 = await this.getPlayer(dungeonName, 'Damage');

    if (!damage1) {
      return Promise.resolve(null);
    }
    const damage2 = await this.getPlayer(dungeonName, 'Damage', damage1.id);

    if (!damage2) {
      return Promise.resolve(null);
    }

    const damage3 = await this.getPlayer(
      dungeonName,
      'Damage',
      damage1.id,
      damage2.id
    );

    if (!damage3) {
      return Promise.resolve(null);
    }

    const tank = await this.getPlayer(
      dungeonName,
      'Tank',
      damage1.id,
      damage2.id,
      damage3.id
    );

    if (!tank) {
      return Promise.resolve(null);
    }

    const healer = await this.getPlayer(
      dungeonName,
      'Healer',
      damage1.id,
      damage2.id,
      damage3.id,
      tank.id
    );

    if (!healer) {
      return Promise.resolve(null);
    }

    const party: DungeonGroup = {
      tank: tank.id,
      healer: healer.id,
      damage: [damage1.id, damage2.id, damage3.id],
    };

    return Promise.resolve(party);
  }
}
