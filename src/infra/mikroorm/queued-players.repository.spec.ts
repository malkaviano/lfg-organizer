import { Test, TestingModule } from '@nestjs/testing';

import { MikroOrmQueuedPlayersRepository } from '@/infra/mikroorm/queued-players.repository';

describe('MikroOrmQueuedPlayersRepository', () => {
  let service: MikroOrmQueuedPlayersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MikroOrmQueuedPlayersRepository],
    }).compile();

    service = module.get<MikroOrmQueuedPlayersRepository>(
      MikroOrmQueuedPlayersRepository
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
