# Schema Diff

- Campaign statuses now preserve `draft`, `scheduled`, `active`, `pricing-pending`, `closed`, and `unavailable`.
- Product rows preserve price approval, SKU/vendor reference, fulfillment type, and conditional inventory mode.
- Orders snapshot campaign, pickup, attribution, accounting, payment, and operational states.
- Order items snapshot product/campaign names, price, fulfillment promise/type, pickup instructions, options, and Scout-credit eligibility.
- Added `payment_attempts`, `refunds`, `attribution_adjustments`, `email_events`, and atomic `stripe_events` processing state.
- Removed default inventory reservations for preorder/unlimited fundraiser products.
- No historical order is reconstructed from mutable catalog rows.

Accounting fields: `subtotal_amount`, `tax_amount`, `customer_fee_amount`, `gross_amount`, `stripe_fee_amount`, `refund_amount`, `net_amount`, and `scout_credit_amount`.

