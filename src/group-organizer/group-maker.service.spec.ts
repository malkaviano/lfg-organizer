import { Test, TestingModule } from '@nestjs/testing';

import { mock } from 'ts-jest-mocker';

import { GroupMakerService } from '@/group/group-maker.service';
import { QueuedPlayersRepository } from '@/group/queued-players.repository';
import { DateTimeHelper } from '@/helper/datetime.helper';

describe('GroupMakerService', () => {
  let service: GroupMakerService;

  const mockedQueuedPlayersRepository = mock(QueuedPlayersRepository);

  const mockedDateTimeHelper = mock(DateTimeHelper);

  const timestamp = '2025-04-01T11:42:19.088Z';

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
});
