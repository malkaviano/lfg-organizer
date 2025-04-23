import { registerAs } from '@nestjs/config';

export default registerAs('dungeonConfig', () => ({
  dungeonName: process.env.DUNGEON_NAME,
}));
