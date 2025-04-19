import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { DungeonGroup } from '@/dungeon/dungeon-group.type';
import {
  GroupProducedToken,
  GroupProducer,
} from '@/group/interface/group-producer.interface';
import {
  QueuedPlayersRepository,
  QueuedPlayersRepositoryToken,
} from '@/group/interface/queued-players-repository.interface';

@Injectable()
export class GroupProducerService
  implements GroupProducer, OnApplicationBootstrap
{
  constructor(
    @Inject(GroupProducedToken) private readonly client: ClientProxy,
    @Inject(QueuedPlayersRepositoryToken)
    private readonly queuePlayersRepository: QueuedPlayersRepository
  ) {}

  async onApplicationBootstrap() {
    await this.client.connect();
  }

  async publish(): Promise<void> {
    this.queuePlayersRepository.createGroup;
    // const observable = this.client.emit<number>('group-formed', group);
  }
}
