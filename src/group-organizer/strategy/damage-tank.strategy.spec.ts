import { Test, TestingModule } from '@nestjs/testing';

import { DamageTankStrategy } from '@/group/strategy/damage-tank.stragegy';

describe('DamageTankStrategy', () => {
  let service: DamageTankStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DamageTankStrategy],
    }).compile();

    service = module.get<DamageTankStrategy>(DamageTankStrategy);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
