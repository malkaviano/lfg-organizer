import { registerAs } from '@nestjs/config';

export default registerAs('dungeonConfig', () => ({
  dungeonNames: process.env.DUNGEON_NAMES,
}));
