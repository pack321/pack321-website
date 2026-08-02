# Pack 321 Storefront API — Phase 2A

This isolated Cloudflare Worker owns trusted checkout validation, Stripe test-mode Checkout Sessions, signed webhook processing, D1 orders, verified confirmations, generic order lookup, and protected administration. The Pages storefront sends IDs and contact fields only. D1—not storefront JSON—is authoritative for prices, options, campaign state, inventory, pickup, and public Scout eligibility.

## Required bindings and secrets

- D1 binding `DB`
- Rate limit bindings `CHECKOUT_RATE_LIMITER`, `LOOKUP_RATE_LIMITER`, and `ADMIN_RATE_LIMITER`
- Secret `STRIPE_SECRET_KEY` (`sk_test_…` only for this preview)
- Secret `STRIPE_WEBHOOK_SECRET` (`whsec_…` from the preview endpoint or Stripe CLI)
- Secret `ADMIN_API_TOKEN` (at least 32 random bytes)
- Variable `PACK_ID`
- Variable `STOREFRONT_ORIGIN` (exact Pages preview origin)
- Optional variable `STRIPE_API_VERSION`

Never commit `.dev.vars`, a Stripe key, webhook secret, or admin token.

## Database and migration steps

1. `npx wrangler d1 create pack321-storefront-preview --config worker/wrangler.jsonc`
2. Replace both placeholder D1 UUIDs in `worker/wrangler.jsonc` with the returned preview database ID.
3. `npx wrangler d1 migrations apply pack321-storefront-preview --remote --config worker/wrangler.jsonc`
4. Review the preview seed in `migrations/0002_seed_preview_catalog.sql`. Production must use an administrative catalog sync rather than this sample seed.

The schema includes the required `orders`, `order_items`, `payments`, `scout_attribution`, `fulfillment_events`, and `order_audit_log` tables, plus trusted catalog, pickup, public Scout eligibility, and webhook-idempotency tables.

## Local test and development

1. `npm install`
2. Copy `worker/.dev.vars.example` to `worker/.dev.vars` and enter test-only values.
3. `npm run test:worker`
4. `npx wrangler d1 migrations apply pack321-storefront-preview --local --config worker/wrangler.jsonc`
5. `npm run dev:worker`
6. Set `window.PACK321_API_BASE` in `store/js/api-config.js` to the local Worker URL while testing.
7. Run the static store and use Stripe CLI: `stripe listen --forward-to http://127.0.0.1:8787/api/stripe/webhook`.

Use Stripe test cards only. Test success with `4242 4242 4242 4242`, a generic decline with `4000 0000 0000 0002`, and authentication flows with Stripe’s documented test cards.

## Preview deployment

1. Authenticate Wrangler to the intended Cloudflare account.
2. Provision the separate preview D1 database and apply migrations.
3. Add each secret with `npx wrangler secret put NAME --config worker/wrangler.jsonc`.
4. `npm run deploy:worker:preview`.
5. Register `https://<preview-worker>/api/stripe/webhook` as a Stripe **test-mode** webhook for `checkout.session.completed`, `checkout.session.async_payment_failed`, `payment_intent.payment_failed`, and `charge.refunded`.
6. Put the Worker origin in `store/js/api-config.js`, set the exact Pages origin in `STOREFRONT_ORIGIN`, and redeploy the Pages preview.

Payment is marked paid only by a verified webhook. The confirmation endpoint requires the exact Stripe Checkout Session ID returned in the success URL, a matching backend order, and a paid/refund state. Order lookup requires the exact order number and normalized customer email and deliberately returns a generic error otherwise.
