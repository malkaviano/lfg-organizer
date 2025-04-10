import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  QueuedPlayerModel,
  QueuedPlayerSchema,
} from '@/group/model/queued-player.model';
import { MongoQueuedPlayersRepository } from '@/group/repository/mongo-queued-players.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: QueuedPlayerModel.name, schema: QueuedPlayerSchema },
    ]),
  ],
  providers: [MongoQueuedPlayersRepository],
  exports: [MongoQueuedPlayersRepository],
})
export class QueuedPlayersModule {}
