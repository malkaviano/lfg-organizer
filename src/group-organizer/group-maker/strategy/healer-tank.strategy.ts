import { Inject, Injectable } from '@nestjs/common';

import {
  GroupFormationStrategy,
  PartialGroup,
} from '@/group/group-maker/strategy/group-formation.strategy';
import { DungeonGroup } from '@/dungeon/dungeon-group.type';
import { DungeonName } from '@/dungeon/dungeon-name.literal';
import {
  QueuedPlayersRepository,
  QueuedPlayersRepositoryToken,
} from '@/group/interface/queued-players-repository.interface';

@Injectable()
export class HealerTankStrategy extends GroupFormationStrategy {
  constructor(
    @Inject(QueuedPlayersRepositoryToken)
    queuePlayersRepository: QueuedPlayersRepository
  ) {
    super(queuePlayersRepository);
  }

  public async run(dungeonName: DungeonName): Promise<DungeonGroup | null> {
    let partialGroup: PartialGroup = { damage: [] };

    let ignored: string[] = [];

    const healer = await this.getPlayer(dungeonName, 'Healer');

    if (!healer) {
      return Promise.resolve(null);
    }

    partialGroup.healer = healer.id;

    ignored.push(partialGroup.healer, ...healer.playingWith);

    if (healer.playingWith.length > 0) {
      const { resolved, group } = await this.resolvePremade(
        healer.playingWith,
        partialGroup
      );

      if (!resolved) {
        return Promise.resolve(null);
      }

      partialGroup = group;
    }

    partialGroup = await this.resolveRole(
      dungeonName,
      ignored,
      partialGroup,
      'Tank',
      (group: PartialGroup) => !group.tank
    );

    if (!partialGroup.tank) {
      return Promise.resolve(null);
    }

    partialGroup = await this.resolveRole(
      dungeonName,
      ignored,
      partialGroup,
      'Damage',
      (group: PartialGroup) => group.damage.length < 3
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
}
