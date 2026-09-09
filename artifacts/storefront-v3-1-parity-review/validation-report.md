# Storefront V3.1 parity validation

Status: PASS for the requested Phase V3.1 scope. No Phase 2 product-detail work was started. No commit or merge was created.

## Files modified for V3.1

- `store/css/store-v3-1.css` — spacing tokens, flow shell, responsive geometry, card zoning, shop toolbar, cart columns, and mobile drawer presentation.
- `store/js/store.js` — V3.1 asset loading, SVG navigation chevrons, ARIA state, focus trap, Escape/route close, and focus restoration.
- `store/js/campaign.js` — non-duplicated campaign context row.
- `store/js/catalog.js` — independent image/title links and responsive filter-drawer focus behavior.
- `scripts/storefront-geometry-audit.js` — reusable DOM bounding-rectangle audit.
- `artifacts/storefront-v3-1-parity-review/*` — screenshots and machine-readable results.

All other pre-existing modified and untracked files were preserved.

## Shell geometry

The shell uses real CSS Grid flow rows for announcement, navigation, optional attribution, main content, and footer. Attribution and campaign context are no longer positioned over workspace content. Desktop commerce pages use a bounded internal workspace at widths above 1180px; narrower and zoom-equivalent layouts fall back to document flow and scrolling so content is not hidden to manufacture a pass.

At the 1280×720 campaign baseline the measured rows were: announcement 38.34px, navigation 84.75px, attribution 57px, campaign context 40px, hero 180px, and footer 49px. Adjacent rectangles meet at their edges without intersecting.

## Spacing and component corrections

The shared scale is `4, 8, 12, 16, 24, 32, 48, 64px` through `--space-1` … `--space-8`. Homepage cards use explicit media/title/description/status/action zones, with four cards at constrained desktop heights and a compact View All action. The shop toolbar is one five-column row at desktop. Cart unit price and line total use separate labeled columns with a stable scrollbar gutter. Navigation chevrons are inline SVGs. The mobile navigation is an intentional drawer with focus management.

## Collision and stress tests

`geometry-audit.json` records bounding rectangles and results for:

- announcement/navigation
- navigation/attribution
- attribution/campaign context and attribution/page title
- campaign context/hero and hero/workspace
- filters/products
- product text/actions
- cart unit price/line total
- workspace/footer
- View All/campaign cards and campaign-card zones

All checks passed at 1280×720, 1366×768, 1440×900, 1920×1080, 1024×576 (125% layout-equivalent), 853×480 (150% layout-equivalent), and 390×844. The 1024px, 853px, and 390px cases use normal document scrolling; they do not pass through clipped or hidden content.

The mobile interaction capture confirms the menu opens with `aria-expanded=true`, closes with Escape to `aria-expanded=false`, restores normal page operation, and leaves the Popcorn tabs clickable (Classic selected in the closed-state capture).

## Render environment

`render-environment.json` reports per screenshot: outer size, content viewport, DPR, detectable visual zoom, document client dimensions and scroll height, heading font, stylesheet URLs, cart count, attribution state, full route/query, screenshot delay, and major rectangles. The baseline captures used DPR 1, visual zoom 1, Emily G. attribution, and cart count 33. Screenshots were taken 800ms after network-idle/load stabilization and hydration.

The in-app browser sandbox did not expose `navigator`, so exact user-agent/platform and service-worker-controller values are recorded as unavailable (`null`) rather than inferred. OS display scaling is likewise unavailable. Browser outer height was measurable (820px for a 720px content viewport); each screenshot was captured from the requested content viewport, not from an assumed monitor/window size.

## Automated validation

- JavaScript syntax checks: pass.
- `npm.cmd run validate:store`: pass (10 campaigns, 48 products, 68 runtime files; checkout allowlist pass).
- `npm.cmd run test:campaign-studio`: pass (catalogs, pricing guards, fulfillment, symbols, privacy, and local media).
- Geometry audit: pass for every requested and zoom-equivalent target.

## Screenshots

- `home-1280x720.png`
- `home-1366x768.png`
- `candy-1280x720.png`
- `popcorn-1280x720.png`
- `wreaths-1280x720.png`
- `shop-1280x720.png`
- `cart-1280x720-33-items.png`
- `find-a-scout-1280x720.png`
- `help-1280x720.png`
- `mobile-home-390x844.png`
- `mobile-menu-open-390x844.png`
- `mobile-menu-closed-popcorn-tabs-390x844.png`

## Remaining blockers

No implementation or geometry blocker remains. Visual approval is still required before any commit, merge, or further product-detail work.
