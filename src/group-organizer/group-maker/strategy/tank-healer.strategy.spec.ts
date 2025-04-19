import { Test, TestingModule } from '@nestjs/testing';

import { mock } from 'ts-jest-mocker';

import { TankHealerStrategy } from '@/group/group-maker/strategy/tank-healer.strategy';
import {
  QueuedPlayersRepository,
  QueuedPlayersRepositoryToken,
} from '@/group/interface/queued-players-repository.interface';
import { QueuedPlayerEntity } from '@/group/entity/queued-player.entity';
import { DungeonName } from '@/dungeon/dungeon-name.literal';

describe('TankHealerStrategy', () => {
  const mockedQueuedPlayersRepository = mock<QueuedPlayersRepository>();

  let strategy: TankHealerStrategy;

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TankHealerStrategy,
        {
          provide: QueuedPlayersRepositoryToken,
          useValue: mockedQueuedPlayersRepository,
        },
      ],
    }).compile();

    strategy = module.get<TankHealerStrategy>(TankHealerStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('run', () => {
    const tank = new QueuedPlayerEntity(
      'player1a',
      20,
      ['Tank'],
      ['WailingCaverns'],
      new Date().toISOString()
    );

    const healer = new QueuedPlayerEntity(
      'player2a',
      19,
      ['Healer'],
      ['WailingCaverns'],
      new Date().toISOString()
    );

    const damage1 = new QueuedPlayerEntity(
      'player3a',
      21,
      ['Damage'],
      ['WailingCaverns'],
      new Date().toISOString()
    );

    const damage2 = new QueuedPlayerEntity(
      'player4a',
      21,
      ['Damage'],
      ['WailingCaverns'],
      new Date().toISOString()
    );

    const damage3 = new QueuedPlayerEntity(
      'player5a',
      21,
      ['Damage'],
      ['WailingCaverns'],
      new Date().toISOString()
    );

    describe('when not enough players', () => {
      it('return null', async () => {
        const dungeonName: DungeonName = 'WailingCaverns';

        mockedQueuedPlayersRepository.nextInQueue
          .mockResolvedValueOnce(tank)
          .mockResolvedValueOnce(healer)
          .mockResolvedValueOnce(damage1)
          .mockResolvedValueOnce(damage2)
          .mockResolvedValueOnce(null);

        mockedQueuedPlayersRepository.get
          .mockResolvedValueOnce([healer])
          .mockResolvedValueOnce([damage1])
          .mockResolvedValueOnce([damage2]);

        const result = await strategy.run(dungeonName);

        expect(result).toBeNull();
      });
    });

    describe('when enough players', () => {
      it('return group', async () => {
        const dungeonName: DungeonName = 'WailingCaverns';

        mockedQueuedPlayersRepository.nextInQueue
          .mockResolvedValueOnce(tank)
          .mockResolvedValueOnce(healer)
          .mockResolvedValueOnce(damage1)
          .mockResolvedValueOnce(damage2)
          .mockResolvedValueOnce(damage3);

        mockedQueuedPlayersRepository.get
          .mockResolvedValueOnce([healer])
          .mockResolvedValueOnce([damage1])
          .mockResolvedValueOnce([damage2])
          .mockResolvedValueOnce([damage3]);

        const result = await strategy.run(dungeonName);

        expect(result).toEqual({
          tank: tank.id,
          healer: healer.id,
          damage: [damage1.id, damage2.id, damage3.id],
        });
      });
    });

    describe('premade', () => {
      const tank = new QueuedPlayerEntity(
        'player1a',
        20,
        ['Tank'],
        ['WailingCaverns'],
        new Date().toISOString(),
        ['player6a']
      );

      const healer = new QueuedPlayerEntity(
        'player2a',
        19,
        ['Healer'],
        ['WailingCaverns'],
        new Date().toISOString(),
        ['player7a']
      );

      const damage1 = new QueuedPlayerEntity(
        'player3a',
        21,
        ['Damage'],
        ['WailingCaverns'],
        new Date().toISOString(),
        ['player4a']
      );

      const damage2 = new QueuedPlayerEntity(
        'player4a',
        21,
        ['Damage'],
        ['WailingCaverns'],
        new Date().toISOString(),
        ['player3a']
      );

      const damage3 = new QueuedPlayerEntity(
        'player5a',
        21,
        ['Damage'],
        ['WailingCaverns'],
        new Date().toISOString()
      );

      const damage4 = new QueuedPlayerEntity(
        'player6a',
        21,
        ['Damage'],
        ['WailingCaverns'],
        new Date().toISOString(),
        ['player1a']
      );

      const damage5 = new QueuedPlayerEntity(
        'player7a',
        21,
        ['Damage'],
        ['WailingCaverns'],
        new Date().toISOString(),
        ['player2a']
      );

      it('return group with premades', async () => {
        const dungeonName: DungeonName = 'WailingCaverns';

        mockedQueuedPlayersRepository.nextInQueue
          .mockResolvedValueOnce(tank)
          .mockResolvedValueOnce(healer)
          .mockResolvedValueOnce(damage1)
          .mockResolvedValueOnce(damage3);

        mockedQueuedPlayersRepository.get
          .mockResolvedValueOnce([damage4])
          .mockResolvedValueOnce([healer, damage5])
          .mockResolvedValueOnce([damage1, damage2])
          .mockResolvedValueOnce([damage3]);

        const result = await strategy.run(dungeonName);

        expect(result).toEqual({
          tank: tank.id,
          healer: healer.id,
          damage: [damage4.id, damage5.id, damage3.id],
        });
      });
    });
  });
});
