import { Test, TestingModule } from '@nestjs/testing';
import { RmqContext } from '@nestjs/microservices';

import { mock } from 'ts-jest-mocker';

import { ReturnedPlayerController } from '@/infra/queue/returned-player.controller';
import {
  QueuedPlayersRepository,
  QueuedPlayersRepositoryToken,
} from '@/group/interface/queued-players-repository.interface';

describe('ReturnedPlayerController', () => {
  let controller: ReturnedPlayerController;

  const mockedQueuedPlayersRepository = mock<QueuedPlayersRepository>();

  const mockedRabbitMQContext = mock(RmqContext);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReturnedPlayerController],
      providers: [
        {
          provide: QueuedPlayersRepositoryToken,
          useValue: mockedQueuedPlayersRepository,
        },
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

      mockedQueuedPlayersRepository.return.mockResolvedValueOnce(1);

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

      expect(mockedQueuedPlayersRepository.return).toHaveBeenCalledWith(
        ['id1'],
        'WAITING'
      );
    });
  });
});
