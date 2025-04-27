import { Module } from '@nestjs/common';

import { QueuedPlayersRepositoryToken } from '@/group/interface/queued-players-repository.interface';
import { HelperModule } from '@/helper/helper.module';
import { SQLQueuedPlayersRepository } from '@/infra/store/queued-players.repository';

@Module({
  imports: [HelperModule],
  providers: [
    {
      provide: QueuedPlayersRepositoryToken,
      useClass: SQLQueuedPlayersRepository,
    },
  ],
  exports: [
    {
      provide: QueuedPlayersRepositoryToken,
      useClass: SQLQueuedPlayersRepository,
    },
  ],
})
export class RepositoryModule {}
