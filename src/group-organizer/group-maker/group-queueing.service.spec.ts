import { Test, TestingModule } from '@nestjs/testing';

import { mock } from 'ts-jest-mocker';

import { GroupQueueingService } from '@/group/group-maker/group-queueing.service';
import { GroupQueueRequest } from '@/group/dto/group-queue.request';
import { QueuedPlayerEntity } from '@/group/entity/queued-player.entity';
import { DateTimeHelper } from '@/helper/datetime.helper';
import { PlayerLevel } from '@/dungeon/player-level.literal';
import { PlayerRole } from '@/dungeon/player-role.literal';
import { DungeonName } from '@/dungeon/dungeon-name.literal';
import { GroupDequeueRequest } from '@/group/dto/group-dequeue.request';
import {
  QueuedPlayersRepository,
  QueuedPlayersRepositoryToken,
} from '@/group/interface/queued-players-repository.interface';

describe('GroupQueueingService', () => {
  let service: GroupQueueingService;

  const mockedQueuedPlayersRepository = mock<QueuedPlayersRepository>();

  const mockedDateTimeHelper = mock(DateTimeHelper);

  const timestamp = '2025-04-01T11:42:19.088Z';

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupQueueingService,
        {
          provide: QueuedPlayersRepositoryToken,
          useValue: mockedQueuedPlayersRepository,
        },
        {
          provide: DateTimeHelper,
          useValue: mockedDateTimeHelper,
        },
      ],
    }).compile();

    service = module.get<GroupQueueingService>(GroupQueueingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('queueParty', () => {
    it('sanitize values and queue', async () => {
      const body: GroupQueueRequest = {
        players: [
          {
            id: 'id1',
            level: 20,
            roles: ['Tank', 'Damage', 'Damage'],
          },
          {
            id: 'id2',
            level: 21,
            roles: ['Healer', 'Healer'],
          },
        ],
        dungeons: ['RagefireChasm', 'Deadmines', 'RagefireChasm', 'Deadmines'],
      };

      const expected: QueuedPlayerEntity[] = [
        new QueuedPlayerEntity(
          'id1',
          20,
          ['Tank', 'Damage'],
          ['RagefireChasm', 'Deadmines'],
          timestamp,
          ['id2']
        ),
        new QueuedPlayerEntity(
          'id2',
          21,
          ['Healer'],
          ['RagefireChasm', 'Deadmines'],
          timestamp,
          ['id1']
        ),
      ];

      mockedDateTimeHelper.timestamp.mockReturnValueOnce(timestamp);

      mockedQueuedPlayersRepository.queue.mockResolvedValueOnce(2);

      const result = await service.queueParty(body);

      expect(result).toEqual({ result: true });

      expect(mockedQueuedPlayersRepository.queue).toHaveBeenCalledWith(
        expected
      );
    });

    it('validate player level', async () => {
      const body: GroupQueueRequest = {
        players: [
          {
            id: 'id1',
            level: 15,
            roles: ['Tank', 'Damage'],
          },
          {
            id: 'id2',
            level: 21,
            roles: ['Healer'],
          },
        ],
        dungeons: ['RagefireChasm', 'Deadmines'],
      };

      mockedDateTimeHelper.timestamp.mockReturnValueOnce(timestamp);

      const result = await service.queueParty(body);

      expect(result).toEqual({
        result: false,
        errorMsg:
          'one or more players have incorrect level for selected dungeons',
      });
    });

    [
      {
        players: [
          {
            id: 'id1',
            level: 20 as PlayerLevel,
            roles: ['Tank', 'Damage'] as PlayerRole[],
          },
          {
            id: 'id2',
            level: 20 as PlayerLevel,
            roles: ['Tank', 'Healer', 'Damage'] as PlayerRole[],
          },
        ],
        dungeons: ['Deadmines'] as DungeonName[],
        expected: {
          result: false,
          errorMsg: 'a group cannot have more than one tank',
        },
      },
      {
        players: [
          {
            id: 'id1',
            level: 20 as PlayerLevel,
            roles: ['Healer'] as PlayerRole[],
          },
          {
            id: 'id2',
            level: 20 as PlayerLevel,
            roles: ['Tank', 'Healer', 'Damage'] as PlayerRole[],
          },
        ],
        dungeons: ['Deadmines'] as DungeonName[],
        expected: {
          result: false,
          errorMsg: 'a group cannot have more than one healer',
        },
      },
      {
        players: [
          {
            id: 'id1',
            level: 20 as PlayerLevel,
            roles: ['Damage'] as PlayerRole[],
          },
          {
            id: 'id2',
            level: 20 as PlayerLevel,
            roles: ['Tank', 'Healer', 'Damage'] as PlayerRole[],
          },
          {
            id: 'id3',
            level: 20 as PlayerLevel,
            roles: ['Damage'] as PlayerRole[],
          },
          {
            id: 'id4',
            level: 20 as PlayerLevel,
            roles: ['Damage'] as PlayerRole[],
          },
        ],
        dungeons: ['Deadmines'] as DungeonName[],
        expected: {
          result: false,
          errorMsg: 'a group cannot have more than three damage dealers',
        },
      },
    ].forEach(({ players, dungeons, expected }) => {
      it('validate roles', async () => {
        mockedDateTimeHelper.timestamp.mockReturnValueOnce(timestamp);

        const result = await service.queueParty({ players, dungeons });

        expect(result).toEqual(expected);
      });
    });
  });

  describe('dequeueParty', () => {
    it('remove waiting players', async () => {
      const body: GroupDequeueRequest = {
        playerIds: ['id1', 'id2'],
      };

      mockedQueuedPlayersRepository.get.mockResolvedValueOnce([
        new QueuedPlayerEntity(
          'id1',
          20,
          ['Tank', 'Damage'],
          ['RagefireChasm', 'Deadmines'],
          timestamp
        ),
        new QueuedPlayerEntity(
          'id2',
          21,
          ['Healer'],
          ['RagefireChasm', 'Deadmines'],
          timestamp
        ),
      ]);

      mockedQueuedPlayersRepository.remove.mockResolvedValueOnce(2);

      const result = await service.dequeueParty(body);

      expect(result).toEqual({ result: true });
    });
  });
});
