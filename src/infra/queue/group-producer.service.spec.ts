import { Test, TestingModule } from '@nestjs/testing';
import { ClientProxy } from '@nestjs/microservices';

import { mock } from 'ts-jest-mocker';

import { GroupProducerService } from '@/infra/queue/group-producer.service';
import { GroupMakerService } from '@/group/group-maker/group-maker.service';
import { GroupProducedProxyToken } from '../../tokens';

describe('GroupProducerService', () => {
  let service: GroupProducerService;

  const mockedRmqClient = mock<ClientProxy>();

  const mockedGroupMakerService = mock<GroupMakerService>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupProducerService,
        { provide: GroupProducedProxyToken, useValue: mockedRmqClient },
        {
          provide: GroupMakerService,
          useValue: mockedGroupMakerService,
        },
      ],
    }).compile();

    service = module.get<GroupProducerService>(GroupProducerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('publish', () => {
    it('should call the client emit method with the correct parameters', async () => {
      const groups = [
        {
          groupId: 'group1',
          dungeon: 'dungeon1',
          tank: 'tank1',
          healer: 'healer1',
          damage: ['damage1', 'damage2', 'damage3'],
        },
      ];

      mockedGroupMakerService.groupsToSend.mockResolvedValueOnce(groups);

      mockedGroupMakerService.groupsSent.mockResolvedValueOnce();

      mockedRmqClient.emit.mockReturnValueOnce({} as any);

      await service.publish();

      expect(mockedRmqClient.emit).toHaveBeenCalledWith(
        'dungeon-groups',
        groups
      );

      expect(mockedGroupMakerService.groupsSent).toHaveBeenCalledWith([
        'group1',
      ]);
    });
  });
});
