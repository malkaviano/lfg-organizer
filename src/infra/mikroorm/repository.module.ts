import { Module } from '@nestjs/common';

import { QueuedPlayersRepositoryToken } from '@/group/interface/queued-players-repository.interface';
import { HelperModule } from '@/helper/helper.module';
import { MikroOrmQueuedPlayersRepository } from '@/infra/mikroorm/queued-players.repository';

@Module({
  imports: [HelperModule],
  providers: [
    {
      provide: QueuedPlayersRepositoryToken,
      useClass: MikroOrmQueuedPlayersRepository,
    },
  ],
  exports: [
    {
      provide: QueuedPlayersRepositoryToken,
      useClass: MikroOrmQueuedPlayersRepository,
    },
  ],
})
export class RepositoryModule {}
