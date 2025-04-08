import { Test, TestingModule } from '@nestjs/testing';

import { mock } from 'ts-jest-mocker';

import { CoordinatorService } from '@/group/coordinator.service';
import { GroupMakerService } from '@/group/group-maker.service';
import { QueuedPlayerEntity } from '@/group/entity/queued-player.entity';
import {
  GroupProducer,
  GroupProducedToken,
} from '@/group/interface/group-producer.interface';
import { DungeonGroup } from '@/dungeon/dungeon-group.type';

describe('CoordinatorService', () => {
  let service: CoordinatorService;

  const mockedGroupMakerService = mock(GroupMakerService);

  const mockedGroupProducer = mock<GroupProducer>();

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoordinatorService,
        { provide: GroupMakerService, useValue: mockedGroupMakerService },
        { provide: GroupProducedToken, useValue: mockedGroupProducer },
      ],
    }).compile();

    service = module.get<CoordinatorService>(CoordinatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('run', () => {
    groupFixtures().forEach(({ players, expected }) => {
      it('form groups', async () => {
        mockedGroupProducer.send.mockResolvedValueOnce();

        mockedGroupMakerService.groupFor.mockResolvedValueOnce(expected);

        mockedGroupMakerService.group.mockResolvedValueOnce(true);

        await service.run();

        expect(mockedGroupProducer.send).toHaveBeenCalledWith(expected);
      });
    });
  });
});

function groupFixtures(): {
  players: QueuedPlayerEntity[];
  expected: DungeonGroup;
}[] {
  return [
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
  ];
}
