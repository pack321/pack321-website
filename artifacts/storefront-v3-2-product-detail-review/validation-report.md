# Storefront V3.2 Dynamic Product Detail review

Status: implementation and validation complete; visual approval required before commit or merge.

## Architecture

One authoritative dynamic template renders every supported record:

`/store/product.html?id=<validated-product-id>`

No product-specific HTML pages, product-family templates, product-family stylesheets, database changes, or copied routes were created. The URL supplies only the product ID; title, campaign, pricing, fulfillment, symbols, media, and related products resolve from canonical data.

## Files created

- `store/css/store-v3-2-product-detail.css`
- `scripts/test-product-detail.js`
- `artifacts/storefront-v3-2-product-detail-review/*`

## Files modified

- `store/product.html`
- `store/js/product.js`
- `store/js/store-utils.js`
- `store/js/store.js`
- `store/js/catalog.js`
- `store/js/campaign-builders.js`
- `package.json`

All pre-existing user-owned changes were preserved.

## Shared components and helpers

- StoreShell header, attribution banner, mobile navigation, footer, tabs, dialogs, and cart badge
- Canonical `StoreUtils` data, media, attribution, cart, campaign URL, availability, escaping, and currency behavior
- New shared `StoreUtils.getProductUrl()` for attribution-aware dynamic product links
- New shared `StoreUtils.stepQuantity()` used by Product Detail and campaign builders
- Shared StoreShell product-card enhancer for asynchronously rendered Scout cards
- Existing product-symbol definitions and symbol-legend presentation
- Native accessible `<details>` accordions

## Product Detail behavior

- Campaign-aware breadcrumbs and back action
- Real approved product media with `object-fit: contain`
- Thumbnails only when multiple images exist
- Accessible modal lightbox with visible close button, focus trap, Escape close, and focus restoration
- Canonical title, meta description, and canonical URL updates
- Compact Scout/Pack attribution card using existing global state
- Grouped decrement/input/increment and Add to Cart controls
- Pending, unavailable, scheduled, and sold-out status handling
- No active `$0.00` state
- Dynamic related-product horizontal rail
- Privacy-safe Copy Link, Email, Facebook, and conditional QR sharing
- Safe public-record and campaign validation
- Polished Product Not Found state without identifier disclosure

## Conditional modules

- Candy: category/flavor, canonical vendor, unit price, related candy bars
- Popcorn: net weight, GF/OU/D badges, verified descriptions, symbol legend, related popcorn
- Wreaths: name-derived canonical dimensions, supplied evergreen/decoration copy, supplied indoor/outdoor language, pickup, pending pricing, related wreaths
- Merchandise: canonical options only when supplied
- Military Donation: canonical amount, program-direct-shipment/community-giving language, no local-pickup or customer-delivery claim

No missing product facts or unverified symbol meanings were invented. The 27-inch Christmas Tree retains `Description Pending`.

## Link behavior

- Shop product image and title: dynamic Product Detail route
- Campaign-builder product image and title: dynamic Product Detail route
- Scout product image, title, and existing View Product action: dynamic Product Detail route
- Quantity and quick-shopping controls remain independent
- Active Scout fundraising code is preserved in links; Scout names and private identifiers are not placed in URLs

## Validation results

- JavaScript syntax checks: pass
- `npm.cmd run test:product-detail`: pass — 48 products, 20 pending-price products, one template
- `npm.cmd run validate:store`: pass — 10 campaigns, 48 products, 69 runtime files; checkout allowlist pass
- `npm.cmd run test:campaign-studio`: pass
- Cart integration: 33 → 34 after adding one Chocolate Meltaway; success message confirmed
- Lightbox: Escape close and focus restoration confirmed
- Console errors: 0 across Product Detail, Shop, campaign, and Scout checks
- Image/title link checks: pass on Shop, campaign, and Scout pages
- Geometry: pass at 1920×1080, 1366×768, 1280×720, 1024×576, and 390×844
- Horizontal overflow: none at any required viewport
- Visible broken images: none
- `git diff --check`: no whitespace errors; repository-wide CRLF conversion warnings remain informational

Validated records:

- Chocolate Meltaway
- Classic Caramel Corn with GF/OU/D
- 36-inch Wreath
- Platinum 24-inch Wreath
- 27-inch Christmas Tree
- Military Donation
- Unknown product ID

## Generated routes

No generator changes were required. The query-driven `product.html` template remains authoritative and no competing generated product pages exist.

## Review screenshots

- `candy-desktop-1280x720.png`
- `popcorn-desktop-1280x720.png`
- `wreath-desktop-1280x720.png`
- `pending-price-wreath-desktop-1280x720.png`
- `military-donation-desktop-1280x720.png`
- `mobile-candy-390x844.png`
- `image-lightbox-open-1280x720.png`
- `product-not-found-1280x720.png`
- `emily-attribution-1280x720.png`
- `pack-wide-attribution-1280x720.png`

Machine-readable results are in `geometry-audit.json`, `interaction-validation.json`, `screenshot-metadata.json`.

## Remaining blockers

No implementation blocker remains. Visual approval is required before commit or merge.

## Accordion overflow correction

The StoreShell cascade previously overrode Product Detail and computed both the page and its main region to `overflow: hidden`. Product Detail now explicitly uses natural document scrolling, while its main region and accordion bodies remain `overflow: visible`. A `product-details-open` state is synchronized from native accordion `toggle` events so details can never inherit a locked StoreShell state.

Validated at 1280×720, 1366×768, and 390×844:

- Product Description open
- Product Information open
- Pickup Information open
- Share Product open
- all four accordions open simultaneously
- 15/15 overflow and reachability scenarios passed
- accordion bodies use natural content height
- footer remains in document flow and reachable
- mobile scrolling remains enabled

Evidence:

- `accordion-scroll-audit.json`
- `accordions-open-desktop-1280x720.png`
- `accordions-open-mobile-390x844.png`
