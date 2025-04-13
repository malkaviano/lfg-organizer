import { registerAs } from '@nestjs/config';

export const mongodbConnection = registerAs('mongodbConnection', () => ({
  url: `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}`,
  dbName: process.env.MONGO_DATABASE,
}));

export const mongodbTestConnection = registerAs('mongoTestConnection', () => ({
  url: `mongodb://${process.env.MONGO_USER_TEST}:${process.env.MONGO_PASSWORD_TEST}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}`,
  dbName: process.env.MONGO_DATABASE_TEST,
}));
