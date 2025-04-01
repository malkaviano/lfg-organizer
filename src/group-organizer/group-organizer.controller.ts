import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';

import { GroupOrganizerService } from '@/group/group-organizer.service';
import { AddPlayersQueueRequest } from '@/group/dto/add-players.request';
import { RemovePlayersRequest } from '@/group/dto/remove-players.request';

@Controller('group')
export class GroupOrganizerController {
  constructor(private readonly groupOrganizerService: GroupOrganizerService) {}

  @Post('queue')
  public async queuePlayers(
    @Body() request: AddPlayersQueueRequest
  ): Promise<void> {
    try {
      await this.groupOrganizerService.queuePlayers(request);
    } catch (error) {
      throw new HttpException((error as any).message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('remove')
  @HttpCode(200)
  public async removePlayers(
    @Body() request: RemovePlayersRequest
  ): Promise<unknown> {
    throw 'not implemented';
  }
}
