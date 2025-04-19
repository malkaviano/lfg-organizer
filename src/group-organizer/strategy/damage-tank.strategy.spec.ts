import { mock } from 'ts-jest-mocker';

import { QueuedPlayersRepository } from '@/group/interface/queued-players-repository.interface';
import { IdHelper } from '@/helper/id.helper';
import { QueuedPlayerEntity } from '@/group/entity/queued-player.entity';
import { DungeonName } from '@/dungeon/dungeon-name.literal';
import { DamageTankStrategy } from '@/group/strategy/damage-tank.stragegy';

describe('DamageTankStrategy', () => {
  const mockedQueuedPlayersRepository = mock<QueuedPlayersRepository>();

  const mockedIdHelper = mock(IdHelper);

  const strategy = new DamageTankStrategy(
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
          .mockResolvedValueOnce(damage1)
          .mockResolvedValueOnce(damage2)
          .mockResolvedValueOnce(null);

        mockedQueuedPlayersRepository.get.mockResolvedValueOnce([damage2]);

        const result = await strategy.run(dungeonName);

        expect(result).toBeNull();
      });
    });

    describe('when enough players', () => {
      it('return group', async () => {
        const dungeonName: DungeonName = 'WailingCaverns';

        mockedQueuedPlayersRepository.nextInQueue
          .mockResolvedValueOnce(damage1)
          .mockResolvedValueOnce(damage2)
          .mockResolvedValueOnce(damage3)
          .mockResolvedValueOnce(tank)
          .mockResolvedValueOnce(healer);

        mockedQueuedPlayersRepository.get
          .mockResolvedValueOnce([damage2])
          .mockResolvedValueOnce([damage3])
          .mockResolvedValueOnce([tank])
          .mockResolvedValueOnce([healer]);

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

      const tank2 = new QueuedPlayerEntity(
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
        new Date().toISOString(),
        ['player7a']
      );

      const healer2 = new QueuedPlayerEntity(
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
          .mockResolvedValueOnce(damage1)
          .mockResolvedValueOnce(damage3)
          .mockResolvedValueOnce(tank)
          .mockResolvedValueOnce(tank2)
          .mockResolvedValueOnce(healer)
          .mockResolvedValueOnce(healer2);

        mockedQueuedPlayersRepository.get
          .mockResolvedValueOnce([damage2])
          .mockResolvedValueOnce([damage3])
          .mockResolvedValueOnce([tank, damage4])
          .mockResolvedValueOnce([tank2])
          .mockResolvedValueOnce([healer, damage5])
          .mockResolvedValueOnce([healer2]);

        mockedIdHelper.newId.mockReturnValueOnce('newId1');

        const result = await strategy.run(dungeonName);

        expect(result).toEqual({
          id: 'newId1',
          tank: tank2.id,
          healer: healer2.id,
          damage: [damage1.id, damage2.id, damage3.id],
        });
      });
    });
  });
});
