import { Test, TestingModule } from '@nestjs/testing';

import { mock } from 'ts-jest-mocker';

import { GroupMakerService } from '@/group/group-maker.service';
import { QueuedPlayersRepository } from '@/group/queued-players.repository';
import { DateTimeHelper } from '@/helper/datetime.helper';
import { DungeonName } from '@/dungeon/dungeon-name.literal';
import { QueuedPlayerEntity } from '@/group/entity/queued-player.entity';

describe('GroupMakerService', () => {
  let service: GroupMakerService;

  const mockedQueuedPlayersRepository = mock(QueuedPlayersRepository);

  const mockedDateTimeHelper = mock(DateTimeHelper);

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupMakerService,
        {
          provide: QueuedPlayersRepository,
          useValue: mockedQueuedPlayersRepository,
        },
        {
          provide: DateTimeHelper,
          useValue: mockedDateTimeHelper,
        },
      ],
    }).compile();

    service = module.get<GroupMakerService>(GroupMakerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('reset', () => {
    it('should reset players', async () => {
      const playerIds = ['player1', 'player2'];

      mockedQueuedPlayersRepository.changeStatus.mockResolvedValueOnce(2);

      await service.reset(playerIds);

      expect(mockedQueuedPlayersRepository.changeStatus).toHaveBeenCalledWith(
        playerIds,
        'WAITING'
      );
    });
  });

  describe('group', () => {
    describe('when all players change status', () => {
      it('return true', async () => {
        const playerIds = ['tank1', 'healer1', 'dps1', 'dps2', 'dps3'];

        mockedQueuedPlayersRepository.changeStatus.mockResolvedValueOnce(5);

        const result = await service.group(playerIds);

        expect(result).toBe(true);
      });
    });

    describe('when some players do not change status', () => {
      it('return false', async () => {
        const playerIds = ['tank1', 'healer1', 'dps1', 'dps2', 'dps3'];

        mockedQueuedPlayersRepository.changeStatus.mockResolvedValueOnce(3);

        const result = await service.group(playerIds);

        expect(result).toBe(false);
      });

      it('revert status to waiting', async () => {
        const playerIds = ['tank1', 'healer1', 'dps1', 'dps2', 'dps3'];

        mockedQueuedPlayersRepository.changeStatus.mockResolvedValueOnce(3);

        await service.group(playerIds);

        expect(mockedQueuedPlayersRepository.changeStatus).toHaveBeenCalledWith(
          playerIds,
          'WAITING'
        );
      });
    });
  });

  describe('partyFor', () => {
    describe('when not enough players', () => {
      incompletePartyFixtures().forEach((fixture) => {
        it('return null', async () => {
          const [tank, healer, damage1, damage2, damage3] = fixture;

          const dungeonName: DungeonName = 'WailingCaverns';

          mockedQueuedPlayersRepository.nextInQueue.mockResolvedValueOnce(tank);
          mockedQueuedPlayersRepository.nextInQueue.mockResolvedValueOnce(
            healer
          );
          mockedQueuedPlayersRepository.nextInQueue.mockResolvedValueOnce(
            damage1
          );
          mockedQueuedPlayersRepository.nextInQueue.mockResolvedValueOnce(
            damage2
          );
          mockedQueuedPlayersRepository.nextInQueue.mockResolvedValueOnce(
            damage3
          );

          const result = await service.groupFor(dungeonName);

          expect(result).toBe(null);
        });
      });

      fullPartyFixtures().forEach((fixture) => {
        it('return party', async () => {
          const [tank, healer, damage1, damage2, damage3] = fixture;

          const dungeonName: DungeonName = 'WailingCaverns';

          mockedQueuedPlayersRepository.nextInQueue.mockResolvedValueOnce(tank);
          mockedQueuedPlayersRepository.nextInQueue.mockResolvedValueOnce(
            healer
          );
          mockedQueuedPlayersRepository.nextInQueue.mockResolvedValueOnce(
            damage1
          );
          mockedQueuedPlayersRepository.nextInQueue.mockResolvedValueOnce(
            damage2
          );
          mockedQueuedPlayersRepository.nextInQueue.mockResolvedValueOnce(
            damage3
          );

          const result = await service.groupFor(dungeonName);

          expect(result).toEqual({
            tank: 'tank1',
            healer: 'healer1',
            damage: ['damage1', 'damage2', 'damage3'],
          });

          expect(
            mockedQueuedPlayersRepository.nextInQueue
          ).toHaveBeenCalledWith(dungeonName, 'Tank', []);

          expect(
            mockedQueuedPlayersRepository.nextInQueue
          ).toHaveBeenCalledWith(dungeonName, 'Healer', ['tank1']);

          expect(
            mockedQueuedPlayersRepository.nextInQueue
          ).toHaveBeenCalledWith(dungeonName, 'Damage', ['tank1', 'healer1']);

          expect(
            mockedQueuedPlayersRepository.nextInQueue
          ).toHaveBeenCalledWith(dungeonName, 'Damage', [
            'tank1',
            'healer1',
            'damage1',
          ]);

          expect(
            mockedQueuedPlayersRepository.nextInQueue
          ).toHaveBeenCalledWith(dungeonName, 'Damage', [
            'tank1',
            'healer1',
            'damage1',
            'damage2',
          ]);
        });
      });
    });
  });
});

function timestamp() {
  return '2025-04-01T11:42:19.088Z';
}

function fullPartyFixtures() {
  return [
    [
      new QueuedPlayerEntity(
        'tank1',
        22,
        ['Tank'],
        ['WailingCaverns'],
        timestamp()
      ),
      new QueuedPlayerEntity(
        'healer1',
        22,
        ['Healer'],
        ['WailingCaverns'],
        timestamp()
      ),
      new QueuedPlayerEntity(
        'damage1',
        20,
        ['Damage'],
        ['WailingCaverns'],
        timestamp()
      ),
      new QueuedPlayerEntity(
        'damage2',
        21,
        ['Damage'],
        ['WailingCaverns'],
        timestamp()
      ),
      new QueuedPlayerEntity(
        'damage3',
        19,
        ['Damage'],
        ['WailingCaverns'],
        timestamp()
      ),
    ],
  ];
}

function incompletePartyFixtures() {
  return [
    [
      new QueuedPlayerEntity(
        'tank1',
        22,
        ['Tank'],
        ['WailingCaverns'],
        timestamp()
      ),
      new QueuedPlayerEntity(
        'healer1',
        22,
        ['Healer'],
        ['WailingCaverns'],
        timestamp()
      ),
      new QueuedPlayerEntity(
        'damage1',
        20,
        ['Damage'],
        ['WailingCaverns'],
        timestamp()
      ),
      new QueuedPlayerEntity(
        'damage2',
        21,
        ['Damage'],
        ['WailingCaverns'],
        timestamp()
      ),
      null,
    ],
    [
      new QueuedPlayerEntity(
        'tank1',
        22,
        ['Tank'],
        ['WailingCaverns'],
        timestamp()
      ),
      null,
      new QueuedPlayerEntity(
        'damage1',
        20,
        ['Damage'],
        ['WailingCaverns'],
        timestamp()
      ),
      new QueuedPlayerEntity(
        'damage2',
        21,
        ['Damage'],
        ['WailingCaverns'],
        timestamp()
      ),
      new QueuedPlayerEntity(
        'damage3',
        19,
        ['Damage'],
        ['WailingCaverns'],
        timestamp()
      ),
    ],
    [null, null, null, null, null],
  ];
}
