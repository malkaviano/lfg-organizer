import { DungeonGroup } from '@/dungeon/dungeon-group.type';
import { GroupProducer } from '@/group/interface/group-producer.interface';
import { Injectable } from '@nestjs/common';

export class GroupFormedProducer implements GroupProducer {
  private readonly formedGroups: DungeonGroup[];

  constructor() {
    this.formedGroups = [];
  }

  public async send(group: DungeonGroup): Promise<void> {
    this.formedGroups.push(group);
  }

  public async groups(): Promise<DungeonGroup[]> {
    return Promise.resolve(this.formedGroups);
  }
}
