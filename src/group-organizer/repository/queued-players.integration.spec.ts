import { Test, TestingModule } from '@nestjs/testing';

import { v4 as uuidv4 } from 'uuid';

import { QueuedPlayersRepository } from '@/group/repository/queued-players.repository';
import { QueuedPlayerEntity } from '@/group/entity/queued-player.entity';

describe('QueuedPlayersRepository', () => {
  let service: QueuedPlayersRepository;

  const timestamp = '2025-04-01T11:42:19.088Z';

  const timestamp2 = '2025-04-02T11:42:19.088Z';

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

  const player3 = new QueuedPlayerEntity(
    'id3',
    20,
    ['Damage'],
    ['Deadmines'],
    timestamp
  );

  const player4 = new QueuedPlayerEntity(
    'id4',
    21,
    ['Healer'],
    ['Deadmines'],
    timestamp
  );

  const player5 = new QueuedPlayerEntity(
    'id5',
    21,
    ['Tank'],
    ['Deadmines'],
    timestamp
  );

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QueuedPlayersRepository],
    }).compile();

    service = module.get<QueuedPlayersRepository>(QueuedPlayersRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('in band', () => {
    describe('queue', () => {
      it('add new players to the repository', async () => {
        await service.queue([player1, player2, player3, player4, player5]);

        const queuedPlayers = await service.get([
          player1.id,
          player2.id,
          player3.id,
          player4.id,
          player5.id,
        ]);

        expect(queuedPlayers).toEqual([
          player1,
          player2,
          player3,
          player4,
          player5,
        ]);
      });

      describe('adding same players to the repository', () => {
        it('throw error', async () => {
          await expect(service.queue([player2])).rejects.toThrow(
            'DB duplicated id'
          );
        });
      });
    });

    describe('get', () => {
      it('return players', async () => {
        const id1 = uuidv4();

        const player1 = new QueuedPlayerEntity(
          id1,
          20,
          ['Tank', 'Damage'],
          ['Deadmines'],
          timestamp
        );

        const id2 = uuidv4();

        const id3 = uuidv4();

        const player2 = new QueuedPlayerEntity(
          id2,
          20,
          ['Tank', 'Damage'],
          ['RagefireChasm'],
          timestamp2,
          [id3]
        );

        const player3 = new QueuedPlayerEntity(
          id3,
          21,
          ['Healer', 'Damage'],
          ['RagefireChasm'],
          timestamp,
          [id2]
        );

        await service.queue([player1]);

        await service.queue([player2, player3]);

        const result = await service.get([id1, id2, id3]);

        expect(result).toEqual([player1, player2, player3]);
      });
    });

    describe('changeStatus', () => {
      it('return changed ids', async () => {
        await expect(service.get([player1.id, player2.id])).resolves.toEqual([
          player1,
          player2,
        ]);

        const result = await service.changeStatus(
          [player1.id, player2.id],
          'GROUPED'
        );

        expect(result).toEqual(2);
      });
    });

    describe('remove', () => {
      it('remove player', async () => {
        await service.remove([player3.id]);

        const result = await service.get([player3.id]);

        expect(result).toEqual([]);
      });
    });

    describe('nextInQueue', () => {
      it('return next player in queue', async () => {
        const result = await service.nextInQueue('Deadmines', 'Healer');

        expect(result).toEqual(player4);

        const result2 = await service.nextInQueue('Deadmines', 'Healer', [
          player4.id,
        ]);

        expect(result2).toBeNull();
      });
    });
  });
});
