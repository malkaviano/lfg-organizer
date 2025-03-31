import { Body, Controller, HttpCode, Post } from '@nestjs/common';

import { GroupOrganizerService } from '@/group/group-organizer.service';
import { AddPlayersQueueRequest } from '@/group/dtos/add-players.request';
import { RemovePlayersRequest } from '@/group/dtos/remove-players.request';

@Controller('group')
export class GroupOrganizerController {
  constructor(private readonly groupOrganizerService: GroupOrganizerService) {}

  @Post('queue')
  public async QueuePlayers(
    @Body() request: AddPlayersQueueRequest
  ): Promise<unknown> {
    throw 'not implemented';
  }

  @Post('remove')
  @HttpCode(200)
  public async RemovePlayers(
    @Body() request: RemovePlayersRequest
  ): Promise<unknown> {
    throw 'not implemented';
  }
}
