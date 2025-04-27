import { Test, TestingModule } from '@nestjs/testing';

import { mock } from 'ts-jest-mocker';

import { SQLQueuedPlayersRepository } from '@/infra/store/queued-players.repository';
import { PrismaService } from '@/infra/store/prisma.service';

describe('SQLQueuedPlayersRepository', () => {
  let service: SQLQueuedPlayersRepository;

  const mockPrismaService = mock(PrismaService);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SQLQueuedPlayersRepository,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<SQLQueuedPlayersRepository>(
      SQLQueuedPlayersRepository
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
