import { QueuedPlayerEntity } from '@/group/entity/queued-player.entity';
import { QueuedPlayerModel } from './model/queued-player.model';

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
        status: 'QUEUED',
      });

      this.queuedPlayersStore.set(playerModel.id, playerModel);
    });

    return Promise.resolve(true);
  }

  public async get(): Promise<QueuedPlayerEntity[]> {
    return [...this.queuedPlayersStore.values()].map((model) => {
      return new QueuedPlayerEntity(
        model.id,
        model.level,
        model.roles,
        model.dungeons,
        model.queuedAt
      );
    });
  }
}
