import { registerAs } from '@nestjs/config';

export default registerAs('mongodbCollections', () => ({
  playerGroups: 'playergroups',
  queuedPlayers: 'queuedplayers',
}));
