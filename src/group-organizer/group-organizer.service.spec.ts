import { Test, TestingModule } from '@nestjs/testing';

import { GroupOrganizerService } from '@/group/group-organizer.service';

describe('GroupOrganizerService', () => {
  let service: GroupOrganizerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupOrganizerService],
    }).compile();

    service = module.get<GroupOrganizerService>(GroupOrganizerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
