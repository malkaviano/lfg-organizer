import { QueuedPlayerEntity } from '@/group/entity/queued-player.entity';
import { QueuedPlayerModel } from '@/group/model/queued-player.model';
import { DungeonName } from '@/dungeon/dungeon-name.literal';
import { PlayerStatus } from '@/group/player-status.literal';

export class QueuedPlayersRepository {
  private readonly queuedPlayersStore: Map<string, QueuedPlayerModel>;

  constructor() {
    this.queuedPlayersStore = new Map<string, QueuedPlayerModel>();
  }

  public async queue(party: QueuedPlayerEntity[]): Promise<void> {
    for (const playerEntity of party) {
      if (this.queuedPlayersStore.has(playerEntity.id)) {
        throw new Error('DB duplicated id');
      }
    }

    party.forEach((playerEntity) => {
      const playerModel = new QueuedPlayerModel({
        ...playerEntity,
        status: 'WAITING',
      });

      this.queuedPlayersStore.set(playerModel.id, playerModel);
    });
  }

  public async changeStatus(
    playerIds: string[],
    newStatus: PlayerStatus
  ): Promise<number> {
    let total = 0;

    playerIds.forEach((playerId) => {
      const player = this.queuedPlayersStore.get(playerId);

      if (player) {
        player.status = newStatus;

        total++;
      }
    });

    return Promise.resolve(total);
  }

  public async remove(
    playerIds: string[],
    playerStatus: PlayerStatus
  ): Promise<number> {
    let total = 0;

    playerIds.forEach((playerId) => {
      const player = this.queuedPlayersStore.get(playerId);

      if (player && player.status === playerStatus) {
        if (this.queuedPlayersStore.delete(playerId)) {
          total++;
        }
      }
    });

    return Promise.resolve(total);
  }

  public async getByDungeon(
    dungeonName: DungeonName,
    playerStatus: PlayerStatus
  ): Promise<QueuedPlayerEntity[]> {
    return Promise.resolve(
      [...this.queuedPlayersStore.values()]
        .filter(
          (model) =>
            model.dungeons.some((name) => name === dungeonName) &&
            model.status === playerStatus
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

  public async getById(
    playerIds: string[],
    playerStatus: PlayerStatus
  ): Promise<QueuedPlayerEntity[]> {
    return Promise.resolve(
      [...this.queuedPlayersStore.values()]
        .filter(
          (model) =>
            playerIds.some((id) => id === model.id) &&
            model.status === playerStatus
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
}
