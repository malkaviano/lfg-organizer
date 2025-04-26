import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';

import { v4 as uuidv4 } from 'uuid';
import { mock } from 'ts-jest-mocker';

import { MongoQueuedPlayersRepository } from '@/infra/mongodb/queued-players.repository';
import { QueuedPlayerEntity } from '@/group/entity/queued-player.entity';
import { MongodbModule } from '@/infra/mongodb/mongodb.module';
import { DateTimeHelper } from '@/helper/datetime.helper';
import mongodbTestConnection from '@/config/mongo-connection-test.config';
import mongodbCollection from '@/config/mongo-collection.config';

describe('MongoQueuedPlayersRepository', () => {
  let module: TestingModule;

  let service: MongoQueuedPlayersRepository;

  const timestamp = '2025-04-01T11:42:19.088Z';

  const timestamp2 = '2025-04-01T11:45:19.088Z';

  const mockedDateTimeHelper = mock(DateTimeHelper);

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
          load: [mongodbTestConnection, mongodbCollection],
        }),
        MongodbModule.forRootAsync(mongodbTestConnection.asProvider()),
      ],
      providers: [],
    }).compile();

    service = module.get<MongoQueuedPlayersRepository>(
      MongoQueuedPlayersRepository
    );
  });

  afterAll(async () => {
    await service.remove([
      player1Id,
      player2Id,
      player3Id,
      player4Id,
      player5Id,
      player6Id,
      player7Id,
      player8Id,
      player9Id,
    ]);

    module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('manipulating players', () => {
    it('executes all repo operations', async () => {
      const queued = await service.queue([
        player1,
        player2,
        player3,
        player4,
        player5,
      ]);

      expect(queued).toEqual(5);

      await expect(service.queue([player2])).rejects.toThrow(
        'Player already queued'
      );

      const retrieved = await service.get([
        player1.id,
        player2.id,
        player3.id,
        player4.id,
        player5.id,
      ]);

      expect(retrieved).toEqual([player1, player2, player3, player4, player5]);

      const removed = await service.remove([player2.id, player3.id]);

      expect(removed).toEqual(2);

      const next = await service.nextInQueue('Deadmines', 'Healer');

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

      await service.queue([player2, player3]);

      grouped = await service.createGroup(
        {
          tank: player1.id,
          healer: player2.id,
          damage: [player3.id, player4.id, player5.id],
        },
        'Deadmines'
      );

      expect(grouped).toEqual(true);

      let unsent = await service.unSentGroups();

      expect(unsent.length).toBeGreaterThan(0);

      await service.confirmGroupsSent(unsent.map((g) => g.groupId));

      unsent = await service.unSentGroups();

      expect(unsent.length).toEqual(0);

      const returned = await service.return([
        player1.id,
        player2.id,
        player3.id,
      ]);

      expect(returned).toEqual(3);

      await service.queue([player6, player7, player8, player9]);

      await service.remove([player7Id, player9Id]);

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
