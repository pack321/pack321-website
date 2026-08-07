# LC1 Image Focal Point & Hero Cropping Audit

Result: PASS

The storefront now uses one shared focal-image contract in `store-v3-shell.css`, backed by canonical metadata in `store.js`. Explicit `data-focal-*` attributes may override the registry. Desktop, tablet, and mobile focal positions and aspect ratios are supported without duplicate image files.

| Use | Source | Desktop focal | Tablet focal | Mobile focal | Desktop result | Tablet result | Mobile result |
|---|---|---:|---:|---:|---|---|---|
| Store Home Eagle Cave hero | `/assets/optimized/adventures/eagle-cave-640.37cef2da.webp` | 52% 60% | 52% 62% | 52% 58% | PASS — complete group, Pack flag, cave entrance, and snow remain recognizable | PASS — complete group retained | PASS — native 4:3 composition prioritizes the group without cutting heads or front-row Scouts |
| Fundraising Center popcorn hero | `/assets/optimized/adventures/popcorn-fundraising-640.e05562b4.webp` | 52% 52%, 1.25× | 52% 52%, 1.20× | 52% 50%, 1.18× | PASS — Scouts dominate while faces, upper bodies, product table, and Pack materials remain visible | PASS — reduced peripheral shelving with fundraising context intact | PASS — square crop prioritizes Scouts and products without cutting faces |
| Help & Orders ceremony hero | `/assets/images/adventures/blue-gold.jpg` | 58% 58% | 58% 58% | 62% 56% | PASS — ceremony participants remain centered and complete | PASS | PASS |
| Fundraising camping feature card | `/assets/images/adventures/camping.jpg` | 48% 64% | 48% 64% | 50% 58% | PASS | PASS | PASS |
| Fundraising Pinewood Derby feature card | `/assets/images/adventures/pinewood-derby.jpg` | 52% 58% | 52% 58% | 54% 56% | PASS — cars and track interaction retained | PASS | PASS |
| Fundraising recognition feature card | `/assets/images/adventures/graduation.jpg` | 50% 61% | 50% 61% | 50% 58% | PASS — Scout group retained | PASS | PASS |
| Fundraising service feature card | `/assets/images/adventures/service.jpg` | 66% 61% | 66% 61% | 68% 58% | PASS — ceremony line remains the subject | PASS | PASS |
| Other approved Pack photography | fishing and Raingutter Regatta assets | canonical per-asset metadata | canonical per-asset metadata | canonical per-asset metadata | PASS | PASS | PASS |
| Campaign hero product artwork | Candy, Popcorn, Wreath campaign hero assets | N/A — `contain` | N/A — `contain` | N/A — `contain` | PASS — no photographic crop applied | PASS | PASS |
| Scout-facing hero | privacy-safe placeholder | N/A | N/A | N/A | PASS — no Scout photo exposed | PASS | PASS |

## Responsive review

- Visually inspected extension-free captures at 1920×1080, 1440×900, 1366×768, 1280×720, and 390×844.
- Geometry and computed-style audit passed at 1920×1080, 1440×900, 1366×768, 1280×720, 1024×576, and 390×844.
- 54 page/viewport combinations produced zero constrained-overflow, collision, outside-rectangle, or horizontal-overflow failures.
- No stretching, letterboxing, fixed-height hero clipping, or blanket `object-fit: contain` was introduced.

Screenshots and computed focal/object-position evidence are stored beside this report in `hero-geometry.json` and the page PNG files.

## Fundraising Center source-quality addendum

The popcorn hero now uses an original-derived responsive 360/640/800/1200/1800 WebP set with `/assets/optimized/adventures/popcorn-fundraising-1800.aebee9f1.webp` as its canonical fallback. Actual-size desktop review confirms clear faces and recognizable table/product detail while retaining the approved focal positions and responsive scale values above.
