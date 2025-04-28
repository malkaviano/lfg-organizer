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
export class TankHealerStrategy extends GroupFormationStrategy {
  constructor(
    @Inject(QueuedPlayersRepositoryToken)
    queuePlayersRepository: QueuedPlayersRepository
  ) {
    super(queuePlayersRepository);
  }

  public async run(dungeonName: DungeonName): Promise<DungeonGroup | null> {
    let partialGroup: PartialGroup = { damage: [] };

    let ignored: string[] = [];

    const tank = await this.getPlayer(dungeonName, 'Tank');

    if (!tank) {
      return null;
    }

    partialGroup.tank = tank.id;

    ignored.push(tank.id, ...tank.playingWith);

    if (tank.playingWith.length > 0) {
      const { resolved, group } = await this.resolvePremade(
        tank.playingWith,
        partialGroup
      );

      if (!resolved) {
        return null;
      }

      partialGroup = group;
    }

    partialGroup = await this.resolveRole(
      dungeonName,
      ignored,
      partialGroup,
      'Healer',
      (group: PartialGroup) => !group.healer
    );

    if (!partialGroup.healer) {
      return null;
    }

    partialGroup = await this.resolveRole(
      dungeonName,
      ignored,
      partialGroup,
      'Damage',
      (group: PartialGroup) => group.damage.length < 3
    );

    if (partialGroup.damage.length < 3) {
      return null;
    }

    const fullGroup: DungeonGroup = {
      tank: partialGroup.tank!,
      healer: partialGroup.healer!,
      damage: partialGroup.damage,
    };

    return fullGroup;
  }
}
