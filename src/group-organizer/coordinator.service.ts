import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { GroupMakerService } from '@/group/group-maker/group-maker.service';
import { DungeonName } from '@/dungeon/dungeon-name.literal';
import { DungeonGroup } from '@/dungeon/dungeon-group.type';

@Injectable()
export class CoordinatorService {
  private readonly logger = new Logger(CoordinatorService.name);

  constructor(private readonly groupMakerService: GroupMakerService) {}

  @Cron('* * * * *')
  public async coordinate() {
    const dungeons: DungeonName[] = ['WailingCaverns', 'Deadmines'];

    for (const dungeonName of dungeons) {
      await this.run(dungeonName);
    }
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

  public async grouped(): Promise<DungeonGroup> {
    throw new Error('not implemented');
  }
}
