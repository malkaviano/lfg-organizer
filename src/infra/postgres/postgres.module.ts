import { Module } from '@nestjs/common';
import { PostgresQueuedPlayersRepository } from './queued-players.repository';

@Module({
  providers: [PostgresQueuedPlayersRepository],
})
export class PostgresModule {}
