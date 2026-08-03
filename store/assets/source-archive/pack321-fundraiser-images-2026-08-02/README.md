# Pack 321 Fundraiser Image Package

This package contains the fundraiser images supplied in ChatGPT, renamed and organized for the Pack 321 storefront.

## Install
Copy the `assets/media/campaigns` folder into:

`D:\Projects\pack321-website\store\assets\media\campaigns`

Preserve the folder structure and filenames. Codex should update campaign/product JSON to use paths relative to `/store/`, for example:

`assets/media/campaigns/popcorn/products/classic/classic-caramel-corn.png`

## Included
- 8 candy/branding/reference files
- 18 popcorn product/reference files
- 20 holiday wreath product files
- 1 Veterans Wreath campaign image (approved 20-inch wreath copy)

## Important
- These are the user-supplied originals. Do not hotlink vendor websites.
- Do not rename files without also updating `media-manifest.json`.
- Wreath prices remain pending; images are production-ready, pricing is not.
- The 27-inch Christmas Tree description remains pending.
- The Veterans Wreath image intentionally uses the approved 20-inch wreath source.
- Popcorn vendor symbols are preserved as reference only until their meanings are verified.

## Validation
After copying, Codex must verify every manifest path exists and every storefront image request returns HTTP 200.
