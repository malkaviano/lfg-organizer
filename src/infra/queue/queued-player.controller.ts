import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';

import { PlayersQueueingService } from '@/group/group-maker/players-queueing.service';
import { PlayersQueueMessage } from '@/group/dto/players-queue.message';
import { PlayersUnGroupMessage } from '@/group/dto/players-ungroup.message';
import { PlayersDequeueMessage } from '@/group/dto/players-dequeue.message';

@Controller()
export class QueuedPlayerController {
  constructor(private readonly groupQueueingService: PlayersQueueingService) {}

  @EventPattern('players-queued')
  async handleQueuedPlayer(
    @Payload() data: object,
    @Ctx() context: RmqContext
  ) {
    if (this.isPlayersQueueMessage(data)) {
      await this.groupQueueingService.queue(data);
    }

    const channel = context.getChannelRef();

    const originalMsg = context.getMessage();

    channel.ack(originalMsg);
  }

  @EventPattern('players-dequeued')
  async handleDequeuePlayer(
    @Payload() data: object,
    @Ctx() context: RmqContext
  ) {
    if (this.isPlayersDequeueMessage(data)) {
      await this.groupQueueingService.dequeue(data);
    }

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

  private isPlayersQueueMessage(
    message: object
  ): message is PlayersQueueMessage {
    return (
      'players' in message && 'dungeons' in message && 'queuedAt' in message
    );
  }

  private isPlayersDequeueMessage(
    message: object
  ): message is PlayersDequeueMessage {
    return 'playerIds' in message && 'processedAt' in message;
  }
}
