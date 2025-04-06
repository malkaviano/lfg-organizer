import { Test, TestingModule } from '@nestjs/testing';

import { v4 as uuidv4 } from 'uuid';
import { mock, Mock } from 'ts-jest-mocker';

import { CoordinatorService } from '@/group/coordinator.service';
import { GroupMakerService, DungeonGroup } from '@/group/group-maker.service';
import { QueuedPlayersRepository } from './queued-players.repository';
import { QueuedPlayerEntity } from '@/group/entity/queued-player.entity';
import {
  GroupProducer,
  GroupProducedToken,
} from '@/group/interface/group-producer.interface';

describe('CoordinatorService', () => {
  let service: CoordinatorService;

  const queuedPlayersRepository = new QueuedPlayersRepository();

  const mockedPartyProduced = mock<GroupProducer>();

  beforeEach(async () => {
    jest.resetAllMocks();

    const groupMakerService = new GroupMakerService(queuedPlayersRepository);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoordinatorService,
        { provide: GroupMakerService, useValue: groupMakerService },
        { provide: GroupProducedToken, useValue: mockedPartyProduced },
      ],
    }).compile();

    service = module.get<CoordinatorService>(CoordinatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('run', () => {
    groupFixtures().forEach(({ players, expected }) => {
      it('form groups', async () => {
        await queuedPlayersRepository.queue(players);

        mockedPartyProduced.send.mockResolvedValueOnce();

        await service.run();

        expect(mockedPartyProduced.send).toHaveBeenCalledWith(expected);
      });
    });
  });
});

function groupFixtures(): {
  players: QueuedPlayerEntity[];
  expected: DungeonGroup;
}[] {
  return [
    {
      players: [
        new QueuedPlayerEntity(
          'player1a',
          20,
          ['Tank'],
          ['WailingCaverns'],
          new Date().toISOString()
        ),
        new QueuedPlayerEntity(
          'player2a',
          19,
          ['Healer'],
          ['WailingCaverns'],
          new Date().toISOString()
        ),
        new QueuedPlayerEntity(
          'player3a',
          21,
          ['Damage'],
          ['WailingCaverns'],
          new Date().toISOString()
        ),
        new QueuedPlayerEntity(
          'player4a',
          21,
          ['Damage'],
          ['WailingCaverns'],
          new Date().toISOString()
        ),
        new QueuedPlayerEntity(
          'player5a',
          21,
          ['Damage'],
          ['WailingCaverns'],
          new Date().toISOString()
        ),
      ],
      expected: {
        tank: 'player1a',
        healer: 'player2a',
        damage: ['player3a', 'player4a', 'player5a'],
      },
    },
    // {
    //   players: [
    //     new QueuedPlayerEntity(
    //       'player1b',
    //       20,
    //       ['Tank', 'Healer'],
    //       ['WailingCaverns'],
    //       new Date().toISOString()
    //     ),
    //     new QueuedPlayerEntity(
    //       'player2b',
    //       19,
    //       ['Tank'],
    //       ['WailingCaverns'],
    //       new Date().toISOString()
    //     ),
    //     new QueuedPlayerEntity(
    //       'player3b',
    //       21,
    //       ['Damage'],
    //       ['WailingCaverns'],
    //       new Date().toISOString()
    //     ),
    //     new QueuedPlayerEntity(
    //       'player4b',
    //       21,
    //       ['Damage'],
    //       ['WailingCaverns'],
    //       new Date().toISOString()
    //     ),
    //     new QueuedPlayerEntity(
    //       'player5b',
    //       21,
    //       ['Damage'],
    //       ['WailingCaverns'],
    //       new Date().toISOString()
    //     ),
    //   ],
    //   expected: {
    //     tank: 'player2b',
    //     healer: 'player1b',
    //     damage: ['player3b', 'player4b', 'player5b'],
    //   },
    // },
  ];
}
