export interface PlayersDequeueMessage {
  readonly playerIds: string[];
  readonly processedAt: string;
}
