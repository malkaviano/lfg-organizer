import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';

import { GroupOrganizerService } from '@/group/group-organizer.service';
import { PartyQueueRequest } from '@/group/dto/party-queue.request';
import { PartyDequeueRequest } from '@/group/dto/party-dequeue.request';

@Controller('group')
export class GroupOrganizerController {
  constructor(private readonly groupOrganizerService: GroupOrganizerService) {}

  @Post('queue')
  public async queueParty(@Body() request: PartyQueueRequest): Promise<void> {
    const { result, errorMsg = 'unknow error' } =
      await this.groupOrganizerService.queueParty(request);

    if (!result) {
      throw new HttpException(errorMsg, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('remove')
  @HttpCode(200)
  public async dequeueParty(
    @Body() request: PartyDequeueRequest
  ): Promise<void> {
    const { result, errorMsg = 'unknow error' } =
      await this.groupOrganizerService.dequeueParty(request);

    if (!result) {
      throw new HttpException(errorMsg, 400);
    }
  }
}
