# Storefront V3 Phase 1 validation

Date: 2026-08-05  
Repository: `D:/Projects/pack321-website`  
Branch: `codex/fundraiser-catalog-media-integration`

## Scope completed

- Consolidated runtime header and footer ownership in `window.StoreShell`.
- Removed competing hardcoded header and footer interiors from shop, cart, and checkout.
- Added `store/css/store-v3-shell.css` for the shared shell and V3 layout primitives.
- Added desktop workspace, internal-scroll, sticky persistent-summary, tabs, native dialog, and drawer primitives.
- Added keyboard behavior for shared tabs and accessible open/close behavior for native dialogs and drawers.
- Replaced the multi-column footer with one compact shared footer.
- Retained Scout attribution hydration, Pack-wide attribution switching, cart badge persistence, checkout scripts and payload contract, privacy-safe Scout templates, and clean Scout route generation.
- Did not perform Phase 2 campaign workspace conversion.

## Shell inventory

The storefront pages load `store/js/store.js`. Before Phase 1, that script replaced shell markup at runtime while `shop.html`, `cart.html`, and `checkout.html` also contained page-specific hardcoded shells. The runtime also injected the existing revision cascade. Phase 1 makes `StoreShell` the single runtime owner and appends the dedicated V3 shell stylesheet after the existing cascade.

The authoritative public Scout route remains `store/scout.html`; `scripts/generate-store-scout-routes.js` copies that privacy-safe template to clean routes. The generator was executed and produced one public route.

## Automated validation

- `node --check store/js/store.js`: passed.
- `npm.cmd run validate:store`: passed; 10 campaigns, 48 products, 66 runtime files.
- Checkout payload allowlist: passed.
- `npm.cmd run test:campaign-studio`: passed; catalogs, pricing guards, fulfillment, symbols, privacy, and local media.
- `node scripts/generate-store-scout-routes.js`: passed; one public route generated.
- `git diff --check` on Phase 1 code: passed (line-ending notices only).

## Browser validation

At 1440 × 1000, home, shop, cart, and checkout each rendered exactly one `[data-store-shell-header]` and one `[data-store-shell-footer]`, and each loaded `store-v3-shell.css`.

At 390 × 844, the shared Menu control changed `aria-expanded` to `true`, exposed the Store navigation, and produced no console errors. Desktop and mobile screenshots were visually reviewed for shell consistency, overflow, responsive form layout, and summary positioning.

## Screenshots

- `01-home-desktop.png`
- `02-shop-desktop.png`
- `03-cart-desktop.png`
- `04-checkout-desktop.png`
- `05-shop-mobile.png`
- `06-checkout-mobile.png`

## Preservation and review state

The requested preflight status, diff stat, and patch were captured in `artifacts/` before implementation. Existing modified, deleted, and untracked files were preserved. No commit, merge, reset, clean, checkout, or restore operation was performed. Changes remain ready for visual review.
