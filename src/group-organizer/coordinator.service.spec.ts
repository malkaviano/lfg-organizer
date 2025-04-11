import { Test, TestingModule } from '@nestjs/testing';

import { mock } from 'ts-jest-mocker';

import { CoordinatorService } from '@/group/coordinator.service';
import { GroupMakerService } from '@/group/group-maker/group-maker.service';
import { DungeonGroup } from '@/dungeon/dungeon-group.type';

describe('CoordinatorService', () => {
  let service: CoordinatorService;

  const mockedGroupMakerService = mock(GroupMakerService);

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoordinatorService,
        { provide: GroupMakerService, useValue: mockedGroupMakerService },
      ],
    }).compile();

    service = module.get<CoordinatorService>(CoordinatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('run', () => {
    groupFixtures().forEach(({ players, returned }) => {
      it('form groups', async () => {
        mockedGroupMakerService.groupFor.mockResolvedValueOnce(returned);

        mockedGroupMakerService.group.mockResolvedValueOnce(true);

        await service.run('WailingCaverns');

        expect(mockedGroupMakerService.group).toHaveBeenCalledWith(players);
      });
    });
  });
});

function groupFixtures(): {
  players: string[];
  returned: DungeonGroup;
}[] {
  return [
    {
      players: ['player1a', 'player2a', 'player3a', 'player4a', 'player5a'],
      returned: {
        tank: 'player1a',
        healer: 'player2a',
        damage: ['player3a', 'player4a', 'player5a'],
      },
    },
    {
      players: ['player2b', 'player1b', 'player3b', 'player4b', 'player5b'],
      returned: {
        tank: 'player2b',
        healer: 'player1b',
        damage: ['player3b', 'player4b', 'player5b'],
      },
    },
    {
      players: ['player5c', 'player2c', 'player1c', 'player3c', 'player4c'],
      returned: {
        tank: 'player5c',
        healer: 'player2c',
        damage: ['player1c', 'player3c', 'player4c'],
      },
    },
    {
      players: ['player1d', 'player5d', 'player2d', 'player3d', 'player4d'],
      returned: {
        tank: 'player1d',
        healer: 'player5d',
        damage: ['player2d', 'player3d', 'player4d'],
      },
    },
  ];
}
