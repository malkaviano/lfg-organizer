import { Test, TestingModule } from '@nestjs/testing';

import { GroupOrganizerController } from '@/group/group-organizer.controller';
import { GroupOrganizerService } from '@/group/group-organizer.service';

jest.mock('@/group/group-organizer.service');

describe('GroupOrganizerController', () => {
  let controller: GroupOrganizerController;

  const mockedGroupOrganizerService = jest.mocked(GroupOrganizerService);

  beforeEach(async () => {
    mockedGroupOrganizerService.mockClear();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupOrganizerController],
      providers: [
        {
          provide: GroupOrganizerService,
          useValue: mockedGroupOrganizerService,
        },
      ],
    }).compile();

    controller = module.get<GroupOrganizerController>(GroupOrganizerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
