import { Test, TestingModule } from '@nestjs/testing';

import { mock } from 'ts-jest-mocker';

import { ReturnedPlayerController } from '@/group/rabbitmq/returned-player.controller';
import { GroupMakerService } from '@/group/group-maker/group-maker.service';
import { RmqContext } from '@nestjs/microservices';

describe('ReturnedPlayerController', () => {
  let controller: ReturnedPlayerController;

  const mockedGroupMakerService = mock(GroupMakerService);

  const mockedRabbitMQContext = mock(RmqContext);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReturnedPlayerController],
      providers: [
        { provide: GroupMakerService, useValue: mockedGroupMakerService },
      ],
    }).compile();

    controller = module.get<ReturnedPlayerController>(ReturnedPlayerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('returned-player', () => {
    it('resets player to waiting status and ack', async () => {
      let result = false;

      mockedGroupMakerService.reset.mockResolvedValueOnce();

      mockedRabbitMQContext.getChannelRef.mockImplementationOnce(() => ({
        ack: () => (result = true),
      }));

      mockedRabbitMQContext.getMessage.mockImplementationOnce(() => ({
        data: {
          ids: ['id1'],
        },
      }));

      await controller.handleMessage({ ids: ['id1'] }, mockedRabbitMQContext);

      expect(result).toEqual(true);

      expect(mockedGroupMakerService.reset).toHaveBeenCalledWith(['id1']);
    });
  });
});
