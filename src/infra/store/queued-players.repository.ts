import { Injectable } from '@nestjs/common';

import { QueuedPlayersRepository } from '@/group/interface/queued-players-repository.interface';
import { DungeonGroup } from '@/dungeon/dungeon-group.type';
import { DungeonName } from '@/dungeon/dungeon-name.literal';
import { PlayerRole } from '@/dungeon/player-role.literal';
import { PlayerGroupMessage } from '@/group/dto/player-group.message';
import { QueuedPlayerEntity } from '@/group/entity/queued-player.entity';
import { PlayerLevel } from '@/dungeon/player-level.literal';
import { PrismaService } from '@/infra/store/prisma.service';
import { DateTimeHelper } from '@/helper/datetime.helper';

@Injectable()
export class SQLQueuedPlayersRepository implements QueuedPlayersRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly dateTimeHelper: DateTimeHelper
  ) {}

  async add(players: QueuedPlayerEntity[]): Promise<number> {
    try {
      for (const player of players) {
        await this.remove([player.id], player.queuedAt);
      }

      const inserted = await this.prismaService.queuedPlayer.createMany({
        data: players.map((player) => ({
          id: player.id,
          level: player.level,
          roles: player.roles,
          dungeons: player.dungeons,
          queuedAt: player.queuedAt,
          playingWith: player.playingWith,
          status: 'WAITING',
        })),
      });

      return inserted.count;
    } catch (error) {
      throw new Error('Player already queued');
    }
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

  async return(playerIds: string[], processedAt: string): Promise<number> {
    const updated = await this.prismaService.queuedPlayer.updateMany({
      where: {
        id: { in: playerIds },
        queuedAt: { lte: processedAt },
      },
      data: {
        status: 'WAITING',
        queuedAt: processedAt,
      },
    });

    return updated.count;
  }

  async remove(playerIds: string[], processedAt: string): Promise<number> {
    const deleted = await this.prismaService.queuedPlayer.deleteMany({
      where: {
        id: { in: playerIds },
        queuedAt: { lte: processedAt },
      },
    });

    if (deleted.count) {
      const notDeleted = await this.prismaService.queuedPlayer.findMany({
        where: {
          id: { in: playerIds },
        },
      });

      const filteredPlayerIds = playerIds.filter(
        (id) => !notDeleted.some((p) => p.id === id)
      );

      const playWith = await this.prismaService.queuedPlayer.findMany({
        where: {
          playingWith: { hasSome: filteredPlayerIds },
        },
      });

      for (const player of playWith) {
        const newPlayingWith = player.playingWith.filter(
          (id) => !filteredPlayerIds.includes(id)
        );

        await this.prismaService.queuedPlayer.update({
          where: { id: player.id },
          data: { playingWith: newPlayingWith },
        });
      }
    }

    return deleted.count;
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
        status: 'WAITING',
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
    try {
      await this.prismaService.$transaction(async (tx) => {
        const inserted = await tx.playerGroup.create({
          data: {
            tankId: group.tank,
            healerId: group.healer,
            damage1Id: group.damage[0],
            damage2Id: group.damage[1],
            damage3Id: group.damage[2],
            dungeon: dungeonName,
          },
        });

        const updated = await tx.queuedPlayer.updateMany({
          where: {
            id: { in: [group.tank, group.healer, ...group.damage] },
            status: 'WAITING',
          },
          data: {
            status: 'GROUPED',
            groupId: inserted.id,
          },
        });

        if (updated.count !== 5) {
          throw new Error('Cannot create group');
        }
      });

      return true;
    } catch (error) {
      return false;
    }
  }

  async groupsToSend(): Promise<PlayerGroupMessage[]> {
    const groups = await this.prismaService.playerGroup.findMany({
      where: {
        sentAt: null,
      },
    });

    return groups.map((group) => {
      return new PlayerGroupMessage(
        group.id,
        group.dungeon,
        group.tankId,
        group.healerId,
        [group.damage1Id, group.damage2Id, group.damage3Id]
      );
    });
  }

  async groupsSent(groupIds: string[]): Promise<void> {
    const timestamp = this.dateTimeHelper.timestamp();

    await this.prismaService.playerGroup.updateMany({
      where: {
        id: { in: groupIds },
      },
      data: {
        sentAt: timestamp,
      },
    });
  }
}
