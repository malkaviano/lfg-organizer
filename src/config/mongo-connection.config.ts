import { registerAs } from '@nestjs/config';

export const mongoConnection = registerAs('mongoConnection', () => ({
  uri: `mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}`,
  user: process.env.MONGO_USER,
  pass: process.env.MONGO_PASSWORD,
  dbName: process.env.MONGO_DATABASE,
}));
