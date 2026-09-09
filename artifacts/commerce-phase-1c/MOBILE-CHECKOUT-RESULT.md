# Mobile Checkout Result

- Viewport: 390 × 844
- Host: https://test-shop.pack321wi.org
- Flow completed: Product → Cart state → Information → Pickup → Review
- Review accounting: merchandise $50.00; convenience fee $3.00 exactly once; tax $0.00; total $53.00
- Horizontal overflow: none
- Browser console warnings/errors: none
- Stripe redirect: blocked as expected; the UI displayed “Secure checkout is temporarily unavailable.”
- Full confirmation step: not run because the Worker has no Stripe test secrets.
