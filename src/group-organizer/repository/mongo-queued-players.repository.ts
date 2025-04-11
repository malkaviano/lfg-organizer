import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';

import { Connection, Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

import { QueuedPlayerEntity } from '@/group/entity/queued-player.entity';
import { QueuedPlayerModel } from '@/group/model/queued-player.model';
import { DungeonName } from '@/dungeon/dungeon-name.literal';
import { PlayerRole } from '@/dungeon/player-role.literal';
import { QueuedPlayersRepository } from '@/group/interface/queued-players-repository.interface';

@Injectable()
export class MongoQueuedPlayersRepository implements QueuedPlayersRepository {
  constructor(
    @InjectModel(QueuedPlayerModel.name)
    private readonly queuedPlayers: Model<QueuedPlayerModel>,
    @InjectConnection() private readonly connection: Connection
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

  public async return(playerIds: string[]): Promise<number> {
    const result = await this.queuedPlayers.updateMany(
      { id: playerIds },
      { status: 'WAITING' }
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

  public async group(playerIds: string[]): Promise<boolean> {
    const session = await this.connection.startSession();

    session.startTransaction();

    const groupId = uuidv4();

    let result = false;

    try {
      const updated = await this.queuedPlayers.updateMany(
        { id: playerIds },
        { status: 'GROUPED', groupId }
      );

      if ((updated.modifiedCount ?? 0) !== playerIds.length) {
        throw 'failed to update all';
      }

      await session.commitTransaction();

      result = true;
    } catch (error) {
      await session.abortTransaction();
    } finally {
      await session.endSession();
    }

    return result;
  }

  public async clear(): Promise<void> {
    await this.queuedPlayers.deleteMany();
  }
}
