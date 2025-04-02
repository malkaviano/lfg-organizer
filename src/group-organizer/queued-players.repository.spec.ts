import { Test, TestingModule } from '@nestjs/testing';

import { QueuedPlayersRepository } from '@/group/queued-players.repository';
import { QueuedPlayerEntity } from '@/group/entity/queued-player.entity';

describe('QueuedPlayersRepository', () => {
  let service: QueuedPlayersRepository;

  const timestamp = '2025-04-01T11:42:19.088Z';

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
    describe('add new players to the repository', () => {
      it('return true', async () => {
        const players: QueuedPlayerEntity[] = [
          new QueuedPlayerEntity(
            'id1',
            20,
            ['Tank', 'Damage'],
            ['Deadmines'],
            timestamp
          ),
          new QueuedPlayerEntity(
            'id2',
            21,
            ['Healer'],
            ['Deadmines'],
            timestamp
          ),
        ];

        const result = await service.queue(players);

        expect(result).toEqual(true);

        const queuedPlayers = await service.waiting('Deadmines');

        expect(queuedPlayers).toEqual(players);
      });
    });

    describe('adding same players to the repository', () => {
      it('return false', async () => {
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

        const result = await service.queue(players2);

        expect(result).toEqual(false);

        const queuedPlayers = await service.waiting('Deadmines');

        expect(queuedPlayers).toEqual(players1);
      });
    });
  });

  describe('waiting', () => {
    it('get players by dungeon', async () => {
      const player1 = new QueuedPlayerEntity(
        'id6',
        20,
        ['Tank', 'Damage'],
        ['Deadmines'],
        timestamp
      );

      await service.queue([player1]);

      const player2 = new QueuedPlayerEntity(
        'id7',
        20,
        ['Tank', 'Damage'],
        ['RagefireChasm'],
        timestamp
      );

      await service.queue([player2]);

      await expect(service.waiting('Deadmines')).resolves.toEqual([player1]);

      await expect(service.waiting('RagefireChasm')).resolves.toEqual([
        player2,
      ]);

      await expect(service.waiting('WailingCaverns')).resolves.toEqual([]);
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

      await expect(service.grouped('Deadmines')).resolves.toEqual([player1]);

      await expect(service.grouped('RagefireChasm')).resolves.toEqual([
        player2,
      ]);

      await expect(service.grouped('WailingCaverns')).resolves.toEqual([]);
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

      await expect(service.waiting('Deadmines')).resolves.toEqual([
        player1,
        player2,
      ]);

      await service.changeStatus(['id8', 'id9'], 'GROUPED');

      await expect(service.waiting('Deadmines')).resolves.toEqual([]);
    });
  });

  describe('leave', () => {
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

      await service.leave(['id10', 'id11']);

      await expect(service.waiting('Deadmines')).resolves.toEqual([]);

      await expect(service.grouped('Deadmines')).resolves.toEqual([player2]);
    });
  });

  describe('remove', () => {
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

      await service.remove(['id10', 'id11', 'id12']);

      await expect(service.waiting('Deadmines')).resolves.toEqual([player1]);

      await expect(service.grouped('Deadmines')).resolves.toEqual([]);
    });
  });
});
