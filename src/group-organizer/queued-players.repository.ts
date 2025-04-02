import { QueuedPlayerEntity } from '@/group/entity/queued-player.entity';
import { QueuedPlayerModel } from '@/group/model/queued-player.model';
import { DungeonName } from '@/dungeon/dungeon-name.literal';
import { PlayerStatus } from '@/group/player-status.literal';

export class QueuedPlayersRepository {
  private readonly queuedPlayersStore: Map<string, QueuedPlayerModel>;

  constructor() {
    this.queuedPlayersStore = new Map<string, QueuedPlayerModel>();
  }

  public async queue(playerEntities: QueuedPlayerEntity[]): Promise<boolean> {
    for (const playerEntity of playerEntities) {
      if (this.queuedPlayersStore.has(playerEntity.id)) {
        return Promise.resolve(false);
      }
    }

    playerEntities.forEach((playerEntity) => {
      const playerModel = new QueuedPlayerModel({
        ...playerEntity,
        status: 'WAITING',
      });

      this.queuedPlayersStore.set(playerModel.id, playerModel);
    });

    return Promise.resolve(true);
  }

  public async waiting(
    dungeonName: DungeonName
  ): Promise<QueuedPlayerEntity[]> {
    return Promise.resolve(
      [...this.queuedPlayersStore.values()]
        .filter(
          (model) =>
            model.dungeons.some((name) => name === dungeonName) &&
            model.status === 'WAITING'
        )
        .map((model) => {
          return new QueuedPlayerEntity(
            model.id,
            model.level,
            model.roles,
            model.dungeons,
            model.queuedAt
          );
        })
    );
  }

  public async changeStatus(
    playerIds: string[],
    newStatus: PlayerStatus
  ): Promise<string[]> {
    let changedIds: string[] = [];

    playerIds.forEach((playerId) => {
      const player = this.queuedPlayersStore.get(playerId);

      if (player) {
        player.status = newStatus;

        changedIds.push(player.id);
      }
    });

    return Promise.resolve(changedIds);
  }

  public async remove(playerIds: string[]): Promise<string[]> {
    throw 'not implemented';
  }
}
