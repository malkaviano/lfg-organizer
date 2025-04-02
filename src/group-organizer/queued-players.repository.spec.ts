import { Test, TestingModule } from '@nestjs/testing';

import { QueuedPlayersRepository } from '@/group/queued-players.repository';
import { QueuedPlayerEntity } from '@/group/entity/queued-player.entity';

describe('QueuedPlayersRepository', () => {
  let service: QueuedPlayersRepository;

  const timestamp = '2025-04-01T11:42:19.088Z';

  beforeEach(async () => {
    jest.resetAllMocks();

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

        const queuedPlayers = await service.get('Deadmines');

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

        const queuedPlayers = await service.get('Deadmines');

        expect(queuedPlayers).toEqual(players1);
      });
    });
  });

  describe('get', () => {
    it('filters by dungeon', async () => {
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

      await expect(service.get('Deadmines')).resolves.toEqual([player1]);

      await expect(service.get('RagefireChasm')).resolves.toEqual([player2]);

      await expect(service.get('WailingCaverns')).resolves.toEqual([]);
    });
  });
});
