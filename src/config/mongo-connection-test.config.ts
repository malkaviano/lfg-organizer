import { registerAs } from '@nestjs/config';

export default registerAs('mongoTestConnection', () => ({
  url: `mongodb://${process.env.MONGO_USER_TEST}:${process.env.MONGO_PASSWORD_TEST}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}`,
  dbName: process.env.MONGO_DATABASE_TEST,
}));
