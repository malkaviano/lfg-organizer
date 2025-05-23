import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Cron } from '@nestjs/schedule';

import { GroupProducer } from '@/group/interface/group-producer.interface';
import { PlayerGroupMessage } from '@/group/dto/player-group.message';
import { GroupMakerService } from '@/group/group-maker/group-maker.service';
import { GroupProducedProxyToken } from '../../tokens';

@Injectable()
export class GroupProducerService
  implements GroupProducer, OnApplicationBootstrap, OnApplicationShutdown
{
  private readonly logger = new Logger(GroupProducerService.name);

  constructor(
    @Inject(GroupProducedProxyToken) private readonly client: ClientProxy,
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

    if (groups.length) {
      this.client.emit<PlayerGroupMessage[]>('dungeon-groups', groups);

      const groupIds = groups.map((group) => group.groupId);

      await this.groupMakerService.groupsSent(groupIds);

      this.logger.debug(`Published ${groups.length} groups`);
    } else {
      this.logger.debug('No groups to publish');
    }
  }

  @Cron('*/5 * * * * *	')
  public async job() {
    this.logger.debug('Publishing groups');

    await this.publish();
  }
}
