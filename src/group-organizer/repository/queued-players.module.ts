import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  QueuedPlayerModel,
  QueuedPlayerSchema,
} from '@/group/model/queued-player.model';
import { MongoQueuedPlayersRepository } from '@/group/repository/mongo-queued-players.repository';
import { QueuedPlayersRepositoryToken } from '@/group/interface/queued-players-repository.interface';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: QueuedPlayerModel.name, schema: QueuedPlayerSchema },
    ]),
  ],
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
