import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';

import { mock } from 'ts-jest-mocker';

import { GroupOrganizerController } from '@/group/group-organizer.controller';
import { GroupQueueingService } from '@/group/group-queueing.service';
import { GroupQueueRequest } from '@/group/dto/group-queue.request';
import { GroupDequeueRequest } from '@/group/dto/group-dequeue.request';

describe('GroupOrganizerController', () => {
  let controller: GroupOrganizerController;

  const mockedGroupOrganizerService = mock(GroupQueueingService);

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupOrganizerController],
      providers: [
        {
          provide: GroupQueueingService,
          useValue: mockedGroupOrganizerService,
        },
      ],
    }).compile();

    controller = module.get<GroupOrganizerController>(GroupOrganizerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('queueParty', () => {
    it('queue party', async () => {
      const body: GroupQueueRequest = {
        players: [
          {
            id: 'id1',
            level: 20,
            roles: ['Tank', 'Damage'],
          },
          {
            id: 'id2',
            level: 20,
            roles: ['Damage'],
          },
        ],
        dungeons: ['Deadmines'],
      };

      mockedGroupOrganizerService.queueParty.mockResolvedValueOnce({
        result: true,
      });

      await controller.queueParty(body);

      expect(mockedGroupOrganizerService.queueParty).toHaveBeenCalled();
    });

    describe('when service fails', () => {
      it('throw HttpException', async () => {
        const body: GroupQueueRequest = {
          players: [
            {
              id: 'id1',
              level: 15,
              roles: ['Tank', 'Damage'],
            },
          ],
          dungeons: ['Deadmines'],
        };

        mockedGroupOrganizerService.queueParty.mockResolvedValue({
          result: false,
          errorMsg: 'Player cannot be queued',
        });

        await expect(controller.queueParty(body)).rejects.toThrow(
          'Player cannot be queued'
        );

        await expect(controller.queueParty(body)).rejects.toThrow(
          HttpException
        );
      });
    });
  });

  describe('dequeueParty', () => {
    describe('when party members are waiting', () => {
      it('remove party members from queue', async () => {
        const body: GroupDequeueRequest = {
          playerIds: ['id1', 'id2'],
        };

        mockedGroupOrganizerService.dequeueParty.mockResolvedValueOnce({
          result: true,
        });

        await controller.dequeueParty(body);

        expect(mockedGroupOrganizerService.dequeueParty).toHaveBeenCalled();
      });

      describe('when not all member can be removed', () => {
        it('throw error', async () => {
          const body: GroupDequeueRequest = {
            playerIds: ['id1', 'id2'],
          };

          mockedGroupOrganizerService.dequeueParty.mockResolvedValue({
            result: false,
            errorMsg: 'one or more players already selected for a group',
          });

          await expect(controller.dequeueParty(body)).rejects.toThrow(
            'one or more players already selected for a group'
          );

          await expect(controller.dequeueParty(body)).rejects.toThrow(
            HttpException
          );
        });
      });
    });
  });
});
