import { Test, TestingModule } from '@nestjs/testing';

import { TankHealerStrategy } from '@/group/strategy/tank-healer.strategy';

describe('TankHealerStrategy', () => {
  let service: TankHealerStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TankHealerStrategy],
    }).compile();

    service = module.get<TankHealerStrategy>(TankHealerStrategy);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
