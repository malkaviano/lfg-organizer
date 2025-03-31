import { Injectable } from '@nestjs/common';

import { AddPlayersQueueRequest } from '@/group/dtos/add-players.request';

@Injectable()
export class GroupOrganizerService {
  async queuePlayers(request: AddPlayersQueueRequest): Promise<void> {
    throw 'not implemented';
  }
}
