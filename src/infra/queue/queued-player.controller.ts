import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';

import { PlayersQueueingService } from '@/group/group-maker/players-queueing.service';
import { PlayersQueuedMessage } from '@/group/dto/players-queued.message';
import { PlayersReturnedMessage } from '@/group/dto/players-returned.message';
import { PlayersDequeuedMessage } from '@/group/dto/players-dequeued.message';

@Controller()
export class QueuedPlayerController {
  constructor(private readonly groupQueueingService: PlayersQueueingService) {}

  @EventPattern('players-queued')
  async handleQueuedPlayer(
    @Payload() data: object,
    @Ctx() context: RmqContext
  ) {
    if (this.isPlayersQueued(data)) {
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
    if (this.isPlayersDequeueOrReturned(data)) {
      await this.groupQueueingService.dequeue(data);
    }

    const channel = context.getChannelRef();

    const originalMsg = context.getMessage();

    channel.ack(originalMsg);
  }

  @EventPattern('players-returned')
  async handleReturnPlayer(
    @Payload() data: object,
    @Ctx() context: RmqContext
  ) {
    if (this.isPlayersDequeueOrReturned(data)) {
      await this.groupQueueingService.return(data);
    }

    const channel = context.getChannelRef();

    const originalMsg = context.getMessage();

    channel.ack(originalMsg);
  }

  private isPlayersQueued(message: object): message is PlayersQueuedMessage {
    return (
      'players' in message && 'dungeons' in message && 'queuedAt' in message
    );
  }

  private isPlayersDequeueOrReturned(
    message: object
  ): message is PlayersDequeuedMessage | PlayersReturnedMessage {
    return 'playerIds' in message && 'processedAt' in message;
  }
}
