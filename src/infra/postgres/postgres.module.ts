import { Module } from '@nestjs/common';

import { PostgresQueuedPlayersRepository } from '@/infra/postgres/queued-players.repository';
import { QueuedPlayersRepositoryToken } from '@/group/interface/queued-players-repository.interface';
import { HelperModule } from '@/helper/helper.module';

@Module({
  imports: [HelperModule],
  providers: [
    {
      provide: QueuedPlayersRepositoryToken,
      useClass: PostgresQueuedPlayersRepository,
    },
  ],
  exports: [
    {
      provide: QueuedPlayersRepositoryToken,
      useClass: PostgresQueuedPlayersRepository,
    },
  ],
})
export class PostgresModule {}
