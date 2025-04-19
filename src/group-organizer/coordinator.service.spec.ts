import { Test, TestingModule } from '@nestjs/testing';

import { mock } from 'ts-jest-mocker';

import { CoordinatorService } from '@/group/coordinator.service';
import { GroupMakerService } from '@/group/group-maker/group-maker.service';

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
    it('form groups', async () => {
      const group = {
        tank: 'player1a',
        healer: 'player2a',
        damage: ['player3a', 'player4a', 'player5a'],
      };

      mockedGroupMakerService.groupFor.mockResolvedValueOnce({
        tank: 'player1a',
        healer: 'player2a',
        damage: ['player3a', 'player4a', 'player5a'],
      });

      mockedGroupMakerService.createGroup.mockResolvedValueOnce(true);

      await service.run('WailingCaverns');

      expect(mockedGroupMakerService.createGroup).toHaveBeenCalledWith(
        group,
        'WailingCaverns'
      );
    });
  });
});
