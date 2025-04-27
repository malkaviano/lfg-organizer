import { Module } from '@nestjs/common';

import { QueuedPlayersRepositoryToken } from '@/group/interface/queued-players-repository.interface';
import { HelperModule } from '@/helper/helper.module';
import { SequelizeQueuedPlayersRepository } from '@/infra/sequelize/queued-players.repository';

@Module({
  imports: [HelperModule],
  providers: [
    {
      provide: QueuedPlayersRepositoryToken,
      useClass: SequelizeQueuedPlayersRepository,
    },
  ],
  exports: [
    {
      provide: QueuedPlayersRepositoryToken,
      useClass: SequelizeQueuedPlayersRepository,
    },
  ],
})
export class RepositoryModule {}
