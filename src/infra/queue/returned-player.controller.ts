import { Controller, Inject } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';

import {
  QueuedPlayersRepository,
  QueuedPlayersRepositoryToken,
} from '@/group/interface/queued-players-repository.interface';

@Controller()
export class ReturnedPlayerController {
  constructor(
    @Inject(QueuedPlayersRepositoryToken)
    private readonly queuePlayersRepository: QueuedPlayersRepository
  ) {}

  @EventPattern('returned-player')
  async handleMessage(@Payload() data: unknown, @Ctx() context: RmqContext) {
    const ids = (data as { ids: string[] }).ids;

    await this.queuePlayersRepository.return(ids);

    const channel = context.getChannelRef();

    const originalMsg = context.getMessage();

    channel.ack(originalMsg);
  }
}
