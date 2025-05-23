import { Test, TestingModule } from '@nestjs/testing';

import { mock } from 'ts-jest-mocker';

import { PlayersQueueingService } from '@/group/group-maker/players-queueing.service';
import { QueuedPlayerEntity } from '@/group/entity/queued-player.entity';
import { PlayerLevel } from '@/dungeon/player-level.literal';
import { PlayerRole } from '@/dungeon/player-role.literal';
import { DungeonName } from '@/dungeon/dungeon-name.literal';
import { PlayersDequeuedMessage } from '@/group/dto/players-dequeued.message';
import {
  QueuedPlayersRepository,
  QueuedPlayersRepositoryToken,
} from '@/group/interface/queued-players-repository.interface';
import { PlayersReturnedMessage } from '@/group/dto/players-returned.message';
import { PlayersQueuedMessage } from '@/group/dto/players-queued.message';

describe('PlayersQueueingService', () => {
  let service: PlayersQueueingService;

  const mockedQueuedPlayersRepository = mock<QueuedPlayersRepository>();

  const timestamp = '2025-04-01T11:42:19.088Z';

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlayersQueueingService,
        {
          provide: QueuedPlayersRepositoryToken,
          useValue: mockedQueuedPlayersRepository,
        },
      ],
    }).compile();

    service = module.get<PlayersQueueingService>(PlayersQueueingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('queue', () => {
    it('sanitize values and queue', async () => {
      const message: PlayersQueuedMessage = {
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

      mockedQueuedPlayersRepository.add.mockResolvedValueOnce(2);

      const result = await service.queue(message);

      expect(result).toEqual({ result: true });

      expect(mockedQueuedPlayersRepository.add).toHaveBeenCalledWith(expected);
    });

    it('validate player level', async () => {
      const body: PlayersQueuedMessage = {
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
      const message: PlayersDequeuedMessage = {
        playerIds: ['id1', 'id2'],
        processedAt: timestamp,
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

      const result = await service.dequeue(message);

      expect(result).toEqual({ result: true });
    });
  });

  describe('return', () => {
    it('change players back to waiting', async () => {
      const message: PlayersReturnedMessage = {
        playerIds: ['id1', 'id2'],
        processedAt: timestamp,
      };

      mockedQueuedPlayersRepository.return.mockResolvedValueOnce(2);

      const result = await service.return(message);

      expect(result).toEqual({ result: true });
    });
  });
});
