import { Test, TestingModule } from '@nestjs/testing';
import { RmqContext } from '@nestjs/microservices';

import { mock } from 'ts-jest-mocker';

import { QueuedPlayerController } from '@/infra/queue/queued-player.controller';
import { PlayersQueueingService } from '@/group/group-maker/players-queueing.service';
import { PlayersDequeueMessage } from '@/group/dto/players-dequeue.message';
import { PlayersQueueMessage } from '@/group/dto/players-queue.message';

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

      const message: PlayersQueueMessage = {
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

      const message: PlayersDequeueMessage = {
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
});
