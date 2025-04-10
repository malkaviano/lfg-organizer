import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MongoQueuedPlayersRepository {
  constructor(private readonly configService: ConfigService) {}
}
