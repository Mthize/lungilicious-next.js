# Payment Provider Abstraction

This document outlines the provider-agnostic abstraction layer for Lungilicious payments. The architecture ensures the core business logic remains decoupled from specific payment gateway implementations, starting with Peach Payments as the primary provider.

## PaymentProvider Interface

All payment providers must implement the following interface to ensure consistency across the system.

```typescript
interface PaymentProvider {
  /**
   * Creates a hosted checkout session with the provider.
   * PCI scope is reduced by redirecting users to the provider's secure page.
   */
  createCheckoutSession(input: CreateSessionInput): Promise<CheckoutSession>;

  /**
   * Verifies the authenticity of a webhook request using signature validation.
   */
  verifyWebhook(rawBody: string, headers: Record<string, string>): Promise<WebhookVerificationResult>;

  /**
   * Polls the provider for the current status of a specific transaction.
   */
  getTransactionStatus(providerTransactionId: string): Promise<PaymentProviderResult>;

  /**
   * Issues a full or partial refund for a successful transaction.
   */
  refund(input: RefundInput): Promise<RefundResult>;

  /**
   * Maps provider-specific status strings to internal Lungilicious PaymentStatus enums.
   */
  mapStatus(providerStatus: string): PaymentStatus;
}

interface CreateSessionInput {
  orderId: string;
  amount: number; // In cents
  currency: 'ZAR';
  customerId: string;
  customerEmail: string;
  description: string;
  callbackUrl: string;
  webhookUrl: string;
  metadata: Record<string, any>;
}

interface CheckoutSession {
  id: string;
  redirectUrl: string;
  expiresAt: Date;
}

interface WebhookVerificationResult {
  isValid: boolean;
  provider: string;
  eventId: string;
  eventType: string;
  payload: any;
}

interface PaymentProviderResult {
  success: boolean;
  providerTransactionId: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  resultCode: string;
  metadata: Record<string, any>;
}

interface RefundInput {
  providerTransactionId: string;
  refundAmount: number; // In cents
  reason: string;
  idempotencyKey: string;
}

interface RefundResult {
  success: boolean;
  providerRefundId: string;
  status: string;
  amount: number;
}
```

## PaymentProviderRegistry Pattern

The registry manages the lifecycle and resolution of payment providers.

- **Registry Storage**: Holds a `Map<ProviderName, PaymentProvider>`.
- **Resolution**:
  - `resolve(name)`: Returns a specific provider by its unique name.
  - `resolveByMethod(method)`: Returns a provider that supports a specific payment method (e.g., Card, EFT).
- **Initialization**: A factory creates and configures providers during module initialization using environment variables.

## Peach Payments v1 Specifics

Peach Payments is the initial provider for the South African market.

- **Authentication**: Uses a Bearer token and an Entity ID in the request headers.
- **Hosted Checkout**:
  - **Test**: `https://testsecure.peachpayments.com/checkout`
  - **Live**: `https://secure.peachpayments.com/checkout`
- **Webhook Security**:
  - Signature: HMAC-SHA256 using the entity secret.
  - Header: The signature is passed in the `X-Webhook-Signature` header.
- **Supported Webhook Events**:
  - `checkout.completed`
  - `checkout.expired`
  - `refund.completed`
  - `refund.failed`
- **Base URLs**:
  - **Sandbox**: `https://testsecure.peachpayments.com`
  - **Production**: `https://secure.peachpayments.com`

## Idempotency Strategy

To prevent duplicate processing of mutation operations (like refunds or webhook handling), we use an idempotency strategy.

1. All mutation operations accept an `idempotencyKey`.
2. Keys are stored in the `idempotency_keys` table.
3. Before processing any request, the system checks if the key exists.
4. If the key exists, the previous result is returned without re-executing the logic.

## Webhook Processing Flow

Webhooks are processed asynchronously to ensure high availability and reliability.

1. **Receive**: Webhook POST arrives at `/payments/webhooks/:provider`.
2. **Read**: Capture the raw request body for accurate signature verification.
3. **Verify**: Validate the HMAC-SHA256 signature against the provider's secret.
4. **Idempotency Check**: Verify if the `providerEventId` has already been processed.
5. **Persist**: Save the event to the `webhook_events` table with a `PENDING` status.
6. **Enqueue**: Add a job to the BullMQ `webhook_queue` for async processing.
7. **Acknowledge**: Return an HTTP 200 status to the provider immediately.
8. **Process**: A background worker picks up the job and dispatches it to the correct handler.
9. **Update**: The handler updates the internal payment and order states.
10. **Finalize**: Mark the webhook event as `PROCESSED` in the database.

## Data Retention and PCI Compliance

To maintain SAQ-A compliance and reduce PCI scope, we strictly control what data is stored.

### Stored Data
- Provider name and transaction reference.
- Customer reference and payment method tokens.
- Card brand (Visa/Mastercard), last 4 digits, and expiry month/year.
- Internal payment status.

### Never Stored
- Full PAN (Primary Account Number/Card Number).
- CVV/CVC security codes.
- Full card expiry dates (only month/year for display).
- Cardholder name (unless required for non-PCI reasons).
