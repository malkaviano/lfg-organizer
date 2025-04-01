import { Test, TestingModule } from '@nestjs/testing';

import { mock } from 'ts-jest-mocker';

import { GroupOrganizerService } from '@/group/group-organizer.service';
import { AddPlayersQueueRequest } from '@/group/dto/add-players.request';
import { QueuedPlayersRepository } from '@/group/queued-players.repository';
import { QueuedPlayerEntity } from '@/group/entity/queued-player.entity';
import { DateTimeHelper } from '@/helper/datetime.helper';

describe('GroupOrganizerService', () => {
  let service: GroupOrganizerService;

  const mockedQueuedPlayersRepository = mock(QueuedPlayersRepository);

  const mockedDateTimeHelper = mock(DateTimeHelper);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupOrganizerService,
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

    service = module.get<GroupOrganizerService>(GroupOrganizerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('queue', () => {
    it('sanitize values', async () => {
      const body: AddPlayersQueueRequest = {
        players: [
          {
            id: 'id1',
            level: 15,
            roles: ['Tank', 'Damage', 'Damage'],
            dungeons: ['Deadmines', 'Deadmines'],
          },
          {
            id: 'id2',
            level: 17,
            roles: ['Healer', 'Healer'],
            dungeons: ['RagefireChasm', 'Deadmines'],
          },
        ],
      };

      const timestamp = '2025-04-01T11:42:19.088Z';

      const expected: QueuedPlayerEntity[] = [
        new QueuedPlayerEntity(
          'id1',
          15,
          ['Tank', 'Damage'],
          ['Deadmines'],
          timestamp
        ),
        new QueuedPlayerEntity(
          'id2',
          17,
          ['Healer'],
          ['RagefireChasm', 'Deadmines'],
          timestamp
        ),
      ];

      mockedDateTimeHelper.timestamp.mockReturnValueOnce(timestamp);

      mockedQueuedPlayersRepository.queue.mockResolvedValueOnce();

      await service.queuePlayers(body);

      expect(mockedQueuedPlayersRepository.queue).toHaveBeenCalledWith(
        expected
      );
    });
  });
});
