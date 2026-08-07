# Pack 321 Storefront LC1 certification

## Result: PASS

Repository: `D:/Projects/pack321-website`
Branch: `codex/fundraiser-catalog-media-integration`
HEAD: `805bb43 update`
Base URL: `http://127.0.0.1:8765/`

No Blocker, Critical, or High defects remain. The working tree remains intentionally uncommitted pending visual review.

## Certification summary

- Canonical routes: PASS; 17 tested HTTP/browser states returned successfully.
- Responsive matrix: PASS; 36 route/viewport geometry cases plus mobile state screenshots.
- Catalog: PASS; 48 public products, every row reachable, all filters/sort/empty state usable.
- Wreaths: PASS; 19 canonical records, pending pricing protected, 27-inch Christmas Tree remains `Description Pending`.
- Product Detail: PASS; one shared template, seven approved records plus safe Not Found.
- Dietary symbols: PASS; only canonical GF, OU, and Dairy meanings displayed where assigned.
- Military donations: PASS; $30 and $50 records, direct shipment, no local pickup requirement.
- Attribution: PASS; Emily G. code journey persists through refresh, Cart, and Checkout; Pack-wide conversion rewrites all lines.
- Cart: PASS; compact empty state and exact 33-item populated state validated.
- Checkout: PASS; empty, Information, Fulfillment, Review, allowlist, totals, attribution, and direct-shipment rules.
- Find a Scout privacy: PASS; code-only, generic failures, no directory/search/suggestions/private data.
- Donations: PASS; $25/$50/$100/Custom state, validation, note, preview payment guard.
- Help & Orders and Order Lookup: PASS; focused workflows, FAQ/contact routes, generic preview behavior.
- Accessibility: PASS; labels, names, alt text, accordions, dialogs, keyboard Escape, and focus restoration.
- Console/network/media: PASS; no uncaught errors, broken required images, duplicate shells, or failed canonical route loads.
- Zero-price blocker: PASS; no unintended retail `$0.00`; campaign builder selection totals remain intentionally labeled.

## Automated regression

- `npm run validate:store`: PASS — 10 campaigns, 48 products, 74 runtime files
- Checkout payload allowlist: PASS
- `npm run test:campaign-studio`: PASS
- `npm run test:product-detail`: PASS — 48 products, 20 pending-price records, one shared template
- JavaScript syntax checks: PASS
- `git diff --check`: PASS (line-ending notices only)

## Evidence

This directory contains all required desktop, Product Detail, attribution, Cart/Checkout, and mobile screenshots plus:

- `LC1-TEST-MATRIX.json`
- `LC1-GEOMETRY-AUDIT.json`
- `LC1-CONSOLE-AUDIT.json`
- `LC1-ROUTE-INVENTORY.json`
- `LC1-DEFECTS.md`

## Global hero fit audit

- PASS: 54 page/viewport combinations covering Store Home, Fundraising Center, Candy/Popcorn/Wreath campaign heroes, Help & Orders, Find a Scout, Donations, and Checkout
- PASS: 1920×1080, 1440×900, 1366×768, 1280×720, 1024×576, and 390×844
- PASS: no constrained text overflow, CTA cutoff, hero/next-region collision, content outside hero bounds, or horizontal document overflow
- Evidence: `hero-audit/HERO-AUDIT-REPORT.md`, `hero-audit/hero-geometry.json`, `hero-audit/hero-failures.json`, plus extension-free 1280×720 and 390×844 screenshots

## Image focal-point audit

- PASS: shared focal-image system supports canonical or explicit desktop/tablet/mobile focal values and aspect ratios
- PASS: camping activity and the complete pavilion Scout group remain compositionally prominent
- PASS: Help & Orders ceremony media remains subject-safe
- PASS: campaign product artwork retains intentional `contain`; privacy-safe Scout pages do not expose photos
- Evidence: `hero-audit/FOCAL-POINT-AUDIT.md` and computed `object-position` values in `hero-audit/hero-geometry.json`

## Store Home Eagle Cave hero

- PASS: exact user-supplied original preserved at `store/assets/images/adventures/eagle-cave.jpg`
- PASS: hash-named 360px and 640px WebP derivatives follow existing storefront optimization conventions
- PASS: Store Home and the authoritative storefront media manifest reference canonical assets only
- PASS: group, Pack flag, cave entrance, front-row Scouts, and surrounding snow remain visible at every required review viewport
- PASS: responsive focal metadata uses 52%/60% desktop, 52%/62% tablet, and 52%/58% mobile with a taller native-like mobile composition

## Fundraising Center popcorn hero

- PASS: exact user-supplied source preserved at `store/assets/images/adventures/popcorn-fundraising.jpg`
- PASS: hash-named 360px and 640px WebP derivatives follow existing storefront optimization conventions
- PASS: canonical media manifest includes source, responsive derivatives, fallback, and accessible description
- PASS: all three Scouts, faces, upper bodies, fundraising table, popcorn products, and Pack context remain recognizable at all required viewports
- PASS: responsive focal zoom uses 1.25× desktop, 1.20× tablet, and 1.18× mobile around the Scouts/table focal region
- PASS: peripheral shelving, ceiling, floor, and tablecloth are reduced before any Scout face or upper body; fundraising products remain immediately recognizable

## Home hero benefit strip polish

- PASS: five equal desktop columns remain attached to and exactly aligned with the hero image
- PASS: 20px vertical padding, increased horizontal breathing room, 9px icon gap, balanced label widths, and softened dividers
- PASS: all five approved labels wrap intentionally without clipping at 1280×720
- PASS: mobile uses a contained horizontal scroll region with readable card widths and no page-level horizontal overflow

## Unresolved issues

None within LC1 launch scope.

## Recommended baseline commit after visual approval

`release(store): establish storefront LC1 baseline`

Do not create the commit or merge until the evidence receives visual approval.

## Fundraising Center card scale and source-quality addendum

- PASS: responsive 360px, 640px, 800px, 1200px, and 1800px WebP sources were generated directly from the exact original; the 1800px original-derived asset is the canonical desktop fallback
- PASS: existing `srcset`/`sizes` delivery avoids thumbnail upscaling while preserving the approved 1.25×/1.20×/1.18× Scouts-focused crop
- PASS: large desktop retains four equal-height cards with 285px minimum width, 160px minimum height, 110px media columns, 18px gaps, and 14px content padding
- PASS: 1920×1080, 1440×900, 1366×768, and 1280×720 renders retain balanced four-card rows; narrower desktop layouts wrap rather than compressing typography
- PASS: status pills, campaign links, CTA behavior, and product imagery remain unchanged

## Fundraising Center Current Fundraisers spacing polish

- PASS: 28px separates the navy hero boundary from the Current Fundraisers eyebrow
- PASS: the eyebrow-to-heading interval is 9px and the heading-to-card interval is 22px
- PASS: four approved large cards retain equal height with 15px internal padding, 8px content gaps, and 22px horizontal grid gaps
- PASS: 38px separates the card row from the compact footer
- PASS: short desktop viewports use normal document scrolling; no section, card, or footer overflow is hidden
