import { Test, TestingModule } from '@nestjs/testing';

import { v4 as uuidv4 } from 'uuid';

import { QueuedPlayersRepository } from '@/group/queued-players.repository';
import { QueuedPlayerEntity } from '@/group/entity/queued-player.entity';

describe('QueuedPlayersRepository', () => {
  let service: QueuedPlayersRepository;

  const timestamp = '2025-04-01T11:42:19.088Z';

  const timestamp2 = '2025-04-02T11:42:19.088Z';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QueuedPlayersRepository],
    }).compile();

    service = module.get<QueuedPlayersRepository>(QueuedPlayersRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('queue', () => {
    it('add new players to the repository', async () => {
      const player1 = new QueuedPlayerEntity(
        'id1',
        20,
        ['Tank', 'Damage'],
        ['Deadmines'],
        timestamp
      );

      const player2 = new QueuedPlayerEntity(
        'id2',
        21,
        ['Healer'],
        ['Deadmines'],
        timestamp
      );

      await service.queue([player1, player2]);

      const queuedPlayers = await service.get(
        [player1.id, player2.id],
        'WAITING'
      );

      expect(queuedPlayers).toEqual([player1, player2]);
    });

    describe('adding same players to the repository', () => {
      it('throw error', async () => {
        const players1: QueuedPlayerEntity[] = [
          new QueuedPlayerEntity(
            'id3',
            20,
            ['Tank', 'Damage'],
            ['Deadmines'],
            timestamp
          ),
          new QueuedPlayerEntity(
            'id4',
            21,
            ['Healer'],
            ['Deadmines'],
            timestamp
          ),
        ];

        const players2: QueuedPlayerEntity[] = [
          new QueuedPlayerEntity(
            'id3',
            21,
            ['Healer'],
            ['Deadmines'],
            timestamp
          ),
          new QueuedPlayerEntity(
            'id5',
            20,
            ['Tank', 'Damage'],
            ['Deadmines'],
            timestamp
          ),
        ];

        await service.queue(players1);

        await expect(service.queue(players2)).rejects.toThrow(
          'DB duplicated id'
        );
      });
    });
  });

  describe('get', () => {
    it('return waiting players', async () => {
      const id1 = uuidv4();

      const player1 = new QueuedPlayerEntity(
        id1,
        20,
        ['Tank', 'Damage'],
        ['Deadmines'],
        timestamp
      );

      const id2 = uuidv4();

      const player2 = new QueuedPlayerEntity(
        id2,
        20,
        ['Tank', 'Damage'],
        ['RagefireChasm'],
        timestamp2
      );

      const id3 = uuidv4();

      const player3 = new QueuedPlayerEntity(
        id3,
        21,
        ['Healer', 'Damage'],
        ['RagefireChasm'],
        timestamp
      );

      await service.queue([player1]);

      await service.queue([player2]);

      await service.queue([player3]);

      const result = await service.get([id1, id2, id3], 'WAITING');

      expect(result).toEqual([player1, player2, player3]);
    });

    it('return grouped players', async () => {
      const id1 = uuidv4();

      const player1 = new QueuedPlayerEntity(
        id1,
        20,
        ['Tank', 'Damage'],
        ['Deadmines'],
        timestamp
      );

      const id2 = uuidv4();

      const player2 = new QueuedPlayerEntity(
        id2,
        20,
        ['Tank', 'Damage'],
        ['RagefireChasm'],
        timestamp2
      );

      const id3 = uuidv4();

      const player3 = new QueuedPlayerEntity(
        id3,
        21,
        ['Healer', 'Damage'],
        ['RagefireChasm'],
        timestamp
      );

      await service.queue([player1]);

      await service.queue([player2]);

      await service.queue([player3]);

      service.changeStatus([id1, id2], 'GROUPED');

      const result = await service.get([id1, id2, id3], 'GROUPED');

      expect(result).toEqual([player1, player2]);
    });
  });

  describe('changeStatus', () => {
    it('return changed ids', async () => {
      const player1 = new QueuedPlayerEntity(
        'id8',
        20,
        ['Tank', 'Damage'],
        ['Deadmines'],
        timestamp
      );

      const player2 = new QueuedPlayerEntity(
        'id9',
        20,
        ['Healer', 'Damage'],
        ['Deadmines'],
        timestamp
      );

      await service.queue([player1, player2]);

      await expect(service.get(['id8', 'id9'], 'WAITING')).resolves.toEqual([
        player1,
        player2,
      ]);

      const result = await service.changeStatus(['id8', 'id9'], 'GROUPED');

      expect(result).toEqual(2);
    });
  });

  describe('remove', () => {
    it('remove player', async () => {
      const player1 = new QueuedPlayerEntity(
        'id10',
        20,
        ['Tank', 'Damage'],
        ['Deadmines'],
        timestamp
      );

      const player2 = new QueuedPlayerEntity(
        'id11',
        20,
        ['Healer', 'Damage'],
        ['Deadmines'],
        timestamp
      );

      await service.queue([player1, player2]);

      await service.remove(['id10', 'id11']);

      const result = await service.get(['id10', 'id11'], 'WAITING');

      expect(result).toEqual([]);
    });
  });

  describe('nextInQueue', () => {
    it('return next player in queue', async () => {
      const player1 = new QueuedPlayerEntity(
        'id12',
        20,
        ['Tank', 'Damage'],
        ['Deadmines'],
        timestamp
      );

      const player2 = new QueuedPlayerEntity(
        'id13',
        20,
        ['Healer', 'Damage'],
        ['Deadmines'],
        timestamp
      );

      await service.queue([player1, player2]);

      const result = await service.nextInQueue('Deadmines', 'Healer');

      expect(result).toEqual(player2);

      const result2 = await service.nextInQueue('Deadmines', 'Healer', [
        'id13',
      ]);

      expect(result2).toBeUndefined();
    });
  });
});
