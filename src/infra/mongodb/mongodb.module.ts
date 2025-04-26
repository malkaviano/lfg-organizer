import { DynamicModule, Module } from '@nestjs/common';

import {
  MongoDbDriverModuleOptions,
  MongoDbDriverModuleAsyncOptions,
} from '@/infra/mongodb/mongodb.options';
import { CoreModule } from '@/infra/mongodb/core.module';
import { HelperModule } from '@/helper/helper.module';
import { MongoQueuedPlayersRepository } from '@/infra/mongodb/queued-players.repository';
import { QueuedPlayersRepositoryToken } from '@/group/interface/queued-players-repository.interface';

@Module({
  imports: [HelperModule],
  providers: [
    MongoQueuedPlayersRepository,
    {
      provide: QueuedPlayersRepositoryToken,
      useClass: MongoQueuedPlayersRepository,
    },
  ],
  exports: [
    {
      provide: QueuedPlayersRepositoryToken,
      useClass: MongoQueuedPlayersRepository,
    },
  ],
})
export class MongodbModule {
  public static forRoot(options: MongoDbDriverModuleOptions): DynamicModule {
    return {
      module: MongodbModule,
      imports: [CoreModule.forRoot(options)],
    };
  }

  public static forRootAsync(
    options: MongoDbDriverModuleAsyncOptions
  ): DynamicModule {
    return {
      module: MongodbModule,
      imports: [CoreModule.forRootAsync(options)],
    };
  }
}
