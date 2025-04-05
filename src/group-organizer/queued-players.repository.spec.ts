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
      const players: QueuedPlayerEntity[] = [
        new QueuedPlayerEntity(
          'id1',
          20,
          ['Tank', 'Damage'],
          ['Deadmines'],
          timestamp
        ),
        new QueuedPlayerEntity('id2', 21, ['Healer'], ['Deadmines'], timestamp),
      ];

      const result = await service.queue(players);

      const queuedPlayers = await service.nextInQueue('Deadmines', 'WAITING', [
        'Tank',
        'Damage',
        'Healer',
      ]);

      expect(queuedPlayers).toEqual(players);
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
    describe('waiting', () => {
      it('get players by dungeon', async () => {
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
          ['Healer'],
          ['RagefireChasm'],
          timestamp
        );

        await service.queue([player1]);

        await service.queue([player2]);

        await service.queue([player3]);

        await expect(
          service.nextInQueue('Deadmines', 'WAITING', ['Tank', 'Damage'])
        ).resolves.toEqual([player1]);

        await expect(
          service.nextInQueue('RagefireChasm', 'WAITING', ['Tank', 'Healer'])
        ).resolves.toEqual([player3, player2]);

        await expect(
          service.nextInQueue('WailingCaverns', 'WAITING', ['Tank', 'Damage'])
        ).resolves.toEqual([]);

        await expect(
          service.nextInQueue('Deadmines', 'WAITING', ['Healer'])
        ).resolves.toEqual([]);
      });
    });

    describe('grouped', () => {
      it('get players by dungeon', async () => {
        const player1 = new QueuedPlayerEntity(
          'id6',
          20,
          ['Tank', 'Damage'],
          ['Deadmines'],
          timestamp
        );

        const player2 = new QueuedPlayerEntity(
          'id7',
          20,
          ['Tank', 'Damage'],
          ['RagefireChasm'],
          timestamp
        );

        await service.queue([player1, player2]);

        await service.changeStatus([player1.id, player2.id], 'GROUPED');

        await expect(
          service.nextInQueue('Deadmines', 'GROUPED', ['Tank', 'Damage'])
        ).resolves.toEqual([player1]);

        await expect(
          service.nextInQueue('RagefireChasm', 'GROUPED', ['Tank', 'Damage'])
        ).resolves.toEqual([player2]);

        await expect(
          service.nextInQueue('WailingCaverns', 'GROUPED', ['Tank', 'Damage'])
        ).resolves.toEqual([]);
      });
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

      await expect(
        service.nextInQueue('Deadmines', 'WAITING', ['Tank', 'Healer'])
      ).resolves.toEqual([player1, player2]);

      const result = await service.changeStatus(['id8', 'id9'], 'GROUPED');

      expect(result).toEqual(2);
    });
  });

  describe('remove', () => {
    describe('waiting', () => {
      it('remove waiting player', async () => {
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

        await service.changeStatus(['id11'], 'GROUPED');

        const result = await service.remove(['id10', 'id11'], 'WAITING');

        expect(result).toEqual(1);
      });
    });

    describe('grouped', () => {
      it('remove grouped player', async () => {
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

        await service.changeStatus(['id11'], 'GROUPED');

        const result = await service.remove(
          ['id10', 'id11', 'id12'],
          'GROUPED'
        );

        expect(result).toEqual(1);
      });
    });
  });
});
