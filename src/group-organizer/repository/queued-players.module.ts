import { Module } from '@nestjs/common';

import { MongoQueuedPlayersRepository } from '@/group/repository/mongo-queued-players.repository';
import { QueuedPlayersRepositoryToken } from '@/group/interface/queued-players-repository.interface';

@Module({
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
