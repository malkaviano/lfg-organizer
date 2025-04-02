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
    it('add new players to the repository', async () => {
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
          ['RagefireChasm', 'Deadmines'],
          timestamp
        ),
      ];

      const result = await service.queue(players);

      expect(result).toEqual(true);

      const queuedPlayers = await service.get();

      expect(queuedPlayers).toEqual(players);
    });
  });

  it('adding same players to the repository return false', async () => {
    const players1: QueuedPlayerEntity[] = [
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
        ['RagefireChasm', 'Deadmines'],
        timestamp
      ),
    ];

    const players2: QueuedPlayerEntity[] = [
      new QueuedPlayerEntity(
        'id3',
        21,
        ['Healer'],
        ['RagefireChasm', 'Deadmines'],
        timestamp
      ),
      new QueuedPlayerEntity(
        'id1',
        20,
        ['Tank', 'Damage'],
        ['Deadmines'],
        timestamp
      ),
    ];

    await service.queue(players1);

    const result = await service.queue(players2);

    expect(result).toEqual(false);

    const queuedPlayers = await service.get();

    expect(queuedPlayers).toEqual(players1);
  });
});
