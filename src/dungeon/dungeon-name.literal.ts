export const dungeons = [
  'RagefireChasm',
  'WailingCaverns',
  'Deadmines',
] as const;

export type DungeonName = (typeof dungeons)[number];
