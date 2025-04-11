import { Test, TestingModule } from '@nestjs/testing';

import { mock } from 'ts-jest-mocker';

import { GroupMakerService } from '@/group/group-maker/group-maker.service';
import { DateTimeHelper } from '@/helper/datetime.helper';
import {
  QueuedPlayersRepository,
  QueuedPlayersRepositoryToken,
} from '@/group/interface/queued-players-repository.interface';

describe('GroupMakerService', () => {
  let service: GroupMakerService;

  const mockedQueuedPlayersRepository = mock<QueuedPlayersRepository>();

  const mockedDateTimeHelper = mock(DateTimeHelper);

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

      mockedQueuedPlayersRepository.return.mockResolvedValueOnce(2);

      await service.reset(playerIds);

      expect(mockedQueuedPlayersRepository.return).toHaveBeenCalledWith(
        playerIds,
        'WAITING'
      );
    });
  });

  describe('group', () => {
    describe('when all players change status', () => {
      it('return true', async () => {
        const playerIds = ['tank1', 'healer1', 'dps1', 'dps2', 'dps3'];

        mockedQueuedPlayersRepository.group.mockResolvedValueOnce(true);

        const result = await service.group(playerIds);

        expect(result).toBe(true);
      });
    });

    describe('when some players do not change status', () => {
      it('return false', async () => {
        const playerIds = ['tank1', 'healer1', 'dps1', 'dps2', 'dps3'];

        mockedQueuedPlayersRepository.group.mockResolvedValueOnce(false);

        const result = await service.group(playerIds);

        expect(result).toBe(false);
      });
    });
  });
});
