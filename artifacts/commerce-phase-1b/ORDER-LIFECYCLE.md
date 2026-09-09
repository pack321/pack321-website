# Order Lifecycle

1. Browser sends product IDs, quantities, selected options, explicit attribution, contact, and required pickup selection.
2. Worker validates canonical D1 campaign/product/option/Scout/pickup state and calculates subtotal + $3 fee + $0 tax.
3. A deterministic checkout fingerprint and unique D1 constraints atomically create or reuse the pending order and immutable item snapshots.
4. A payment attempt is created, then a Stripe test Checkout Session uses server-generated line items and the public order number.
5. Only a signed, atomically claimed webhook establishes payment truth.
6. Conflicting late payment moves a cancelled/refunded order to `payment-reconciliation-required`.
7. Paid/refund/fulfillment events create idempotent operational-email payloads; no provider is connected yet.
8. Lookup returns customer-safe snapshots by public order number + normalized email.

Retry rules: duplicate checkout reuses one order/session; duplicate webhook is a no-op; failed event processing can be reclaimed; abandoned open Sessions are explicitly expired before local cancellation.

