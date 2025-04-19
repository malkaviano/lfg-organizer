export const GroupProducedToken = Symbol('GroupProduced');

export const QueueClientToken = Symbol('QueueClient');

export interface GroupProducer {
  publish(): Promise<void>;
}
