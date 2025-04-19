import { Test, TestingModule } from '@nestjs/testing';
import { ClientProxy } from '@nestjs/microservices';

import { mock } from 'ts-jest-mocker';

import { GroupProducerService } from '@/group/queue/group-producer.service';
import {
  QueuedPlayersRepository,
  QueuedPlayersRepositoryToken,
} from '@/group/interface/queued-players-repository.interface';
import { QueueClientToken } from '@/group/interface/group-producer.interface';

describe('GroupProducerService', () => {
  let service: GroupProducerService;

  const mockedRmqClient = mock<ClientProxy>();

  const mockedQueuedPlayersRepository = mock<QueuedPlayersRepository>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupProducerService,
        { provide: QueueClientToken, useValue: mockedRmqClient },
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

  describe('publish', () => {
    it('should call the client emit method with the correct parameters', async () => {
      const groups = [
        {
          groupId: 'group1',
          dungeon: 'dungeon1',
          tank: 'tank1',
          healer: 'healer1',
          damage: ['damage1', 'damage2', 'damage3'],
        },
      ];

      mockedQueuedPlayersRepository.unSentGroups.mockResolvedValueOnce(groups);

      mockedQueuedPlayersRepository.confirmGroupsSent.mockResolvedValueOnce();

      mockedRmqClient.emit.mockReturnValueOnce({} as any);

      await service.publish();

      expect(mockedRmqClient.emit).toHaveBeenCalledWith(
        'player-groups',
        groups
      );

      expect(
        mockedQueuedPlayersRepository.confirmGroupsSent
      ).toHaveBeenCalledWith(['group1']);
    });
  });
});
