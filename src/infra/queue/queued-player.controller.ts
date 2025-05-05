import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';

import { GroupQueueingService } from '@/group/group-maker/group-queueing.service';
import { PlayersQueueMessage } from '@/group/dto/players-queue.message';
import { PlayersUnGroupMessage } from '@/group/dto/players-ungroup.message';
import { PlayersDequeueMessage } from '@/group/dto/players-dequeue.message';

@Controller()
export class QueuedPlayerController {
  constructor(private readonly groupQueueingService: GroupQueueingService) {}

  @EventPattern('players-queued')
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

  @EventPattern('players-dequeued')
  async handleRemovePlayer(
    @Payload() data: unknown,
    @Ctx() context: RmqContext
  ) {
    const message = data as PlayersDequeueMessage;

    await this.groupQueueingService.dequeue(message);

    const channel = context.getChannelRef();

    const originalMsg = context.getMessage();

    channel.ack(originalMsg);
  }

  @EventPattern('ungroup-player')
  async handleReturnPlayer(
    @Payload() data: unknown,
    @Ctx() context: RmqContext
  ) {
    const message = data as PlayersUnGroupMessage;

    await this.groupQueueingService.unGroup(message);

    const channel = context.getChannelRef();

    const originalMsg = context.getMessage();

    channel.ack(originalMsg);
  }
}
