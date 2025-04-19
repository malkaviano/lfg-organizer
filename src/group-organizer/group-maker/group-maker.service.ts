import { Inject, Injectable } from '@nestjs/common';

import { DungeonName } from '@/dungeon/dungeon-name.literal';
import { DungeonGroup } from '@/dungeon/dungeon-group.type';
import {
  QueuedPlayersRepository,
  QueuedPlayersRepositoryToken,
} from '@/group/interface/queued-players-repository.interface';
import { TankHealerStrategy } from '@/group/group-maker/strategy/tank-healer.strategy';
import { HealerTankStrategy } from '@/group/group-maker/strategy/healer-tank.strategy';
import { DamageTankStrategy } from '@/group/group-maker/strategy/damage-tank.strategy';

@Injectable()
export class GroupMakerService {
  constructor(
    @Inject(QueuedPlayersRepositoryToken)
    private readonly queuePlayersRepository: QueuedPlayersRepository,
    private readonly tankThenHealerStrategy: TankHealerStrategy,
    private readonly healerThenTankStrategy: HealerTankStrategy,
    private readonly damageThenTankStrategy: DamageTankStrategy
  ) {}

  async createGroup(group: DungeonGroup): Promise<boolean> {
    return this.queuePlayersRepository.createGroup(group);
  }

  async groupFor(dungeonName: DungeonName): Promise<DungeonGroup | null> {
    let result: DungeonGroup | null;

    result = await this.tankThenHealerStrategy.run(dungeonName);

    if (result) {
      return Promise.resolve(result);
    }

    result = await this.healerThenTankStrategy.run(dungeonName);

    if (result) {
      return Promise.resolve(result);
    }

    return this.damageThenTankStrategy.run(dungeonName);
  }
}
