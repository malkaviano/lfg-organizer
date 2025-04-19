import { Test, TestingModule } from '@nestjs/testing';

import { mock } from 'ts-jest-mocker';

import { GroupMakerService } from '@/group/group-maker/group-maker.service';
import { DateTimeHelper } from '@/helper/datetime.helper';
import {
  QueuedPlayersRepository,
  QueuedPlayersRepositoryToken,
} from '@/group/interface/queued-players-repository.interface';
import { TankHealerStrategy } from '@/group/group-maker/strategy/tank-healer.strategy';
import { HealerTankStrategy } from '@/group/group-maker/strategy/healer-tank.strategy';
import { DamageTankStrategy } from '@/group/group-maker/strategy/damage-tank.strategy';

describe('GroupMakerService', () => {
  let service: GroupMakerService;

  const mockedQueuedPlayersRepository = mock<QueuedPlayersRepository>();

  const mockedDateTimeHelper = mock(DateTimeHelper);

  const mockedTankHealerStrategy = mock<TankHealerStrategy>();

  const mockedHealerTankStrategy = mock<HealerTankStrategy>();

  const mockedDamageTankStrategy = mock<DamageTankStrategy>();

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupMakerService,
        {
          provide: QueuedPlayersRepositoryToken,
          useValue: mockedQueuedPlayersRepository,
        },
        {
          provide: DateTimeHelper,
          useValue: mockedDateTimeHelper,
        },
        {
          provide: TankHealerStrategy,
          useValue: mockedTankHealerStrategy,
        },
        {
          provide: HealerTankStrategy,
          useValue: mockedHealerTankStrategy,
        },
        {
          provide: DamageTankStrategy,
          useValue: mockedDamageTankStrategy,
        },
      ],
    }).compile();

    service = module.get<GroupMakerService>(GroupMakerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('group', () => {
    describe('when all players change status', () => {
      it('return true', async () => {
        const group = {
          tank: 'tank1',
          healer: 'healer1',
          damage: ['dps1', 'dps2', 'dps3'],
        };

        mockedQueuedPlayersRepository.createGroup.mockResolvedValueOnce(true);

        const result = await service.createGroup(group);

        expect(result).toBe(true);
      });
    });

    describe('when some players do not change status', () => {
      it('return false', async () => {
        const group = {
          tank: 'tank1',
          healer: 'healer1',
          damage: ['dps1', 'dps2', 'dps3'],
        };
        mockedQueuedPlayersRepository.createGroup.mockResolvedValueOnce(false);

        const result = await service.createGroup(group);

        expect(result).toBe(false);
      });
    });
  });
});
