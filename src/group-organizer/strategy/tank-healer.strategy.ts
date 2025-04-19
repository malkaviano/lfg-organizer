import {
  GroupFormationStrategy,
  PartialGroup,
} from '@/group/strategy/group-formation.strategy';
import { DungeonGroup } from '@/dungeon/dungeon-group.type';
import { DungeonName } from '@/dungeon/dungeon-name.literal';
import { QueuedPlayersRepository } from '@/group/interface/queued-players-repository.interface';
import { IdHelper } from '@/helper/id.helper';

export class TankHealerStrategy extends GroupFormationStrategy {
  constructor(
    protected readonly queuePlayersRepository: QueuedPlayersRepository,
    protected readonly idHelper: IdHelper
  ) {
    super(queuePlayersRepository, idHelper);
  }

  public async run(dungeonName: DungeonName): Promise<DungeonGroup | null> {
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
      id: this.idHelper.newId(),
      tank: partialGroup.tank!,
      healer: partialGroup.healer!,
      damage: partialGroup.damage,
    };

    return Promise.resolve(fullGroup);
  }
}
