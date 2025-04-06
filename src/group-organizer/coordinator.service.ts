import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { GroupMakerService } from '@/group/group-maker.service';
import { DungeonName } from '@/dungeon/dungeon-name.literal';
import {
  GroupProducer,
  GroupProducedToken,
} from '@/group/interface/group-producer.interface';

@Injectable()
export class CoordinatorService {
  private readonly logger = new Logger(CoordinatorService.name);

  constructor(
    private readonly groupMakerService: GroupMakerService,
    @Inject(GroupProducedToken)
    private readonly partyProducer: GroupProducer
  ) {}

  @Cron('* * * * *')
  public async run() {
    const dungeons: DungeonName[] = ['WailingCaverns'];

    for (const dungeon of dungeons) {
      this.logger.debug(`Running group maker for ${dungeon}`);

      const group = await this.groupMakerService.groupFor(dungeon);
      if (group) {
        const result = await this.groupMakerService.group([
          group.tank,
          group.healer,
          ...group.damage,
        ]);

        if (result) {
          await this.partyProducer.send(group);

          this.logger.debug(
            `Group created for ${dungeon}: ${JSON.stringify(result)}`
          );
        } else {
          this.logger.debug(`Failed to create group for ${dungeon}`);
        }
      } else {
        this.logger.debug(`No group found for ${dungeon}`);
      }
    }
  }
}
