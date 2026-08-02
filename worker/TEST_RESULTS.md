# Phase 2A test results

Run date: 2026-08-02

## Passed

- Full storefront build and deployment validation
- Worker JavaScript syntax validation
- All three D1 migrations against local Wrangler D1
- Server-side price recalculation ignores browser price/total fields
- Input shape, option ID, quantity, email, and fundraising-code validation
- Invalid product rejection
- Closed campaign rejection
- Unknown and inactive fundraising-code rejection with the same generic HTTP body
- Pack-wide support validation
- Pickup eligibility validation
- Stripe webhook HMAC verification, timestamp tolerance, and tamper rejection
- Duplicate-event guard and paid/refund transition paths present in the Worker contract
- Tracked inventory reservations and release/commit paths
- Abandoned checkout cancellation and reservation release
- Generic failed order lookup response
- No console logging of raw fundraising codes or contact/checkout payloads
- `npm audit`: zero known vulnerabilities

## Blocked pending external configuration

- Remote preview Worker and remote D1: Wrangler is not authenticated to the Pack 321 Cloudflare account and the configured D1 IDs remain placeholders.
- Successful and declined Stripe Checkout: no Pack 321 `sk_test_…` key is available.
- Live signed webhook, duplicate delivery, and Stripe refund delivery: no test endpoint `whsec_…` secret or deployed URL is available.
- Verified remote confirmation and successful remote order lookup depend on a paid test order.
- Pages-to-Worker end-to-end CORS validation depends on the final preview Worker URL and exact Pages preview origin.

An unauthenticated temporary Worker deployment was not used because it would publish the code and preview data to an unverified temporary account.
