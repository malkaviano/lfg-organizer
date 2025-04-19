export class PlayerGroupMessage {
  constructor(
    public readonly groupId: string,
    public readonly tank: string,
    public readonly healer: string,
    public readonly damage: string[]
  ) {}
}
