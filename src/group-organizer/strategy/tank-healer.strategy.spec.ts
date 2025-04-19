import { mock } from 'ts-jest-mocker';
import { v4 as uuid4 } from 'uuid';

import { TankHealerStrategy } from '@/group/strategy/tank-healer.strategy';
import { QueuedPlayersRepository } from '@/group/interface/queued-players-repository.interface';
import { IdHelper } from '@/helper/id.helper';
import { QueuedPlayerEntity } from '@/group/entity/queued-player.entity';
import { DungeonGroup } from '@/dungeon/dungeon-group.type';
import { DungeonName } from '@/dungeon/dungeon-name.literal';

describe('TankHealerStrategy', () => {
  const mockedQueuedPlayersRepository = mock<QueuedPlayersRepository>();

  const mockedIdHelper = mock(IdHelper);

  const strategy = new TankHealerStrategy(
    mockedQueuedPlayersRepository,
    mockedIdHelper
  );

  beforeEach(async () => {
    jest.resetAllMocks();
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

        mockedIdHelper.newId.mockReturnValueOnce('newId1');

        const result = await strategy.run(dungeonName);

        expect(result).toEqual({
          id: 'newId1',
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
          .mockResolvedValueOnce(damage1);

        mockedQueuedPlayersRepository.get
          .mockResolvedValueOnce([damage4])
          .mockResolvedValueOnce([healer, damage5])
          .mockResolvedValueOnce([damage1]);

        mockedIdHelper.newId.mockReturnValueOnce('newId1');

        const result = await strategy.run(dungeonName);

        expect(result).toEqual({
          id: 'newId1',
          tank: tank.id,
          healer: healer.id,
          damage: [damage4.id, damage5.id, damage1.id],
        });
      });
    });
  });
});
