import { DungeonGroup } from '@/dungeon/dungeon-group.type';
import { DungeonName } from '@/dungeon/dungeon-name.literal';
import { PlayerRole } from '@/dungeon/player-role.literal';
import { QueuedPlayersRepository } from '@/group/interface/queued-players-repository.interface';
import { IdHelper } from '@/helper/id.helper';

export type PartialGroup = {
  tank?: string;
  healer?: string;
  damage: string[];
};

export abstract class GroupFormationStrategy {
  constructor(
    protected readonly queuePlayersRepository: QueuedPlayersRepository
  ) {}

  public abstract run(dungeonName: DungeonName): Promise<DungeonGroup | null>;

  protected getPlayer(
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

  protected async resolvePremade(
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
        return { resolved: false, group: { damage: [] } };
      }
    }

    return { resolved: true, group: clonedGroup };
  }

  protected async resolveRole(
    dungeonName: DungeonName,
    ignored: string[],
    partialGroup: PartialGroup,
    playerRole: PlayerRole,
    predicate: (group: PartialGroup) => boolean
  ): Promise<PartialGroup> {
    while (predicate(partialGroup)) {
      const player = await this.getPlayer(dungeonName, playerRole, ...ignored);

      if (!player) {
        break;
      }

      ignored.push(player.id, ...player.playingWith);

      const { resolved, group } = await this.resolvePremade(
        [player.id, ...player.playingWith],
        partialGroup
      );

      if (resolved) {
        partialGroup = group;
      }
    }

    return partialGroup;
  }
}
