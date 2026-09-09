# Storefront V2 visual review

Captured from the actual local storefront at 1440px desktop and 390px mobile viewports on August 4, 2026. The screenshots preserve full page height. Detected overflow is documented rather than concealed. The PNG content width excludes the browser's scrollbar gutter, so files are typically 1425px and 375px wide. No storefront design files were changed and no commit was created.

Open [index.html](./index.html) for the linked review matrix and full-size screenshots.

## Capture state

- Scout attribution: Emily G. (`AB12CD`)
- Candy: seven flavors selected, one of each
- Cart: seven products, each attributed to Emily G.
- Checkout: populated preview/review state with local-only sample contact data and acknowledgments
- Popcorn: dietary badges in the full-page capture, with separate desktop/mobile symbol-legend detail captures
- Holiday wreaths: full multi-category catalog and product thumbnails
- Veterans wreaths: sponsorship wording is present; delivery wording is not used

## Cross-page visual findings

- Product Detail has real mobile horizontal overflow: the rendered content is 396px wide at the requested 390px viewport. The screenshot preserves the overflow.
- Popcorn, Holiday Wreaths, and Product Catalog are unusually long on mobile because their catalogs stack into a single column.
- Current Fundraisers uses `/fundraising.html#current`, so its full-page capture is the same document as Fundraising Center with the campaign section targeted.
- The current site generally uses real Pack and product imagery, which differs from some AI/lifestyle imagery in the approved reference renderings.
- Several preview states remain intentional: checkout does not submit payment, donations are preview-only, and some Selling Resources tools are marked coming soon.
