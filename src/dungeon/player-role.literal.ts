export const playerRoles = ['Tank', 'Healer', 'Damage'] as const;

export type PlayerRole = (typeof playerRoles)[number];
