import { Test, TestingModule } from '@nestjs/testing';

import { DungeonService } from '@/dungeon/dungeon.service';

describe('DungeonService', () => {
  let service: DungeonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DungeonService],
    }).compile();

    service = module.get<DungeonService>(DungeonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('have list of dungeons', () => {
    expect(DungeonService.Dungeons.length).toBeGreaterThan(0);
  });
});
