# Pack 321 Public Preview — Phase 2 Production Report

## PUBLIC PREVIEW RESULT: FAIL

Validated: 2026-08-07 America/Chicago (Cloudflare timestamps 2026-08-08 UTC)

Target: `https://shop.pack321wi.org`

Project: `pack321-storefront-preview`

Deployment: `7691e979-37fb-4d8b-a1a9-695831663c2a`

Approved commit: `39ca6d885713914e286ecd6aee35879bdeb4b3ec`

LC1 ancestor: `52ed33b release(store): establish storefront LC1 baseline`

## Acceptance checklist

- [x] Branch pushed normally; no force push
- [x] Remote branch now points to `39ca6d8`; upstream is 0 ahead / 0 behind
- [x] Pages production deployment is from the approved branch and exact commit
- [x] Clean storefront build succeeded from a Git archive of `39ca6d8`
- [x] `shop.pack321wi.org` resolves publicly
- [x] HTTPS certificate is valid
- [x] All requested primary, product, and campaign routes load
- [x] Required CSS, JavaScript, JSON, hero, product, logo, and lightbox assets load
- [x] Eagle Cave and fundraising hero focal points render correctly
- [x] Mobile routes render at 390×844 without horizontal overflow; mobile navigation opens
- [x] Scout lookup, attribution, product, cart, refresh persistence, and checkout review work
- [x] No private Scout name or profile data is placed in the URL
- [x] Preview banner remains visible
- [x] `PACK321_API_BASE` remains unset/empty
- [x] No Pages Functions, D1 binding, Stripe Worker, or payment environment variable is attached
- [x] Checkout fails closed with `Checkout API is not configured for this preview.`
- [x] No live Stripe key was found in public source or deployed configuration
- [x] No console-breaking errors were observed
- [ ] No `$0.00` leakage

## Blocking finding

The public Home/Fundraising and campaign experiences render progress strings such as `$0.00 of $0.00 goal · 0%` and `0% toward $0.00` for campaigns without approved goals. This directly fails the required “no $0.00 leakage” acceptance criterion. Empty-cart and empty-checkout zero totals were also observed, but the campaign-goal strings alone are sufficient to mark this production preview FAIL.

The storefront was not modified because Phase 2 expressly prohibited storefront design, business-logic, and campaign-pricing changes.

## Infrastructure result

The normal push advanced the remote from `e084bc5` to `39ca6d8`. Cloudflare records the production deployment as branch `codex/fundraiser-catalog-media-integration`, commit `39ca6d885713914e286ecd6aee35879bdeb4b3ec`, and `commit_dirty: false`.

Only `shop.pack321wi.org` was added. It is a proxied CNAME to `pack321-storefront-preview.pages.dev`. Existing apex, `www`, and `hq` routing was not altered.

## Payment safety

Payment remains impossible from the public preview. The Pages deployment has no environment variables and does not use Functions. Checkout submission was exercised with synthetic data and remained on the same hostname with the approved fail-closed message. No Stripe request or checkout session was created.

## Evidence

See the accompanying production audit JSON files and PNG screenshots in this directory.
