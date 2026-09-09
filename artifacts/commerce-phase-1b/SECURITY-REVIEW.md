# Security Review

- Live Stripe keys cannot activate commerce: checkout requires `COMMERCE_MODE=test` and an `sk_test_` key.
- Public preview and production-commerce environments are disabled and have no D1 binding.
- Stripe secret, webhook secret, Access settings, and credentials are not committed.
- Admin bearer-token authentication was removed; admin endpoints require a verified Cloudflare Access JWT and derive actor identity from its email claim.
- Browser prices are rejected and never authoritative.
- CORS is an exact allowlist, public errors are generic, and rate-limit bindings are environment scoped.
- Stripe events are atomically claimed and auditable.
- Public responses exclude internal D1 IDs and private Scout identifiers.
- PII, financial, audit, Stripe-reference, and public-attribution classes are separated for future retention policy; destructive retention is not enabled.

Dependency audit after upgrading Wrangler to 4.120.0: zero known vulnerabilities.

Open security dependencies: configure the Access application/AUD, confirm the test origin, and add transaction alerts before transactions.
