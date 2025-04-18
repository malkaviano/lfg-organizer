export const GroupProducedToken = Symbol('GroupProduced');

export interface GroupProducer {
  publish(): Promise<void>;
}
