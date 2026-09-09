# Storefront V3 render parity investigation

Date: 2026-08-05  
Result: **FAILED — render parity is not established**  
Design changes made: none

## Reproduced state

- Scout attribution: Emily G. (`AB12CD`), established through the real `?scout=AB12CD` hydration path.
- Cart: 33 items, created through visible campaign controls (25-bar preset plus eight increments, then Add Everything).
- Campaign state: source campaign status retained for each route.
- Selected tabs: Popcorn `Savory`; Holiday Wreaths `Centerpieces`.
- Long-title case: Veterans Wreath Sponsorship.
- Cart badge and attribution banner were verified after hydration before every capture.

## Actual baseline browser environment

- Browser surface: Codex in-app browser.
- Browser outer window: 1280 × 820 CSS pixels.
- Actual document/content viewport: 1280 × 720 CSS pixels.
- `devicePixelRatio`: 1.
- Detectable visual viewport scale: 1.
- Detectable outer/inner width ratio: 1.
- Windows `AppliedDPI`: 96, corresponding to 100% OS display scale.
- Browser-reported screen dimensions: unavailable from this automation surface.
- User agent: unavailable from this automation surface; it must not be inferred as an exact UA string.
- Service worker controller: false. No service-worker registration exists in storefront source.
- Heading font: `Inter, "Segoe UI", Arial, sans-serif`.
- Baseline screenshot delay: 1,500 ms after `DOMContentLoaded`, StoreShell visibility, and attribution visibility; tab screenshots waited another 250 ms after selection.

The default content viewport—not a nominal 1920 × 1080 outer window—was used for baseline screenshots.

## Zoom testing

### 100%

The environment reported 1280 × 720 viewport, DPR 1, and visual scale 1. Browser reset and zoom keyboard commands did not change these values.

### Requested 125%

True browser zoom could not be changed or independently detected through the in-app browser surface: `Ctrl+0` followed by two `Ctrl++` attempts left viewport, DPR, and visual scale unchanged. A clearly labeled **125% layout-equivalent** pass was therefore captured at a 1024 × 576 CSS viewport, which is 1280 × 720 divided by 1.25. DPR remained 1, so these images are not claimed to be pixel-identical to genuine browser zoom at DPR 1.25.

At the equivalent viewport, the responsive navigation overlay intercepted the ordinary Popcorn tab click. `Savory` could be selected with keyboard ArrowRight navigation, and that keyboard-selected state was used for the final screenshot.

## Required environment fields

Every comparison screenshot has a corresponding record in:

- [`environment-100.json`](D:/Projects/pack321-website/artifacts/render-parity-investigation/environment-100.json)
- [`environment-125-equivalent.json`](D:/Projects/pack321-website/artifacts/render-parity-investigation/environment-125-equivalent.json)
- [`environment-scrollbar-test.json`](D:/Projects/pack321-website/artifacts/render-parity-investigation/environment-scrollbar-test.json)

Each record contains:

1. Outer window width and height.
2. Actual viewport width and height.
3. Device pixel ratio.
4. Detectable visual scale and outer/inner ratio.
5. User agent availability.
6. Available screen metrics; OS DPI is documented above.
7. `document.documentElement.clientWidth`.
8. `document.documentElement.clientHeight`.
9. `document.documentElement.scrollHeight`.
10. `window.innerWidth`.
11. `window.innerHeight`.
12. Computed major-heading font family.
13. Complete loaded stylesheet URL list.
14. Service-worker control state.
15. Visible cart count.
16. Visible attribution text/state.
17. Full path and query string.
18. Requested hydration delay and measured wall-clock navigation-to-capture time.

The JSON also includes campaign status, selected tabs, screenshot path, all requested bounding rectangles, and pairwise overlap areas.

## Loaded stylesheets

The common baseline loaded:

- Google Fonts Inter stylesheet.
- `store.css`
- `store-layout.css`
- `store-components.css` where linked by the page.
- `campaign-builders.css` on campaign pages.
- `store-v3-phase2.css`
- `revision-1.css`
- `revision-2.css`
- `revision-3.css`
- `revision-3-scout.css`
- `visual-regression.css`
- `grj-store-009.css`
- `store-v2.css`
- `store-v3-shell.css`

The exact absolute URL list for each individual screenshot is stored in its JSON record.

## Rectangle validation failures

At 100%, 1280 × 720:

- Homepage attribution bar overlaps the hero: **26,880 px²**.
- Product-detail attribution bar overlaps the product workspace: **3,720 px²**.
- Campaign attribution bar overlaps the campaign context: **26,040 px²**. See [`campaign-context-overlap.json`](D:/Projects/pack321-website/artifacts/render-parity-investigation/campaign-context-overlap.json).

At the 125% layout-equivalent, 1024 × 576:

- Homepage attribution bar overlaps the hero: **21,504 px²**.
- Product-detail attribution bar overlaps the product workspace: **2,952 px²**.

These are non-zero geometric intersections, not judgments based on `scrollHeight/clientHeight`.

## Scrollbar test

The populated mobile cart was captured at an actual 390 × 844 content viewport:

- `clientWidth`: 375 pixels, reflecting the browser scrollbar gutter.
- `scrollWidth`: 375 pixels.
- `clientHeight`: 844 pixels.
- `scrollHeight`: 2,501 pixels.
- Browser page scrollbar present: true.
- Unintentional requested-rectangle overlaps: none in this mobile case.

## Routes captured

- `/index.html`
- `/campaign.html?id=seroogy-candy-2026&scout=AB12CD`
- `/campaign.html?id=popcorn-2026&scout=AB12CD` with Savory selected
- `/campaign.html?id=rose-wreaths-2026&scout=AB12CD` with Centerpieces selected
- `/campaign.html?id=veterans-wreaths-2026&scout=AB12CD`
- `/shop.html?campaign=seroogy-candy-2026&scout=AB12CD`
- `/product.html?id=chocolate-meltaway&scout=AB12CD`
- `/cart.html?scout=AB12CD`
- `/checkout.html?scout=AB12CD`

The earlier request referred to “exact local routes shown in the screenshots,” but no additional user-browser screenshot files or URLs were attached to this turn. These are the exact routes from the generated approval comparison set plus the explicitly requested selected-tab and long-title states.

## Conclusion

Parity cannot be approved. The active attribution state changes the vertical composition and causes measurable collisions that the prior empty/Pack-wide approval captures did not expose. The 125% test also exposes a responsive navigation interaction conflict. These must be resolved in a separate design-change pass after review of this evidence.
