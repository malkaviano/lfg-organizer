import { ConfigType } from '@nestjs/config';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { GroupMakerService } from '@/group/group-maker/group-maker.service';
import { DungeonName, dungeons } from '@/dungeon/dungeon-name.literal';
import dungeonConfig from '@/config/dungeon.config';

@Injectable()
export class CoordinatorService {
  private readonly logger = new Logger(CoordinatorService.name);

  constructor(
    private readonly groupMakerService: GroupMakerService,
    @Inject(dungeonConfig.KEY)
    private readonly dungeonConf: ConfigType<typeof dungeonConfig>
  ) {}

  @Cron('*/15 * * * * *	')
  public async coordinate() {
    const dungeonNames = this.dungeonConf.dungeonNames?.split(
      '|'
    ) as DungeonName[];

    if (!dungeons.every((d) => dungeonNames.includes(d))) {
      throw new Error('Invalid dungeon name');
    }

    const promises = dungeonNames.map((dungeonName) => this.run(dungeonName));

    await Promise.all(promises);
  }

  public async run(dungeonName: DungeonName) {
    this.logger.debug(`Running group maker for ${dungeonName}`);

    const group = await this.groupMakerService.groupFor(dungeonName);

    if (group) {
      const result = await this.groupMakerService.createGroup(
        group,
        dungeonName
      );

      if (result) {
        this.logger.debug(
          `Group created for ${dungeonName}: ${JSON.stringify(result)}`
        );
      } else {
        this.logger.debug(`Failed to create group for ${dungeonName}`);
      }
    } else {
      this.logger.debug(`No group found for ${dungeonName}`);
    }
  }
}
