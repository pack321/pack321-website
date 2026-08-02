# Storefront transaction milestone

The current visual baseline is frozen. Phase 1 prepares a narrowly allowlisted checkout request but does not accept payment.

## Server-facing request

The browser may send only `items[{productId, optionIds[{optionId, valueId}], quantity}]`, `campaignId`, `fundraisingCode`, `attributionSource`, `pickupSelection`, and `customerContact{firstName,lastName,email,phone}`. Display prices and totals never enter this request.

The server must reload its own product, option, campaign, pickup, inventory, and public Scout records. It must reject unknown products/options, nonpositive or excessive quantities, mixed fundraising campaigns, inactive campaigns, insufficient inventory, invalid pickup selections, and Scout codes that are inactive, private, expired, disabled, or not enrolled in the campaign. It calculates all money server-side.

## Phase 2 boundaries

1. `POST /api/checkout-sessions`: validate the allowlisted request against trusted records, create a pending order and Stripe Checkout Session, and return only the hosted Checkout URL.
2. Stripe webhook endpoint: verify the raw-body signature, make processing idempotent by event/session ID, and transition orders from pending only after authoritative payment events.
3. Persistent orders: store immutable server-calculated line snapshots, payment/session references, contact and pickup data with restricted access, attribution audit fields, and fulfillment state.
4. Confirmation: use an unguessable, expiring confirmation token; never treat query-string session IDs as authorization.
5. Order lookup: require a high-entropy lookup token or verified email flow, rate limit attempts, and return a minimal order view.
6. Fulfillment: authenticated leader-only transitions with timestamps and actor audit records.
7. Attribution correction: authenticated, reason-required, append-only audit records; revalidate campaign/Scout eligibility and never rewrite payment facts.

## End-to-end test matrix

| Area | Cases | Expected result |
|---|---|---|
| Code search | empty, malformed, active `AB12CD`, inactive `ZZ99ZZ`, unknown, data unavailable | Focused generic errors; only active redirects; inactive and unknown indistinguishable |
| Campaign | active, scheduled, closed, archived, unknown, data unavailable | Active purchasable; scheduled preview-only; closed/archived no products or shop CTA; distinct not-found/unavailable states |
| Entry | Scout link and successful code search with campaign context | Code, campaign, and source established without private fields |
| Product | navigate, refresh, choose valid options, add | Attribution remains; code-only manual selection; explicit Pack-wide change required |
| Cart | populated cart, quantity change, refresh, navigate away/back | Items and order attribution remain; unavailable lines block checkout |
| Checkout | contact/pickup validation, refresh, allowlist capture | Payload contains only documented fields; no price/total/status/inventory/eligibility assertions |
| Privacy | UI, URL, HTML, console, storage, checkout request | No full identity, birth, family, address, roster, or internal ScoutHQ data |
| Deployment | JSON and representative logo/hero/campaign/impact/product/fallback URLs | HTTP 200; no 404 or console error |

## Remaining blockers to real payment

- No trusted backend datastore or authenticated administrative source exists yet.
- Stripe keys, Checkout Session endpoint, webhook secret verification, idempotency, and retry handling are not implemented.
- Server-side catalog pricing, option, inventory, campaign-window, pickup, and Scout-eligibility validation are not implemented.
- Persistent pending/paid/failed/refunded orders and immutable financial snapshots do not exist.
- Secure confirmation and order-lookup tokens, retention policy, access controls, rate limits, monitoring, and incident procedures do not exist.
- Fulfillment roles/workflow and audited attribution correction do not exist.
- Tax, refunds, cancellations, fulfillment deadlines, privacy notice/consent, and production email delivery require Pack approval.
- Production accessibility, load, abuse/enumeration, webhook replay, and payment failure testing remain required.

Until every blocker above is closed, the payment button must remain disabled and the pull request must not be merged.
