# Commerce Phase 1C Test Environment Report

- Test storefront: https://test-shop.pack321wi.org (Cloudflare Pages project `pack321-storefront-test`, active)
- Test Worker: `pack321-storefront-api-test`, version `cbfced4c-b619-4455-b6db-99e4e4169e8a`
- Test D1: `pack321-storefront-commerce-test` (`4f8c972a-4353-4444-b442-a7660d1a8167`, ENAM)
- Public preview: unchanged; `https://shop.pack321wi.org/js/api-config.js` remains empty.
- Catalog sync: 10 campaigns, 48 products, 20 pricing-pending, 9 purchasable, 1 approved public Scout.
- Access: active for the Worker `/api/admin/*` route; leadership allow policy attached.
- Stripe: connector authenticated in test mode, but the Worker has no Stripe secrets. Checkout therefore fails closed with HTTP 503.
- Live mode: not enabled and no production commerce Worker or D1 was created.

Result: infrastructure is isolated and fail-closed, but transaction validation is blocked pending secure installation of a Stripe test secret key and webhook signing secret.
