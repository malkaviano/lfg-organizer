import {
  Global,
  Module,
  DynamicModule,
  Provider,
  Type,
  Logger,
} from '@nestjs/common';

import { Db, MongoClient } from 'mongodb';
import { defer, delay, lastValueFrom, Observable, retryWhen, scan } from 'rxjs';

import {
  MongoDbDriverModuleOptions,
  MongoDbDriverModuleAsyncOptions,
  MongoDbDriverOptionsFactory,
} from '@/infra/mongodb/mongodb.options';
import {
  MONGODB_CONNECTION_NAME,
  MONGODB_DEFAULT_CONNECTION_NAME,
  MONGODB_DRIVER_MODULE_OPTIONS,
  MONGODB_DRIVER_OBJECT,
} from '@/group/repository/tokens';

@Global()
@Module({})
export class CoreModule {
  private static readonly logger = new Logger('MongoDbCoreModule');

  private static mongoClient?: MongoClient;

  public static forRoot(options: MongoDbDriverModuleOptions): DynamicModule {
    const moduleOptions = {
      provide: MONGODB_DRIVER_MODULE_OPTIONS,
      useValue: options,
    };

    const connectionProvider: Provider = {
      provide: MONGODB_DRIVER_OBJECT,
      useFactory: async () => {
        const obj = await this.createConnectionFactory(options);

        CoreModule.mongoClient = obj.client;

        return obj;
      },
    };

    return {
      module: CoreModule,
      providers: [
        connectionProvider,
        moduleOptions,
        {
          provide: MONGODB_CONNECTION_NAME,
          useValue: MONGODB_DEFAULT_CONNECTION_NAME,
        },
      ],
      exports: [connectionProvider],
    };
  }

  public static forRootAsync(
    options: MongoDbDriverModuleAsyncOptions
  ): DynamicModule {
    const connectionProvider: Provider = {
      provide: MONGODB_DRIVER_OBJECT,
      useFactory: async (options: MongoDbDriverModuleOptions) => {
        const obj = await this.createConnectionFactory(options);

        CoreModule.mongoClient = obj.client;

        return obj;
      },
      inject: [MONGODB_DRIVER_MODULE_OPTIONS],
    };

    return {
      module: CoreModule,
      imports: options.imports,
      providers: [
        ...this.createAsyncProviders(options),
        connectionProvider,
        {
          provide: MONGODB_CONNECTION_NAME,
          useValue: MONGODB_DEFAULT_CONNECTION_NAME,
        },
      ],
      exports: [connectionProvider],
    };
  }

  public static createAsyncProviders(
    options: MongoDbDriverModuleAsyncOptions
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }

    const useClass = options.useClass as Type<MongoDbDriverOptionsFactory>;
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ];
  }

  public static createAsyncOptionsProvider(
    options: MongoDbDriverModuleAsyncOptions
  ): Provider {
    if (options.useFactory) {
      return {
        provide: MONGODB_DRIVER_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    // `as Type<MongoDbDriverOptionsFactory>` is a workaround for microsoft/TypeScript#31603
    const inject = [
      (options.useClass ||
        options.useExisting) as Type<MongoDbDriverOptionsFactory>,
    ];

    return {
      provide: MONGODB_DRIVER_MODULE_OPTIONS,
      useFactory: async (
        optionsFactory: MongoDbDriverOptionsFactory
      ): Promise<MongoDbDriverModuleOptions> => {
        return await optionsFactory.createMongoDbOptions();
      },
      inject,
    };
  }

  async onApplicationShutdown(): Promise<void> {
    await CoreModule.mongoClient?.close();
  }

  private static async createConnectionFactory(
    options: MongoDbDriverModuleOptions
  ): Promise<{ client: MongoClient; db: Db }> {
    return lastValueFrom(
      defer(async () => {
        const client = new MongoClient(options.url, options.clientOptions);

        await client.connect();

        const db = client.db(options.dbName);

        return { client, db };
      }).pipe(
        handleRetry(options.retryAttempts, options.retryDelay, this.logger)
      )
    );
  }
}

export function handleRetry(
  retryAttempts = 9,
  retryDelay = 3000,
  logger: Logger
): <T>(source: Observable<T>) => Observable<T> {
  return <T>(source: Observable<T>) =>
    source.pipe(
      retryWhen((e) =>
        e.pipe(
          scan((errorCount, error: Error) => {
            logger.error(
              `Unable to connect to the database. Retrying (${
                errorCount + 1
              })...`,
              error.stack
            );
            if (errorCount + 1 >= retryAttempts) {
              throw error;
            }
            return errorCount + 1;
          }, 0),
          delay(retryDelay)
        )
      )
    );
}
