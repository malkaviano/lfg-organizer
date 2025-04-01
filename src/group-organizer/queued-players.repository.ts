import { QueuedPlayerEntity } from '@/group/entity/queued-player.entity';

export class QueuedPlayersRepository {
  public async queue(playerEntities: QueuedPlayerEntity[]): Promise<void> {
    throw 'not implemented';
  }
}
