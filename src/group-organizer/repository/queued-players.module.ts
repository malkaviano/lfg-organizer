import { Module } from '@nestjs/common';

import { MongoQueuedPlayersRepository } from '@/infra/mongodb/queued-players.repository';
import { QueuedPlayersRepositoryToken } from '@/group/interface/queued-players-repository.interface';
import { HelperModule } from '@/helper/helper.module';

@Module({
  imports: [HelperModule],
  providers: [
    MongoQueuedPlayersRepository,
    {
      provide: QueuedPlayersRepositoryToken,
      useClass: MongoQueuedPlayersRepository,
    },
  ],
  exports: [
    {
      provide: QueuedPlayersRepositoryToken,
      useClass: MongoQueuedPlayersRepository,
    },
  ],
})
export class QueuedPlayersModule {}
