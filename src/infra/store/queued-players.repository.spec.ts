import { Test, TestingModule } from '@nestjs/testing';

import { SQLQueuedPlayersRepository } from '@/infra/store/queued-players.repository';

describe('SQLQueuedPlayersRepository', () => {
  let service: SQLQueuedPlayersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SQLQueuedPlayersRepository],
    }).compile();

    service = module.get<SQLQueuedPlayersRepository>(
      SQLQueuedPlayersRepository
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
