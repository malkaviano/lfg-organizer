import { registerAs } from '@nestjs/config';

export const mongoConnection = registerAs('mongoConnection', () => ({
  uri: `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}`,
  user: process.env.MONGO_USER,
  pass: process.env.MONGO_PASSWORD,
  dbName: process.env.MONGO_DATABASE,
}));

export const mongoTestConnection = registerAs('mongoTestConnection', () => ({
  uri: `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}`,
  user: process.env.MONGO_USER_TEST,
  pass: process.env.MONGO_PASSWORD_TEST,
  dbName: process.env.MONGO_DATABASE_TEST,
}));
