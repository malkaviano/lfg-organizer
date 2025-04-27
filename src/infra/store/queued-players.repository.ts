import { Injectable } from '@nestjs/common';

import { QueuedPlayersRepository } from '@/group/interface/queued-players-repository.interface';
import { DungeonGroup } from '@/dungeon/dungeon-group.type';
import { DungeonName } from '@/dungeon/dungeon-name.literal';
import { PlayerRole } from '@/dungeon/player-role.literal';
import { PlayerGroupMessage } from '@/group/dto/player-group.message';
import { QueuedPlayerEntity } from '@/group/entity/queued-player.entity';
import { PlayerStatus } from '@/group/player-status.literal';
import { PlayerLevel } from '@/dungeon/player-level.literal';
import { PrismaService } from '@/infra/store/prisma.service';

@Injectable()
export class SQLQueuedPlayersRepository implements QueuedPlayersRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async queue(players: QueuedPlayerEntity[]): Promise<number> {
    throw new Error('Method not implemented.');
  }

  async get(playerIds: string[]): Promise<QueuedPlayerEntity[]> {
    const result = await this.prismaService.queuedPlayer.findMany({
      where: {
        id: { in: playerIds },
      },
    });

    return result.map((player) => {
      return new QueuedPlayerEntity(
        player.id,
        player.level as PlayerLevel,
        player.roles as PlayerRole[],
        player.dungeons as DungeonName[],
        player.queuedAt,
        player.playingWith
      );
    });
  }

  async return(playerIds: string[], newStatus: PlayerStatus): Promise<number> {
    throw new Error('Method not implemented.');
  }

  async remove(playerIds: string[]): Promise<number> {
    throw new Error('Method not implemented.');
  }

  async nextInQueue(
    dungeonName: DungeonName,
    playerRole: PlayerRole,
    ignoreIds: string[]
  ): Promise<QueuedPlayerEntity | null> {
    const result = await this.prismaService.queuedPlayer.findFirst({
      where: {
        dungeons: { has: dungeonName },
        roles: { has: playerRole },
        id: { notIn: ignoreIds },
      },
      orderBy: {
        queuedAt: 'asc',
      },
    });

    if (result) {
      return new QueuedPlayerEntity(
        result.id,
        result.level as PlayerLevel,
        result.roles as PlayerRole[],
        result.dungeons as DungeonName[],
        result.queuedAt,
        result.playingWith
      );
    }

    return null;
  }

  async createGroup(
    group: DungeonGroup,
    dungeonName: DungeonName
  ): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  async unSentGroups(): Promise<PlayerGroupMessage[]> {
    throw new Error('Method not implemented.');
  }

  async confirmGroupsSent(groupIds: string[]): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
