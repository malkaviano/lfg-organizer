import { Test, TestingModule } from '@nestjs/testing';
import { RmqContext } from '@nestjs/microservices';

import { mock } from 'ts-jest-mocker';

import { QueuedPlayerController } from '@/infra/queue/queued-player.controller';
import { GroupQueueingService } from '@/group/group-maker/group-queueing.service';

describe('QueuedPlayerController', () => {
  let controller: QueuedPlayerController;

  const mockedGroupQueueingService = mock<GroupQueueingService>();

  const mockedRabbitMQContext = mock(RmqContext);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QueuedPlayerController],
      providers: [
        {
          provide: GroupQueueingService,
          useValue: mockedGroupQueueingService,
        },
      ],
    }).compile();

    controller = module.get<QueuedPlayerController>(QueuedPlayerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('returned-player', () => {
    it('resets player to waiting status and ack', async () => {
      let result = false;

      mockedGroupQueueingService.return.mockResolvedValueOnce(1);

      mockedRabbitMQContext.getChannelRef.mockImplementationOnce(() => ({
        ack: () => (result = true),
      }));

      mockedRabbitMQContext.getMessage.mockImplementationOnce(() => ({
        data: {
          playerIds: ['id1'],
        },
      }));

      await controller.handleReturnPlayer(
        { playerIds: ['id1'] },
        mockedRabbitMQContext
      );

      expect(result).toEqual(true);

      expect(mockedGroupQueueingService.return).toHaveBeenCalledWith({
        playerIds: ['id1'],
      });
    });
  });
});
