import { Inject, Injectable } from '@nestjs/common';

import { DungeonName } from '@/dungeon/dungeon-name.literal';
import { PlayerRole } from '@/dungeon/player-role.literal';
import { DungeonGroup } from '@/dungeon/dungeon-group.type';
import {
  QueuedPlayersRepository,
  QueuedPlayersRepositoryToken,
} from '@/group/interface/queued-players-repository.interface';

type PartialGroup = {
  tank?: string;
  healer?: string;
  damage: string[];
};

@Injectable()
export class GroupMakerService {
  constructor(
    @Inject(QueuedPlayersRepositoryToken)
    private readonly queuePlayersRepository: QueuedPlayersRepository
  ) {}

  async group(playerIds: string[]): Promise<boolean> {
    return this.queuePlayersRepository.group(playerIds);
  }

  async reset(playerIds: string[]): Promise<void> {
    await this.queuePlayersRepository.return(playerIds, 'WAITING');
  }

  async groupFor(dungeonName: DungeonName): Promise<DungeonGroup | null> {
    let result: DungeonGroup | null;

    result = await this.tankThenHealer(dungeonName);

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
    let partialGroup: PartialGroup = { damage: [] };

    let ignored: string[] = [];

    const tank = await this.getPlayer(dungeonName, 'Tank');

    if (!tank) {
      return Promise.resolve(null);
    }

    partialGroup.tank = tank.id;

    ignored.push(tank.id);

    ignored = ignored.concat(tank.playingWith);

    const { resolved, group } = await this.resolvePremade(
      tank.playingWith,
      partialGroup
    );

    if (!resolved) {
      return Promise.resolve(null);
    }

    partialGroup = group;

    partialGroup = await this.resolveRole(
      dungeonName,
      ignored,
      partialGroup,
      'Healer',
      () => !partialGroup.healer
    );

    if (!partialGroup.healer) {
      return Promise.resolve(null);
    }

    partialGroup = await this.resolveRole(
      dungeonName,
      ignored,
      partialGroup,
      'Damage',
      () => partialGroup.damage.length < 3
    );

    if (partialGroup.damage.length < 3) {
      return Promise.resolve(null);
    }

    const fullGroup: DungeonGroup = {
      tank: partialGroup.tank!,
      healer: partialGroup.healer!,
      damage: partialGroup.damage,
    };

    return Promise.resolve(fullGroup);
  }

  private async healerThenTank(dungeonName: DungeonName) {
    let partialGroup: PartialGroup = { damage: [] };

    let ignored: string[] = [];

    const healer = await this.getPlayer(dungeonName, 'Healer');

    if (!healer) {
      return Promise.resolve(null);
    }

    partialGroup.healer = healer.id;

    ignored.push(partialGroup.healer);

    const { resolved, group } = await this.resolvePremade(
      healer.playingWith,
      partialGroup
    );

    if (!resolved) {
      return Promise.resolve(null);
    }

    partialGroup = group;

    partialGroup = await this.resolveRole(
      dungeonName,
      ignored,
      partialGroup,
      'Tank',
      () => !partialGroup.tank
    );

    if (!partialGroup.tank) {
      return Promise.resolve(null);
    }

    partialGroup = await this.resolveRole(
      dungeonName,
      ignored,
      partialGroup,
      'Damage',
      () => partialGroup.damage.length < 3
    );

    if (partialGroup.damage.length < 3) {
      return Promise.resolve(null);
    }

    const fullGroup: DungeonGroup = {
      tank: partialGroup.tank!,
      healer: partialGroup.healer!,
      damage: partialGroup.damage,
    };

    return Promise.resolve(fullGroup);
  }

  private async damageThenTank(dungeonName: DungeonName) {
    let partialGroup: PartialGroup = { damage: [] };

    let ignored: string[] = [];

    const damage1 = await this.getPlayer(dungeonName, 'Damage');

    if (!damage1) {
      return Promise.resolve(null);
    }

    partialGroup.damage.push(damage1.id);

    ignored.push(damage1.id);

    ignored = ignored.concat(damage1.playingWith);

    const { resolved, group } = await this.resolvePremade(
      damage1.playingWith,
      partialGroup
    );

    if (!resolved) {
      return Promise.resolve(null);
    }

    partialGroup = group;

    partialGroup = await this.resolveRole(
      dungeonName,
      ignored,
      partialGroup,
      'Damage',
      () => partialGroup.damage.length < 3
    );

    if (partialGroup.damage.length < 3) {
      return Promise.resolve(null);
    }

    partialGroup = await this.resolveRole(
      dungeonName,
      ignored,
      partialGroup,
      'Tank',
      () => !partialGroup.tank
    );

    if (!partialGroup.tank) {
      return Promise.resolve(null);
    }

    partialGroup = await this.resolveRole(
      dungeonName,
      ignored,
      partialGroup,
      'Healer',
      () => !partialGroup.healer
    );

    if (!partialGroup.healer) {
      return Promise.resolve(null);
    }

    const fullGroup: DungeonGroup = {
      tank: partialGroup.tank!,
      healer: partialGroup.healer!,
      damage: partialGroup.damage,
    };

    return Promise.resolve(fullGroup);
  }

  private async resolvePremade(
    ids: string[],
    partialGroup: PartialGroup
  ): Promise<{ resolved: boolean; group: PartialGroup }> {
    const clonedGroup = {
      ...partialGroup,
      damage: [...partialGroup.damage],
    };

    const players = await this.queuePlayersRepository.get(ids);

    for (const player of players) {
      if (player.roles.includes('Tank') && !clonedGroup.tank) {
        clonedGroup.tank = player.id;
      } else if (player.roles.includes('Healer') && !clonedGroup.healer) {
        clonedGroup.healer = player.id;
      } else if (
        player.roles.includes('Damage') &&
        clonedGroup.damage.length < 3
      ) {
        clonedGroup.damage.push(player.id);
      } else {
        return Promise.resolve({ resolved: false, group: { damage: [] } });
      }
    }

    return Promise.resolve({ resolved: true, group: clonedGroup });
  }

  private async resolveRole(
    dungeonName: DungeonName,
    ignored: string[],
    partialGroup: PartialGroup,
    playerRole: PlayerRole,
    predicate: () => boolean
  ): Promise<PartialGroup> {
    while (predicate()) {
      const player = await this.getPlayer(dungeonName, playerRole, ...ignored);

      if (!player) {
        break;
      }

      ignored.push(player.id);

      ignored = ignored.concat(player.playingWith);

      const { resolved, group } = await this.resolvePremade(
        [player.id, ...player.playingWith],
        partialGroup
      );

      if (resolved) {
        partialGroup = group;
      }
    }

    return Promise.resolve(partialGroup);
  }
}
