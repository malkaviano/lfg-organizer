import { registerAs } from '@nestjs/config';

export default registerAs('mongodbConnection', () => ({
  url: `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}`,
  dbName: process.env.MONGO_DATABASE,
}));
