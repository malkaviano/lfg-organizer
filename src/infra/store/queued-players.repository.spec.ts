import { Test, TestingModule } from '@nestjs/testing';

import { v4 as uuidv4 } from 'uuid';
import { mock } from 'ts-jest-mocker';

import { SQLQueuedPlayersRepository } from '@/infra/store/queued-players.repository';
import { PrismaService } from '@/infra/store/prisma.service';
import { QueuedPlayerEntity } from '@/group/entity/queued-player.entity';
import { ConfigModule } from '@nestjs/config';
import { QueuedPlayersRepositoryToken } from '@/group/interface/queued-players-repository.interface';
import { DateTimeHelper } from '@/helper/datetime.helper';

describe('SQLQueuedPlayersRepository', () => {
  let module: TestingModule;

  let service: SQLQueuedPlayersRepository;

  const mockedDateTimeHelper = mock(DateTimeHelper);

  const timestamp = '2025-04-01T11:42:19.088Z';

  const timestampOld = '2025-03-01T11:42:19.088Z';

  const [
    player1Id,
    player2Id,
    player3Id,
    player4Id,
    player5Id,
    player6Id,
    player7Id,
    player8Id,
    player9Id,
  ] = [
    uuidv4(),
    uuidv4(),
    uuidv4(),
    uuidv4(),
    uuidv4(),
    uuidv4(),
    uuidv4(),
    uuidv4(),
    uuidv4(),
  ];

  const player1 = new QueuedPlayerEntity(
    player1Id,
    20,
    ['Tank', 'Damage'],
    ['Deadmines'],
    timestamp
  );

  const player2 = new QueuedPlayerEntity(
    player2Id,
    21,
    ['Healer'],
    ['Deadmines'],
    timestamp
  );

  const player2old = new QueuedPlayerEntity(
    player2Id,
    21,
    ['Healer'],
    ['Deadmines'],
    timestampOld
  );

  const player3 = new QueuedPlayerEntity(
    player3Id,
    20,
    ['Damage'],
    ['Deadmines'],
    timestamp
  );

  const player4 = new QueuedPlayerEntity(
    player4Id,
    21,
    ['Healer'],
    ['Deadmines'],
    timestamp
  );

  const player5 = new QueuedPlayerEntity(
    player5Id,
    21,
    ['Tank'],
    ['Deadmines'],
    timestamp
  );

  const player6 = new QueuedPlayerEntity(
    player6Id,
    21,
    ['Damage'],
    ['WailingCaverns'],
    timestamp,
    [player7Id, player8Id, player9Id]
  );

  const player7 = new QueuedPlayerEntity(
    player7Id,
    22,
    ['Damage'],
    ['WailingCaverns'],
    timestamp,
    [player6Id, player8Id, player9Id]
  );

  const player8 = new QueuedPlayerEntity(
    player8Id,
    20,
    ['Damage'],
    ['WailingCaverns'],
    timestamp,
    [player6Id, player7Id, player9Id]
  );

  const player9 = new QueuedPlayerEntity(
    player9Id,
    20,
    ['Tank'],
    ['WailingCaverns'],
    timestamp,
    [player6Id, player7Id, player8Id]
  );

  beforeEach(() => {
    jest.resetAllMocks();
  });

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [],
        }),
      ],
      providers: [
        PrismaService,
        {
          provide: QueuedPlayersRepositoryToken,
          useClass: SQLQueuedPlayersRepository,
        },
        {
          provide: DateTimeHelper,
          useValue: mockedDateTimeHelper,
        },
      ],
    }).compile();

    service = module.get(QueuedPlayersRepositoryToken);
  });

  afterAll(async () => {
    await service.remove(
      [
        player1Id,
        player2Id,
        player3Id,
        player4Id,
        player5Id,
        player6Id,
        player7Id,
        player8Id,
        player9Id,
      ],
      timestamp
    );

    module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('manipulating players', () => {
    it('executes all repo operations', async () => {
      mockedDateTimeHelper.timestamp.mockReturnValue(timestamp);

      const queued = await service.add([
        player1,
        player2,
        player3,
        player4,
        player5,
      ]);

      expect(queued).toEqual(5);

      await expect(service.add([player2old])).rejects.toThrow(
        'Player already queued'
      );

      const notDeleted = await service.remove([player2Id], timestampOld);

      expect(notDeleted).toEqual(0);

      const retrieved = await service.get([
        player1.id,
        player2.id,
        player3.id,
        player4.id,
        player5.id,
      ]);

      expect(retrieved).toEqual([player1, player2, player3, player4, player5]);

      const removed = await service.remove([player2.id, player3.id], timestamp);

      expect(removed).toEqual(2);

      const next = await service.nextInQueue('Deadmines', 'Healer', []);

      expect(next).toEqual(player4);

      const next2 = await service.nextInQueue('Deadmines', 'Healer', [
        player4.id,
      ]);

      expect(next2).toBeNull();

      let grouped = await service.createGroup(
        {
          tank: player1.id,
          healer: player2.id,
          damage: [player3.id, player4.id, player5.id],
        },
        'Deadmines'
      );

      expect(grouped).toEqual(false);

      await service.add([player2, player3]);

      grouped = await service.createGroup(
        {
          tank: player1.id,
          healer: player2.id,
          damage: [player3.id, player4.id, player5.id],
        },
        'Deadmines'
      );

      expect(grouped).toEqual(true);

      let unsent = await service.groupsToSend();

      expect(unsent.length).toBeGreaterThan(0);

      await service.groupsSent(unsent.map((g) => g.groupId));

      unsent = await service.groupsToSend();

      expect(unsent.length).toEqual(0);

      const returned = await service.return(
        [player1.id, player2.id, player3.id],
        timestamp
      );

      expect(returned).toEqual(3);

      await service.add([player6, player7, player8, player9]);

      await service.remove([player7Id, player9Id], timestamp);

      const playerResult = await service.get([
        player6Id,
        player7Id,
        player8Id,
        player9Id,
      ]);

      const player6Result = playerResult
        .filter((p) => p.id === player6Id)
        .pop();

      expect(player6Result).toBeDefined();

      expect(player6Result?.playingWith).toEqual([player8Id]);

      const player7Result = playerResult
        .filter((p) => p.id === player7Id)
        .pop();

      expect(player7Result).not.toBeDefined();

      const player8Result = playerResult
        .filter((p) => p.id === player8Id)
        .pop();

      expect(player8Result).toBeDefined();

      expect(player8Result?.playingWith).toEqual([player6Id]);

      const player9Result = playerResult
        .filter((p) => p.id === player9Id)
        .pop();

      expect(player9Result).not.toBeDefined();
    });
  });
});
