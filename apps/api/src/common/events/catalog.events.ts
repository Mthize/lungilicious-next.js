export class ProductPriceChangedEvent {
  constructor(
    public readonly productId: string,
    public readonly variantId: string,
    public readonly oldPrice: number,
    public readonly newPrice: number,
  ) {}
}
