import { Inject, Injectable, Type } from '@nestjs/common';

import { v4 as uuidv4 } from 'uuid';
import { Db, MongoClient, PullOperator } from 'mongodb';

import { QueuedPlayerEntity } from '@/group/entity/queued-player.entity';
import { QueuedPlayerModel } from '@/group/model/queued-player.model';
import { DungeonName } from '@/dungeon/dungeon-name.literal';
import { PlayerRole } from '@/dungeon/player-role.literal';
import { QueuedPlayersRepository } from '@/group/interface/queued-players-repository.interface';
import { MONGODB_DRIVER_OBJECT } from '@/group/repository/tokens';
import { DungeonGroup } from '@/dungeon/dungeon-group.type';

@Injectable()
export class MongoQueuedPlayersRepository implements QueuedPlayersRepository {
  public readonly COLLECTION_NAME = 'queuedplayermodels';

  constructor(
    @Inject(MONGODB_DRIVER_OBJECT)
    private readonly mongoObject: { client: MongoClient; db: Db }
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

    const result = await this.mongoObject.db
      .collection(this.COLLECTION_NAME)
      .insertMany(results.map((r) => r.playerModel));

    return result.insertedCount;
  }

  public async get(playerIds: string[]): Promise<QueuedPlayerEntity[]> {
    const result = this.mongoObject.db
      .collection(this.COLLECTION_NAME)
      .find({ id: { $in: playerIds } });

    return result
      .map((document) => {
        return new QueuedPlayerEntity(
          document.id,
          document.level,
          document.roles,
          document.dungeons,
          document.queuedAt,
          document.playingWith
        );
      })
      .toArray();
  }

  public async return(playerIds: string[]): Promise<number> {
    const result = await this.mongoObject.db
      .collection(this.COLLECTION_NAME)
      .updateMany({ id: { $in: playerIds } }, { $set: { status: 'WAITING' } });

    return result.modifiedCount ?? 0;
  }

  public async remove(playerIds: string[]): Promise<number> {
    const deleted = await this.get(playerIds);

    const deletedIds = deleted.map((d) => d.id);

    const linked = deleted
      .flatMap((p) => p.playingWith)
      .filter((id) => deletedIds.some((d) => d !== id));

    const pull = { playingWith: { $in: deletedIds } } as PullOperator<Document>;

    await this.mongoObject.db.collection(this.COLLECTION_NAME).updateMany(
      { id: { $in: linked } },
      {
        $pull: pull,
      }
    );

    const result = await this.mongoObject.db
      .collection(this.COLLECTION_NAME)
      .deleteMany({ id: { $in: playerIds } });

    return result.deletedCount ?? 0;
  }

  public async nextInQueue(
    dungeonName: DungeonName,
    playerRole: PlayerRole,
    ignoreIds: string[] = []
  ): Promise<QueuedPlayerEntity | null> {
    const result = await this.mongoObject.db
      .collection(this.COLLECTION_NAME)
      .findOne(
        {
          roles: playerRole,
          status: 'WAITING',
          dungeons: [dungeonName],
          id: { $nin: ignoreIds },
        },
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

  public async createGroup(group: DungeonGroup): Promise<boolean> {
    const session = this.mongoObject.client.startSession();

    session.startTransaction();

    const groupId = uuidv4();

    let result = false;

    const playerIds = [...group.damage.map((d) => d), group.tank, group.healer];

    try {
      const updated = await this.mongoObject.db
        .collection(this.COLLECTION_NAME)
        .updateMany(
          { id: { $in: playerIds } },
          { $set: { status: 'GROUPED', groupId } }
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
    await this.mongoObject.db.collection(this.COLLECTION_NAME).deleteMany();
  }
}
