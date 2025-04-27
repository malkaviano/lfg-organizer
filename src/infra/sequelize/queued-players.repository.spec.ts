import { Test, TestingModule } from '@nestjs/testing';

import { SequelizeQueuedPlayersRepository } from '@/infra/sequelize/queued-players.repository';

describe('SequelizeQueuedPlayersRepository', () => {
  let service: SequelizeQueuedPlayersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SequelizeQueuedPlayersRepository],
    }).compile();

    service = module.get<SequelizeQueuedPlayersRepository>(
      SequelizeQueuedPlayersRepository
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
