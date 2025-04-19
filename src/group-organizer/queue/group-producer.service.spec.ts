import { Test, TestingModule } from '@nestjs/testing';
import { ClientProxy } from '@nestjs/microservices';

import { mock } from 'ts-jest-mocker';

import { GroupProducerService } from '@/group/queue/group-producer.service';
import {
  QueuedPlayersRepository,
  QueuedPlayersRepositoryToken,
} from '@/group/interface/queued-players-repository.interface';
import { GroupProducedToken } from '@/group/interface/group-producer.interface';

describe('GroupProducerService', () => {
  let service: GroupProducerService;

  const mockedRmqClient = mock<ClientProxy>();

  const mockedQueuedPlayersRepository = mock<QueuedPlayersRepository>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupProducerService,
        { provide: GroupProducedToken, useValue: mockedRmqClient },
        {
          provide: QueuedPlayersRepositoryToken,
          useValue: mockedQueuedPlayersRepository,
        },
      ],
    }).compile();

    service = module.get<GroupProducerService>(GroupProducerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
