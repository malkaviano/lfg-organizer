import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';

import { GroupQueueingService } from '@/group/group-maker/group-queueing.service';
import { PlayersQueueMessage } from '@/group/dto/players-queue.message';
import { PlayersReturnMessage } from '@/group/dto/players-return.message';

@Controller()
export class QueuedPlayerController {
  constructor(private readonly groupQueueingService: GroupQueueingService) {}

  @EventPattern('queue-player')
  async handleQueuedPlayer(
    @Payload() data: unknown,
    @Ctx() context: RmqContext
  ) {
    const message = data as PlayersQueueMessage;

    await this.groupQueueingService.queue(message);

    const channel = context.getChannelRef();

    const originalMsg = context.getMessage();

    channel.ack(originalMsg);
  }

  @EventPattern('remove-player')
  async handleRemovePlayer(
    @Payload() data: unknown,
    @Ctx() context: RmqContext
  ) {
    const channel = context.getChannelRef();

    const originalMsg = context.getMessage();

    channel.ack(originalMsg);
  }

  @EventPattern('return-player')
  async handleReturnPlayer(
    @Payload() data: unknown,
    @Ctx() context: RmqContext
  ) {
    const message = data as PlayersReturnMessage;

    await this.groupQueueingService.return(message);

    const channel = context.getChannelRef();

    const originalMsg = context.getMessage();

    channel.ack(originalMsg);
  }
}
