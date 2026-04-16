export class ProfileUpdatedEvent {
  constructor(
    public readonly userId: string,
    public readonly customerId: string,
  ) {}
}

export class AddressAddedEvent {
  constructor(
    public readonly userId: string,
    public readonly addressId: string,
  ) {}
}
