import { Test, TestingModule } from '@nestjs/testing';
import { RmqContext } from '@nestjs/microservices';

import { mock } from 'ts-jest-mocker';

import { QueuedPlayerController } from '@/infra/queue/queued-player.controller';
import { PlayersQueueingService } from '@/group/group-maker/players-queueing.service';
import { PlayersDequeuedMessage } from '@/group/dto/players-dequeued.message';
import { PlayersQueuedMessage } from '@/group/dto/players-queued.message';
import { PlayersReturnedMessage } from '@/group/dto/players-returned.message';

describe('QueuedPlayerController', () => {
  let controller: QueuedPlayerController;

  const mockedGroupQueueingService = mock<PlayersQueueingService>();

  const mockedRabbitMQContext = mock(RmqContext);

  const timestamp = '2025-04-01T11:42:19.088Z';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QueuedPlayerController],
      providers: [
        {
          provide: PlayersQueueingService,
          useValue: mockedGroupQueueingService,
        },
      ],
    }).compile();

    controller = module.get<QueuedPlayerController>(QueuedPlayerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handleQueuedPlayer', () => {
    it('queue players and ack', async () => {
      let result = false;

      mockedGroupQueueingService.queue.mockResolvedValueOnce({ result: true });

      mockedRabbitMQContext.getChannelRef.mockImplementationOnce(() => ({
        ack: () => (result = true),
      }));

      const message: PlayersQueuedMessage = {
        queuedAt: timestamp,
        dungeons: ['Deadmines', 'RagefireChasm'],
        players: [{ id: 'id1', level: 21, roles: ['Damage', 'Tank'] }],
      };

      mockedRabbitMQContext.getMessage.mockImplementationOnce(() => ({
        data: message,
      }));

      await controller.handleQueuedPlayer(message, mockedRabbitMQContext);

      expect(mockedGroupQueueingService.queue).toHaveBeenCalledWith(message);

      expect(result).toEqual(true);
    });
  });

  describe('handleDequeuedPlayer', () => {
    it('dequeue players and ack', async () => {
      let result = false;

      mockedGroupQueueingService.dequeue.mockResolvedValueOnce({
        result: true,
      });

      mockedRabbitMQContext.getChannelRef.mockImplementationOnce(() => ({
        ack: () => (result = true),
      }));

      const message: PlayersDequeuedMessage = {
        playerIds: ['id1'],
        processedAt: timestamp,
      };

      mockedRabbitMQContext.getMessage.mockImplementationOnce(() => ({
        data: message,
      }));

      await controller.handleDequeuePlayer(message, mockedRabbitMQContext);

      expect(mockedGroupQueueingService.dequeue).toHaveBeenCalledWith(message);

      expect(result).toEqual(true);
    });
  });

  describe('handleReturnPlayer', () => {
    it('return players and ack', async () => {
      let result = false;

      mockedGroupQueueingService.return.mockResolvedValueOnce({
        result: true,
      });

      mockedRabbitMQContext.getChannelRef.mockImplementationOnce(() => ({
        ack: () => (result = true),
      }));

      const message: PlayersReturnedMessage = {
        playerIds: ['id1'],
        processedAt: timestamp,
      };

      mockedRabbitMQContext.getMessage.mockImplementationOnce(() => ({
        data: message,
      }));

      await controller.handleReturnPlayer(message, mockedRabbitMQContext);

      expect(mockedGroupQueueingService.return).toHaveBeenCalledWith(message);

      expect(result).toEqual(true);
    });
  });
});
