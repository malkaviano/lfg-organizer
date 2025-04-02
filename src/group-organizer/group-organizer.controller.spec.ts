import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';

import { mock } from 'ts-jest-mocker';

import { GroupOrganizerController } from '@/group/group-organizer.controller';
import { GroupOrganizerService } from '@/group/group-organizer.service';
import { AddPlayersQueueRequest } from '@/group/dto/add-players.request';

describe('GroupOrganizerController', () => {
  let controller: GroupOrganizerController;

  const mockedGroupOrganizerService = mock(GroupOrganizerService);

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupOrganizerController],
      providers: [
        {
          provide: GroupOrganizerService,
          useValue: mockedGroupOrganizerService,
        },
      ],
    }).compile();

    controller = module.get<GroupOrganizerController>(GroupOrganizerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('queue', () => {
    it('queue new player', async () => {
      const body: AddPlayersQueueRequest = {
        players: [
          {
            id: 'id1',
            level: 15,
            roles: ['Tank', 'Damage'],
          },
        ],
        dungeons: ['Deadmines'],
      };

      mockedGroupOrganizerService.queuePlayers.mockResolvedValueOnce();

      await controller.queuePlayers(body);

      expect(mockedGroupOrganizerService.queuePlayers).toHaveBeenCalled();
    });

    it('throw error', async () => {
      const body: AddPlayersQueueRequest = {
        players: [
          {
            id: 'id1',
            level: 15,
            roles: ['Tank', 'Damage'],
          },
        ],
        dungeons: ['Deadmines'],
      };

      mockedGroupOrganizerService.queuePlayers.mockRejectedValue(
        new Error('Player cannot be queued')
      );

      await expect(controller.queuePlayers(body)).rejects.toThrow(
        'Player cannot be queued'
      );

      await expect(controller.queuePlayers(body)).rejects.toThrow(
        HttpException
      );
    });
  });
});
