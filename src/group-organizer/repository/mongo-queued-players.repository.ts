import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

import { QueuedPlayerEntity } from '@/group/entity/queued-player.entity';
import { QueuedPlayerModel } from '@/group/model/queued-player.model';
import { PlayerStatus } from '@/group/player-status.literal';
import { DungeonName } from '@/dungeon/dungeon-name.literal';
import { PlayerRole } from '@/dungeon/player-role.literal';

@Injectable()
export class MongoQueuedPlayersRepository {
  constructor(
    @InjectModel(QueuedPlayerModel.name)
    private readonly queuedPlayers: Model<QueuedPlayerModel>
  ) {}

  public async queue(players: QueuedPlayerEntity[]): Promise<number> {
    const results = players.map((player) => {
      const playerModel = new QueuedPlayerModel({
        ...player,
        status: 'WAITING',
      });

      return { playerId: player.id, playerModel };
    });

    const found = await this.get(results.map((r) => r.playerId));

    if (found.length) {
      throw new Error('Player already queued');
    }

    const result = await this.queuedPlayers.insertMany(
      results.map((r) => r.playerModel)
    );

    return result.length;
  }

  public async get(playerIds: string[]): Promise<QueuedPlayerEntity[]> {
    const result = await this.queuedPlayers.find({ id: playerIds });

    return result.map((model) => {
      return new QueuedPlayerEntity(
        model.id,
        model.level,
        model.roles,
        model.dungeons,
        model.queuedAt,
        model.playingWith
      );
    });
  }

  public async changeStatus(
    playerIds: string[],
    newStatus: PlayerStatus
  ): Promise<number> {
    const result = await this.queuedPlayers.updateMany(
      { id: playerIds },
      { status: newStatus }
    );

    return result.modifiedCount ?? 0;
  }

  public async remove(playerIds: string[]): Promise<number> {
    const result = await this.queuedPlayers.deleteMany({ id: playerIds });

    return result.deletedCount ?? 0;
  }

  public async nextInQueue(
    dungeonName: DungeonName,
    playerRole: PlayerRole,
    ignoreIds: string[] = []
  ): Promise<QueuedPlayerEntity | null> {
    const result = await this.queuedPlayers.findOne(
      {
        roles: playerRole,
        status: 'WAITING',
        dungeons: [dungeonName],
        id: { $nin: ignoreIds },
      },
      null,
      { sort: { queuedAt: -1 } }
    );

    if (result) {
      return new QueuedPlayerEntity(
        result.id,
        result.level,
        result.roles,
        result.dungeons,
        result.queuedAt,
        result.playingWith
      );
    }

    return null;
  }

  public async clear(): Promise<void> {
    await this.queuedPlayers.deleteMany();
  }
}
