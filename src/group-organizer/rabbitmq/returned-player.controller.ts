import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';

import { GroupMakerService } from '@/group/group-maker/group-maker.service';

@Controller()
export class ReturnedPlayerController {
  constructor(private readonly groupMakerService: GroupMakerService) {}

  @EventPattern('returned-player')
  async handleMessage(@Payload() data: unknown, @Ctx() context: RmqContext) {
    console.log(data);

    const ids = (data as { ids: string[] }).ids;

    await this.groupMakerService.reset(ids);

    const channel = context.getChannelRef();

    const originalMsg = context.getMessage();

    channel.ack(originalMsg);
  }
}
