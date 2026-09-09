# Payment-disabled verification

Local LC1 safeguard: PASS.

- `window.PACK321_API_BASE` defaults to an empty string.
- Checkout refuses submission with “Checkout API is not configured for this preview.”
- No live Stripe key was found in public storefront files.
- No Worker or payment API was deployed during this task.

Production verification: BLOCKED until the hostname resolves and the storefront is deployed.
