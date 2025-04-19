import {
  GroupFormationStrategy,
  PartialGroup,
} from '@/group/strategy/group-formation.strategy';
import { DungeonGroup } from '@/dungeon/dungeon-group.type';
import { DungeonName } from '@/dungeon/dungeon-name.literal';
import { QueuedPlayersRepository } from '@/group/interface/queued-players-repository.interface';
import { IdHelper } from '@/helper/id.helper';

export class HealerTankStrategy extends GroupFormationStrategy {
  constructor(
    protected readonly queuePlayersRepository: QueuedPlayersRepository,
    protected readonly idHelper: IdHelper
  ) {
    super(queuePlayersRepository, idHelper);
  }

  public async run(dungeonName: DungeonName): Promise<DungeonGroup | null> {
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
      id: this.idHelper.newId(),
      tank: partialGroup.tank!,
      healer: partialGroup.healer!,
      damage: partialGroup.damage,
    };

    return Promise.resolve(fullGroup);
  }
}
