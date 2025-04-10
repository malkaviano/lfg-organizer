import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import * as request from 'supertest';
import { App } from 'supertest/types';
import TestAgent from 'supertest/lib/agent';
import { v4 as uuidv4 } from 'uuid';

import { AppModule } from '../src/app.module';
import { GroupQueueRequest } from '@/group/dto/group-queue.request';
import {
  GroupProducedToken,
  GroupProducer,
} from '@/group/interface/group-producer.interface';
import { CoordinatorService } from '@/group/coordinator.service';

describe('Grouping', () => {
  let app: INestApplication<App>;

  let producer: GroupProducer;

  let agent: InstanceType<typeof TestAgent>;

  let service: CoordinatorService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();

    producer = app.get(GroupProducedToken);

    service = app.get(CoordinatorService);

    agent = request.agent(app.getHttpServer());
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Forming a group', () => {
    it('form a group for Deadmines', async () => {
      const body1: GroupQueueRequest = {
        dungeons: ['Deadmines'],
        players: [
          {
            id: uuidv4(),
            level: 20,
            roles: ['Tank'],
          },
          {
            id: uuidv4(),
            level: 20,
            roles: ['Damage'],
          },
        ],
      };

      await agent.post('/group/queue').send(body1).expect(201);

      const body2: GroupQueueRequest = {
        dungeons: ['Deadmines'],
        players: [
          {
            id: uuidv4(),
            level: 20,
            roles: ['Healer'],
          },
          {
            id: uuidv4(),
            level: 20,
            roles: ['Damage'],
          },
          {
            id: uuidv4(),
            level: 20,
            roles: ['Damage'],
          },
        ],
      };

      await agent.post('/group/queue').send(body2).expect(201);

      await service.run('Deadmines');

      const result = await producer.groups();

      expect(result).toHaveLength(1);
    });
  });
});
