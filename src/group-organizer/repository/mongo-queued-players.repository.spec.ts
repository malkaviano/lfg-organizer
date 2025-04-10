import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { v4 as uuidv4 } from 'uuid';

import { MongoQueuedPlayersRepository } from '@/group/repository/mongo-queued-players.repository';
import { QueuedPlayersModule } from '@/group/repository/queued-players.module';
import { QueuedPlayerEntity } from '@/group/entity/queued-player.entity';
import { mongoTestConnection } from '@/config/mongo-connection.config';

describe('MongoQueuedPlayersRepository', () => {
  let module: TestingModule;

  let service: MongoQueuedPlayersRepository;

  const timestamp = '2025-04-01T11:42:19.088Z';

  const timestamp2 = '2025-04-02T11:42:19.088Z';

  const player1 = new QueuedPlayerEntity(
    uuidv4(),
    20,
    ['Tank', 'Damage'],
    ['Deadmines'],
    timestamp
  );

  const player2 = new QueuedPlayerEntity(
    uuidv4(),
    21,
    ['Healer'],
    ['Deadmines'],
    timestamp
  );

  const player3 = new QueuedPlayerEntity(
    uuidv4(),
    20,
    ['Damage'],
    ['Deadmines'],
    timestamp
  );

  const player4 = new QueuedPlayerEntity(
    uuidv4(),
    21,
    ['Healer'],
    ['Deadmines'],
    timestamp
  );

  const player5 = new QueuedPlayerEntity(
    uuidv4(),
    21,
    ['Tank'],
    ['Deadmines'],
    timestamp
  );

  beforeEach(() => {
    jest.resetAllMocks();
  });

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        QueuedPlayersModule,
        MongooseModule.forRootAsync(mongoTestConnection.asProvider()),
      ],
      providers: [ConfigService],
    }).compile();

    service = module.get<MongoQueuedPlayersRepository>(
      MongoQueuedPlayersRepository
    );
  });

  afterAll(async () => {
    await service.clear();

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

      const changed = await service.changeStatus(
        [player1.id, player2.id],
        'GROUPED'
      );

      expect(changed).toEqual(2);

      const removed = await service.remove([player3.id]);

      expect(removed).toEqual(1);

      const next = await service.nextInQueue('Deadmines', 'Healer');

      expect(next).toEqual(player4);

      const next2 = await service.nextInQueue('Deadmines', 'Healer', [
        player4.id,
      ]);

      expect(next2).toBeNull();
    });
  });
});
