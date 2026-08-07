# LC1 defects

All LC1 defects were corrected with scoped changes and revalidated. No unresolved Blocker, Critical, or High defects remain.

No unresolved launch-blocking defects.

## LC1-001 — Pending products displayed `$0.00`

- Severity: Critical
- Route: `/shop.html` and any shared catalog-card surface
- Root cause: the shared card renderer formatted raw numeric price without checking approval state
- Smallest fix: render `Pricing Pending` unless the record has an approved positive price
- Files: `store/js/catalog.js`
- Revalidation: 48 cards, 23 non-approved labels, zero visible product-price `$0.00`, unavailable controls disabled
- Result: Fixed

## LC1-013 — Current Fundraisers section spacing was compressed

- Severity: Visual polish
- Route: `/fundraising.html#current`
- Root cause: the short-height desktop override suppressed the section eyebrow and reduced section padding to 12px, visually joining the hero, heading, cards, and footer
- Smallest fix: retain the approved card scale while restoring the eyebrow and applying 28px top padding, 22px heading/card spacing and grid gaps, deliberate 15px/8px card rhythm, and 38px bottom padding
- Revalidation: computed live-browser rectangles at 1280×720 plus the full hero/layout audit; natural document scrolling remains enabled
- Result: Fixed

## LC1-012 — Fundraising Center card scale and hero source quality

- Severity: Visual polish
- Route: `/fundraising.html#current`
- Root cause: campaign cards remained compressed at large desktop widths, while the hero only exposed 360px/640px derivatives despite the exact original photograph being available
- Smallest fix: enlarge the four-card desktop grid to 285px minimum cards with 160px minimum height, 110px media columns, 18px gaps, and increased content padding; generate 800px, 1200px, and 1800px WebP sources directly from the original and add them to the existing responsive image contract
- Revalidation: actual rendered screenshots at 1920×1080, 1440×900, 1366×768, and 1280×720; 54-case hero geometry audit; storefront, campaign, checkout-payload, and Product Detail regressions
- Result: Fixed

## LC1-002 — Lightbox restored focus to the wrong trigger

- Severity: High accessibility
- Route: `/product.html?id=*`
- Root cause: the focus trap captured only the main-image trigger
- Smallest fix: retain and restore the actual initiating trigger
- Files: `store/js/product.js`
- Revalidation: zoom control and main image both restore focus after Escape; close control and object-fit checks pass
- Result: Fixed

## LC1-003 — Direct-shipment orders inherited pickup requirements

- Severity: Blocker
- Route: `/checkout.html`
- Root cause: Checkout rendered the pickup selector unconditionally
- Smallest fix: derive pickup need from canonical product fulfillment metadata; direct-shipment-only carts use the existing step as Fulfillment with no required pickup selection
- Files: `store/js/checkout.js`, `store/js/checkout-payload.js`, `scripts/test-checkout-payload.js`
- Revalidation: military payload uses null pickup, direct-shipment helper returns false, local fundraiser products return true, allowlist passes
- Result: Fixed

## LC1-004 — Donation amount controls had no selection or Custom behavior

- Severity: High
- Route: `/donations.html`
- Root cause: approved amount controls were static buttons
- Smallest fix: add pressed state, reveal a labeled Custom amount field, validate a minimum $1 amount, preserve the preview/contact route
- Files: `store/js/donations.js`, `store/css/store-v3-donations.css`, `store/js/store.js`
- Revalidation: fixed and custom selections, selected-state clarity, missing-selection and invalid-custom errors, optional note, live-payment disabled
- Result: Fixed

## LC1-005 — Empty Checkout allowed forward progression

- Severity: Blocker
- Route: `/checkout.html`
- Root cause: empty-summary rendering did not control step actions
- Smallest fix: disable forward and submit controls while empty; restore automatically on the existing cart event
- Files: `store/js/checkout.js`
- Revalidation: no `$0.00`, both actions disabled empty, summary/pricing/actions restore when one item is added
- Result: Fixed

## Non-defect validation note

The standalone `scripts/storefront-geometry-audit.js` is browser-injected code and is not a Node CLI. Geometry was executed in page context as designed; direct Node invocation was excluded from storefront defect counts.

## LC1-006 — Global hero height constraints clipped approved content

- Severity: High
- Routes: Store Home, Fundraising Center, and shared campaign pages
- Root cause: desktop viewport locking forced overview heroes into percentage rows and capped campaign heroes at 180–190px; long campaign content extended outside the hero and Home actions/assurances could reach beyond the constrained row
- Smallest fix: restore intrinsic hero sizing, use responsive minimum heights and padding, remove campaign description line clamping, and permit natural page growth when complete hero content requires it
- Files: `store/css/store-v3-1.css`, `store/css/store-v3-phase2.css`
- Revalidation: 54 page/viewport combinations across nine page variants and six viewport sizes; zero constrained-overflow, collision, outside-rectangle, or horizontal-overflow failures
- Result: Fixed

## LC1-007 — Hero photographs used geometric rather than subject-aware crops

- Severity: High
- Routes: Store Home, Fundraising Center, Help & Orders, and shared Pack photography
- Root cause: photographic media relied on fixed heights and generic centered crops, causing the pavilion architecture to displace the Scout group and making campsite activity visually incidental
- Smallest fix: add a shared focal-image contract with canonical per-asset focal metadata, responsive focal/ratio values, and explicit hero overrides; retain `contain` for non-photographic campaign product art
- Files: `store/js/store.js`, `store/css/store-v3-shell.css`, `store/css/store-v3-help.css`, `store/index.html`, `store/fundraising.html`
- Revalidation: visual desktop/mobile review plus 54-case geometry/computed-style matrix; focal values verified at 1920, 1366, 1280, and 390 widths
- Result: Fixed

## LC1-008 — Store Home primary hero photograph replacement

- Severity: High-priority visual correction
- Route: Store Home
- Change: replace the camping/tent photograph with the exact supplied Eagle Cave group photograph
- Asset handling: preserve the original in canonical storefront adventure media and generate hash-named 360px/640px WebP derivatives without altering the source
- Composition: shared responsive focal contract prioritizes the complete Pack group and flag while retaining the cave entrance and winter setting
- Revalidation: extension-free screenshots at 1920×1080, 1440×900, 1366×768, 1280×720, and 390×844; full 54-case hero matrix remains clean
- Result: Fixed

## LC1-009 — Fundraising Center primary hero photograph replacement

- Severity: High-priority visual correction
- Route: `/fundraising.html#current`
- Change: replace the pavilion group image with the exact supplied popcorn fundraising photograph
- Asset handling: preserve the original in canonical storefront adventure media and generate hash-named 360px/640px WebP derivatives
- Composition: shared responsive focal contract centers the three Scouts and product table while reducing emphasis on peripheral store shelving
- Revalidation: extension-free screenshots at 1920×1080, 1440×900, 1366×768, 1280×720, and 390×844; full 54-case hero matrix remains clean
- Result: Fixed

## LC1-010 — Home hero benefit strip was visually compressed

- Severity: Visual polish
- Route: Store Home
- Root cause: compact padding, narrow text columns, strong dividers, and a low-height desktop override made the approved benefits read like a compressed navigation bar
- Smallest fix: retain the five-item strip, attach it to the image width, restore it at short desktop heights, use five equal columns with 20px vertical padding and balanced labels, soften dividers, and use a contained mobile horizontal scroller
- Revalidation: 54-case hero matrix with explicit 1280×720 and 390×844 review; zero clipping, collision, or page-level horizontal-overflow failures
- Result: Fixed

## LC1-011 — Fundraising Center subjects were too small in the hero crop

- Severity: Visual polish
- Route: `/fundraising.html#current`
- Root cause: subject-safe positioning preserved the full photograph but left too much peripheral store environment around the three Scouts
- Smallest fix: extend the shared focal system with responsive scale metadata and apply 1.25×/1.20×/1.18× focal zoom centered on the Scouts and fundraising table
- Revalidation: all five requested screenshots retain three complete faces and upper bodies, the table, popcorn products, and Pack context; peripheral clutter is materially reduced
- Result: Fixed
