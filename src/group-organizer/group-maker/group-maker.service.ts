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
import { PlayerGroupMessage } from '@/group/dto/player-group.message';

@Injectable()
export class GroupMakerService {
  constructor(
    @Inject(QueuedPlayersRepositoryToken)
    private readonly queuePlayersRepository: QueuedPlayersRepository,
    private readonly tankThenHealerStrategy: TankHealerStrategy,
    private readonly healerThenTankStrategy: HealerTankStrategy,
    private readonly damageThenTankStrategy: DamageTankStrategy
  ) {}

  async createGroup(
    group: DungeonGroup,
    dungeonName: DungeonName
  ): Promise<boolean> {
    return this.queuePlayersRepository.createGroup(group, dungeonName);
  }

  async groupFor(dungeonName: DungeonName): Promise<DungeonGroup | null> {
    let result: DungeonGroup | null;

    result = await this.tankThenHealerStrategy.run(dungeonName);

    if (result) {
      return result;
    }

    result = await this.healerThenTankStrategy.run(dungeonName);

    if (result) {
      return result;
    }

    return this.damageThenTankStrategy.run(dungeonName);
  }

  async groupsToSend(): Promise<PlayerGroupMessage[]> {
    return this.queuePlayersRepository.groupsToSend();
  }

  async groupsSent(groupIds: string[]): Promise<void> {
    await this.queuePlayersRepository.groupsSent(groupIds);
  }
}
