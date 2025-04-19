import { Test, TestingModule } from '@nestjs/testing';

import { HealerTankStrategy } from '@/group/strategy/healer-tank.strategy';

describe('HealerTankStrategy', () => {
  let service: HealerTankStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HealerTankStrategy],
    }).compile();

    service = module.get<HealerTankStrategy>(HealerTankStrategy);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
