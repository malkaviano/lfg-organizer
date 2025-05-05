import { Test, TestingModule } from '@nestjs/testing';

import { mock } from 'ts-jest-mocker';

import { GroupQueueingService } from '@/group/group-maker/group-queueing.service';
import { QueuedPlayerEntity } from '@/group/entity/queued-player.entity';
import { PlayerLevel } from '@/dungeon/player-level.literal';
import { PlayerRole } from '@/dungeon/player-role.literal';
import { DungeonName } from '@/dungeon/dungeon-name.literal';
import { PlayersDequeueMessage } from '@/group/dto/players-dequeue.message';
import {
  QueuedPlayersRepository,
  QueuedPlayersRepositoryToken,
} from '@/group/interface/queued-players-repository.interface';
import { PlayersUnGroupMessage } from '@/group/dto/players-ungroup.message';
import { PlayersQueueMessage } from '@/group/dto/players-queue.message';

describe('GroupQueueingService', () => {
  let service: GroupQueueingService;

  const mockedQueuedPlayersRepository = mock<QueuedPlayersRepository>();

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
      ],
    }).compile();

    service = module.get<GroupQueueingService>(GroupQueueingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('queue', () => {
    it('sanitize values and queue', async () => {
      const message: PlayersQueueMessage = {
        queuedAt: timestamp,
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

      mockedQueuedPlayersRepository.queue.mockResolvedValueOnce(2);

      const result = await service.queue(message);

      expect(result).toEqual({ result: true });

      expect(mockedQueuedPlayersRepository.queue).toHaveBeenCalledWith(
        expected
      );
    });

    it('validate player level', async () => {
      const body: PlayersQueueMessage = {
        queuedAt: timestamp,
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

      const result = await service.queue(body);

      expect(result).toEqual({
        result: false,
        errorMsg:
          'one or more players have incorrect level for selected dungeons',
      });
    });

    [
      {
        queuedAt: timestamp,
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
        queuedAt: timestamp,
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
        queuedAt: timestamp,
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
    ].forEach(({ queuedAt, players, dungeons, expected }) => {
      it('validate roles', async () => {
        const result = await service.queue({ queuedAt, players, dungeons });

        expect(result).toEqual(expected);
      });
    });
  });

  describe('dequeue', () => {
    it('remove waiting players', async () => {
      const body: PlayersDequeueMessage = {
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

      const result = await service.dequeue(body);

      expect(result).toEqual(2);
    });
  });

  describe('return', () => {
    it('change players back to waiting', async () => {
      const message: PlayersUnGroupMessage = {
        playerIds: ['id1', 'id2'],
      };

      mockedQueuedPlayersRepository.return.mockResolvedValueOnce(2);

      const result = await service.unGroup(message);

      expect(result).toEqual(2);
    });
  });
});
