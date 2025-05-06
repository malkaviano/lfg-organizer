export interface GroupProducer {
  publish(): Promise<void>;
}
