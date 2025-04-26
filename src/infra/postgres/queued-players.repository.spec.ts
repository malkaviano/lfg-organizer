import { Test, TestingModule } from '@nestjs/testing';
import { PostgresQueuedPlayersRepository } from './queued-players.repository';

describe('PostgresQueuedPlayersRepository', () => {
  let service: PostgresQueuedPlayersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostgresQueuedPlayersRepository],
    }).compile();

    service = module.get<PostgresQueuedPlayersRepository>(
      PostgresQueuedPlayersRepository
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
