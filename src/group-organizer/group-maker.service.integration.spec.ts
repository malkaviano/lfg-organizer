import { Test, TestingModule } from '@nestjs/testing';

import { mock } from 'ts-jest-mocker';

import { GroupMakerService } from '@/group/group-maker.service';
import { QueuedPlayersRepository } from '@/group/queued-players.repository';
import { DateTimeHelper } from '@/helper/datetime.helper';
import { DungeonName } from '@/dungeon/dungeon-name.literal';
import { QueuedPlayerEntity } from '@/group/entity/queued-player.entity';
import { DungeonGroup } from '@/dungeon/dungeon-group.type';

describe('GroupMakerService', () => {
  let service: GroupMakerService;

  const mockedDateTimeHelper = mock(DateTimeHelper);

  let queuedPlayersRepository;

  beforeEach(async () => {
    jest.resetAllMocks();

    queuedPlayersRepository = new QueuedPlayersRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupMakerService,
        {
          provide: QueuedPlayersRepository,
          useValue: queuedPlayersRepository,
        },
        {
          provide: DateTimeHelper,
          useValue: mockedDateTimeHelper,
        },
      ],
    }).compile();

    service = module.get<GroupMakerService>(GroupMakerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('groupFor', () => {
    describe('when enough players', () => {
      groupFixtures().forEach(({ players, expected }) => {
        it('return group', async () => {
          await queuedPlayersRepository.queue(players);

          const dungeonName: DungeonName = 'WailingCaverns';

          const result = await service.groupFor(dungeonName);

          expect(result).toEqual(expected);
        });
      });
    });
  });
});

function groupFixtures(): {
  players: QueuedPlayerEntity[];
  expected: DungeonGroup | null;
}[] {
  return [
    {
      players: [
        new QueuedPlayerEntity(
          'player1_',
          20,
          ['Tank', 'Damage'],
          ['WailingCaverns'],
          new Date().toISOString()
        ),
        new QueuedPlayerEntity(
          'player2_',
          19,
          ['Healer'],
          ['WailingCaverns'],
          new Date().toISOString()
        ),
        new QueuedPlayerEntity(
          'player3_',
          21,
          ['Damage'],
          ['WailingCaverns'],
          new Date().toISOString()
        ),
        new QueuedPlayerEntity(
          'player4_',
          21,
          ['Damage'],
          ['WailingCaverns'],
          new Date().toISOString()
        ),
      ],
      expected: null,
    },
    {
      players: [
        new QueuedPlayerEntity(
          'player1a',
          20,
          ['Tank'],
          ['WailingCaverns'],
          new Date().toISOString()
        ),
        new QueuedPlayerEntity(
          'player2a',
          19,
          ['Healer'],
          ['WailingCaverns'],
          new Date().toISOString()
        ),
        new QueuedPlayerEntity(
          'player3a',
          21,
          ['Damage'],
          ['WailingCaverns'],
          new Date().toISOString()
        ),
        new QueuedPlayerEntity(
          'player4a',
          21,
          ['Damage'],
          ['WailingCaverns'],
          new Date().toISOString()
        ),
        new QueuedPlayerEntity(
          'player5a',
          21,
          ['Damage'],
          ['WailingCaverns'],
          new Date().toISOString()
        ),
      ],
      expected: {
        tank: 'player1a',
        healer: 'player2a',
        damage: ['player3a', 'player4a', 'player5a'],
      },
    },
    {
      players: [
        new QueuedPlayerEntity(
          'player1b',
          20,
          ['Tank', 'Healer'],
          ['WailingCaverns'],
          new Date().toISOString()
        ),
        new QueuedPlayerEntity(
          'player2b',
          19,
          ['Tank'],
          ['WailingCaverns'],
          new Date().toISOString()
        ),
        new QueuedPlayerEntity(
          'player3b',
          21,
          ['Damage'],
          ['WailingCaverns'],
          new Date().toISOString()
        ),
        new QueuedPlayerEntity(
          'player4b',
          21,
          ['Damage'],
          ['WailingCaverns'],
          new Date().toISOString()
        ),
        new QueuedPlayerEntity(
          'player5b',
          21,
          ['Damage'],
          ['WailingCaverns'],
          new Date().toISOString()
        ),
      ],
      expected: {
        tank: 'player2b',
        healer: 'player1b',
        damage: ['player3b', 'player4b', 'player5b'],
      },
    },
    {
      players: [
        new QueuedPlayerEntity(
          'player1c',
          20,
          ['Tank', 'Damage'],
          ['WailingCaverns'],
          new Date().toISOString()
        ),
        new QueuedPlayerEntity(
          'player2c',
          19,
          ['Healer'],
          ['WailingCaverns'],
          new Date().toISOString()
        ),
        new QueuedPlayerEntity(
          'player3c',
          21,
          ['Damage'],
          ['WailingCaverns'],
          new Date().toISOString()
        ),
        new QueuedPlayerEntity(
          'player4c',
          21,
          ['Damage'],
          ['WailingCaverns'],
          new Date().toISOString()
        ),
        new QueuedPlayerEntity(
          'player5c',
          21,
          ['Tank'],
          ['WailingCaverns'],
          new Date().toISOString()
        ),
      ],
      expected: {
        tank: 'player5c',
        healer: 'player2c',
        damage: ['player1c', 'player3c', 'player4c'],
      },
    },
    {
      players: [
        new QueuedPlayerEntity(
          'player1d',
          20,
          ['Tank'],
          ['WailingCaverns'],
          new Date().toISOString()
        ),
        new QueuedPlayerEntity(
          'player2d',
          19,
          ['Healer', 'Damage'],
          ['WailingCaverns'],
          new Date().toISOString()
        ),
        new QueuedPlayerEntity(
          'player3d',
          21,
          ['Damage'],
          ['WailingCaverns'],
          new Date().toISOString()
        ),
        new QueuedPlayerEntity(
          'player4d',
          21,
          ['Damage'],
          ['WailingCaverns'],
          new Date().toISOString()
        ),
        new QueuedPlayerEntity(
          'player5d',
          21,
          ['Healer'],
          ['WailingCaverns'],
          new Date().toISOString()
        ),
      ],
      expected: {
        tank: 'player1d',
        healer: 'player5d',
        damage: ['player2d', 'player3d', 'player4d'],
      },
    },
    {
      players: [
        new QueuedPlayerEntity(
          'player1e',
          20,
          ['Tank'],
          ['WailingCaverns'],
          new Date().toISOString(),
          ['player6e']
        ),
        new QueuedPlayerEntity(
          'player2e',
          19,
          ['Healer'],
          ['WailingCaverns'],
          new Date().toISOString()
        ),
        new QueuedPlayerEntity(
          'player3e',
          21,
          ['Damage'],
          ['WailingCaverns'],
          new Date().toISOString()
        ),
        new QueuedPlayerEntity(
          'player4e',
          21,
          ['Damage'],
          ['WailingCaverns'],
          new Date().toISOString()
        ),
        new QueuedPlayerEntity(
          'player5e',
          21,
          ['Damage'],
          ['WailingCaverns'],
          new Date().toISOString()
        ),
        new QueuedPlayerEntity(
          'player6e',
          21,
          ['Damage'],
          ['WailingCaverns'],
          new Date().toISOString(),
          ['player1e']
        ),
      ],
      expected: {
        tank: 'player1e',
        healer: 'player2e',
        damage: ['player6e', 'player3e', 'player4e'],
      },
    },
    {
      players: [
        new QueuedPlayerEntity(
          'player1f',
          20,
          ['Tank', 'Healer'],
          ['WailingCaverns'],
          new Date().toISOString(),
          ['player6f']
        ),
        new QueuedPlayerEntity(
          'player2f',
          19,
          ['Tank'],
          ['WailingCaverns'],
          new Date().toISOString()
        ),
        new QueuedPlayerEntity(
          'player3f',
          21,
          ['Damage'],
          ['WailingCaverns'],
          new Date().toISOString()
        ),
        new QueuedPlayerEntity(
          'player4f',
          21,
          ['Damage'],
          ['WailingCaverns'],
          new Date().toISOString()
        ),
        new QueuedPlayerEntity(
          'player5f',
          21,
          ['Damage'],
          ['WailingCaverns'],
          new Date().toISOString()
        ),
        new QueuedPlayerEntity(
          'player6f',
          21,
          ['Damage'],
          ['WailingCaverns'],
          new Date().toISOString(),
          ['player1f']
        ),
      ],
      expected: {
        tank: 'player2f',
        healer: 'player1f',
        damage: ['player6f', 'player3f', 'player4f'],
      },
    },
    {
      players: [
        new QueuedPlayerEntity(
          'player1g',
          20,
          ['Tank'],
          ['WailingCaverns'],
          new Date().toISOString()
        ),
        new QueuedPlayerEntity(
          'player2g',
          19,
          ['Healer'],
          ['WailingCaverns'],
          new Date().toISOString()
        ),
        new QueuedPlayerEntity(
          'player3g',
          21,
          ['Damage'],
          ['WailingCaverns'],
          new Date().toISOString(),
          ['player6g']
        ),
        new QueuedPlayerEntity(
          'player4g',
          21,
          ['Damage'],
          ['WailingCaverns'],
          new Date().toISOString()
        ),
        new QueuedPlayerEntity(
          'player5g',
          21,
          ['Damage'],
          ['WailingCaverns'],
          new Date().toISOString()
        ),
        new QueuedPlayerEntity(
          'player6g',
          21,
          ['Damage'],
          ['WailingCaverns'],
          new Date().toISOString(),
          ['player3g']
        ),
      ],
      expected: {
        tank: 'player1g',
        healer: 'player2g',
        damage: ['player3g', 'player6g', 'player4g'],
      },
    },
    {
      players: [
        new QueuedPlayerEntity(
          'player1h',
          20,
          ['Tank'],
          ['WailingCaverns'],
          new Date().toISOString()
        ),
        new QueuedPlayerEntity(
          'player2h',
          19,
          ['Healer'],
          ['WailingCaverns'],
          new Date().toISOString()
        ),
        new QueuedPlayerEntity(
          'player3h',
          21,
          ['Damage'],
          ['WailingCaverns'],
          new Date().toISOString()
        ),
        new QueuedPlayerEntity(
          'player4h',
          21,
          ['Damage'],
          ['WailingCaverns'],
          new Date().toISOString()
        ),
        new QueuedPlayerEntity(
          'player5h',
          21,
          ['Damage'],
          ['WailingCaverns'],
          new Date().toISOString(),
          ['player6h']
        ),
        new QueuedPlayerEntity(
          'player6h',
          21,
          ['Tank'],
          ['WailingCaverns'],
          new Date().toISOString(),
          ['player5h']
        ),
      ],
      expected: {
        tank: 'player6h',
        healer: 'player2h',
        damage: ['player3h', 'player4h', 'player5h'],
      },
    },
  ];
}
