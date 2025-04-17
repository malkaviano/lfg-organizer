import { DynamicModule, Module } from '@nestjs/common';

import {
  MongoDbDriverModuleOptions,
  MongoDbDriverModuleAsyncOptions,
} from '@/infra/mongodb/mongodb.options';
import { CoreModule } from '@/infra/mongodb/core.module';

@Module({})
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
