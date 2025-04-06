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

  const groupMakerService = new GroupMakerService(queuedPlayersRepository);

  const mockedPartyProduced = mock<GroupProducer>();

  beforeAll(async () => {
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
    it('form groups', async () => {
      const tank = new QueuedPlayerEntity(
        uuidv4(),
        20,
        ['Tank'],
        ['WailingCaverns'],
        new Date().toISOString()
      );

      const healer = new QueuedPlayerEntity(
        uuidv4(),
        19,
        ['Healer'],
        ['WailingCaverns'],
        new Date().toISOString()
      );

      const damage1 = new QueuedPlayerEntity(
        uuidv4(),
        21,
        ['Damage'],
        ['WailingCaverns'],
        new Date().toISOString()
      );

      const damage2 = new QueuedPlayerEntity(
        uuidv4(),
        21,
        ['Damage'],
        ['WailingCaverns'],
        new Date().toISOString()
      );

      const damage3 = new QueuedPlayerEntity(
        uuidv4(),
        21,
        ['Damage'],
        ['WailingCaverns'],
        new Date().toISOString()
      );

      await queuedPlayersRepository.queue([
        tank,
        healer,
        damage1,
        damage2,
        damage3,
      ]);

      const expected: DungeonGroup = {
        tank: tank.id,
        healer: healer.id,
        damage: [damage1.id, damage2.id, damage3.id],
      };

      mockedPartyProduced.send.mockResolvedValueOnce();

      await service.run();

      expect(mockedPartyProduced.send).toHaveBeenCalledWith(expected);
    });
  });
});
