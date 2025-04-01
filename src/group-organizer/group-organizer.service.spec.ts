import { Test, TestingModule } from '@nestjs/testing';

import { mock } from 'ts-jest-mocker';

import { GroupOrganizerService } from '@/group/group-organizer.service';
import { AddPlayersQueueRequest } from '@/group/dto/add-players.request';
import { QueuedPlayersRepository } from '@/group/queued-players.repository';
import { QueuedPlayerEntity } from '@/group/entity/queued-player.entity';
import { DateTimeHelper } from '@/helper/datetime.helper';
import { PlayerLevel } from '@/dungeon/player-level.literal';
import { PlayerRole } from '@/dungeon/dungeon-role.literal';
import { DungeonName } from '@/dungeon/dungeon-name.literal';

describe('GroupOrganizerService', () => {
  let service: GroupOrganizerService;

  const mockedQueuedPlayersRepository = mock(QueuedPlayersRepository);

  const mockedDateTimeHelper = mock(DateTimeHelper);

  const timestamp = '2025-04-01T11:42:19.088Z';

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupOrganizerService,
        {
          provide: QueuedPlayersRepository,
          useValue: mockedQueuedPlayersRepository,
        },
        {
          provide: DateTimeHelper,
          useValue: mockedDateTimeHelper,
        },
      ],
    }).compile();

    service = module.get<GroupOrganizerService>(GroupOrganizerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('queue', () => {
    it('sanitize values and queue', async () => {
      const body: AddPlayersQueueRequest = {
        players: [
          {
            id: 'id1',
            level: 20,
            roles: ['Tank', 'Damage', 'Damage'],
            dungeons: ['Deadmines', 'Deadmines'],
          },
          {
            id: 'id2',
            level: 21,
            roles: ['Healer', 'Healer'],
            dungeons: ['RagefireChasm', 'Deadmines'],
          },
        ],
      };

      const expected: QueuedPlayerEntity[] = [
        new QueuedPlayerEntity(
          'id1',
          20,
          ['Tank', 'Damage'],
          ['Deadmines'],
          timestamp
        ),
        new QueuedPlayerEntity(
          'id2',
          21,
          ['Healer'],
          ['RagefireChasm', 'Deadmines'],
          timestamp
        ),
      ];

      mockedDateTimeHelper.timestamp.mockReturnValueOnce(timestamp);

      mockedQueuedPlayersRepository.queue.mockResolvedValueOnce(true);

      await service.queuePlayers(body);

      expect(mockedQueuedPlayersRepository.queue).toHaveBeenCalledWith(
        expected
      );
    });

    it('validate player level', async () => {
      const body: AddPlayersQueueRequest = {
        players: [
          {
            id: 'id1',
            level: 15,
            roles: ['Tank', 'Damage'],
            dungeons: ['Deadmines'],
          },
          {
            id: 'id2',
            level: 21,
            roles: ['Healer'],
            dungeons: ['RagefireChasm', 'Deadmines'],
          },
        ],
      };

      mockedDateTimeHelper.timestamp.mockReturnValueOnce(timestamp);

      await expect(service.queuePlayers(body)).rejects.toThrow(
        'one or more players have incorrect level for selected dungeons'
      );
    });

    [
      {
        players: [
          {
            id: 'id1',
            level: 20 as PlayerLevel,
            roles: ['Tank', 'Damage'] as PlayerRole[],
            dungeons: ['Deadmines'] as DungeonName[],
          },
          {
            id: 'id2',
            level: 20 as PlayerLevel,
            roles: ['Tank', 'Healer', 'Damage'] as PlayerRole[],
            dungeons: ['Deadmines'] as DungeonName[],
          },
        ],
        error: 'a group cannot have more than one tank',
      },
      {
        players: [
          {
            id: 'id1',
            level: 20 as PlayerLevel,
            roles: ['Healer'] as PlayerRole[],
            dungeons: ['Deadmines'] as DungeonName[],
          },
          {
            id: 'id2',
            level: 20 as PlayerLevel,
            roles: ['Tank', 'Healer', 'Damage'] as PlayerRole[],
            dungeons: ['Deadmines'] as DungeonName[],
          },
        ],
        error: 'a group cannot have more than one healer',
      },
      {
        players: [
          {
            id: 'id1',
            level: 20 as PlayerLevel,
            roles: ['Damage'] as PlayerRole[],
            dungeons: ['Deadmines'] as DungeonName[],
          },
          {
            id: 'id2',
            level: 20 as PlayerLevel,
            roles: ['Tank', 'Healer', 'Damage'] as PlayerRole[],
            dungeons: ['Deadmines'] as DungeonName[],
          },
          {
            id: 'id3',
            level: 20 as PlayerLevel,
            roles: ['Damage'] as PlayerRole[],
            dungeons: ['Deadmines'] as DungeonName[],
          },
          {
            id: 'id4',
            level: 20 as PlayerLevel,
            roles: ['Damage'] as PlayerRole[],
            dungeons: ['Deadmines'] as DungeonName[],
          },
        ],
        error: 'a group cannot have more than three damage dealers',
      },
    ].forEach(({ players, error }) => {
      it('validate roles', async () => {
        mockedDateTimeHelper.timestamp.mockReturnValueOnce(timestamp);

        await expect(service.queuePlayers({ players })).rejects.toThrow(error);
      });
    });
  });
});
