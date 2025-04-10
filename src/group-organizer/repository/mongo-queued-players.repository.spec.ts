import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';

import { mock } from 'ts-jest-mocker';

import { MongoQueuedPlayersRepository } from '@/group/repository/mongo-queued-players.repository';

describe('MongoQueuedPlayersRepository', () => {
  let service: MongoQueuedPlayersRepository;

  const mockedConfigService = mock(ConfigService);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MongoQueuedPlayersRepository,
        { provide: ConfigService, useValue: mockedConfigService },
      ],
    }).compile();

    service = module.get<MongoQueuedPlayersRepository>(
      MongoQueuedPlayersRepository
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
