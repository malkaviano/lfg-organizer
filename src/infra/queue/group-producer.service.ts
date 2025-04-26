import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import {
  GroupProducer,
  QueueClientToken,
} from '@/group/interface/group-producer.interface';
import {
  QueuedPlayersRepository,
  QueuedPlayersRepositoryToken,
} from '@/group/interface/queued-players-repository.interface';
import { PlayerGroupMessage } from '@/group/dto/player-group.message';

@Injectable()
export class GroupProducerService
  implements GroupProducer, OnApplicationBootstrap
{
  constructor(
    @Inject(QueueClientToken) private readonly client: ClientProxy,
    @Inject(QueuedPlayersRepositoryToken)
    private readonly queuePlayersRepository: QueuedPlayersRepository
  ) {}

  async onApplicationBootstrap() {
    await this.client.connect();
  }

  async publish(): Promise<void> {
    const groups = await this.queuePlayersRepository.unSentGroups();

    this.client.emit<PlayerGroupMessage[]>('player-groups', groups);

    const groupIds = groups.map((group) => group.groupId);

    await this.queuePlayersRepository.confirmGroupsSent(groupIds);
  }
}
