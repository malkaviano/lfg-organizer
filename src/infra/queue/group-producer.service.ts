import {
  Inject,
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import {
  GroupProducer,
  QueueClientToken,
} from '@/group/interface/group-producer.interface';
import { PlayerGroupMessage } from '@/group/dto/player-group.message';
import { GroupMakerService } from '@/group/group-maker/group-maker.service';

@Injectable()
export class GroupProducerService
  implements GroupProducer, OnApplicationBootstrap, OnApplicationShutdown
{
  constructor(
    @Inject(QueueClientToken) private readonly client: ClientProxy,
    private readonly groupMakerService: GroupMakerService
  ) {}

  async onApplicationBootstrap() {
    await this.client.connect();
  }

  async onApplicationShutdown() {
    await this.client.close();
  }

  async publish(): Promise<void> {
    const groups = await this.groupMakerService.groupsToSend();

    this.client.emit<PlayerGroupMessage[]>('player-groups', groups);

    const groupIds = groups.map((group) => group.groupId);

    await this.groupMakerService.groupsSent(groupIds);
  }
}
