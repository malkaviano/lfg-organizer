import { ModuleMetadata, Type } from '@nestjs/common';

export interface MongoDbDriverModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  name?: string;
  inject?: any[];
  useClass?: Type<MongoDbDriverOptionsFactory>;
  useExisting?: Type<MongoDbDriverOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<MongoDbDriverModuleOptions> | MongoDbDriverModuleOptions;
}

export interface MongoDbDriverOptionsFactory {
  createMongoDbOptions(
    connectionName?: string
  ): Promise<MongoDbDriverModuleOptions> | MongoDbDriverModuleOptions;
}

export interface MongoDbDriverModuleOptions {
  name?: string;
  url: string;
  clientOptions?: any;
  dbName?: string;
  retryAttempts?: number;
  retryDelay?: number;
}
