# Open Decisions

## Online Convenience Fee Refund

Recommendation: **Option B — refund the $3 fee on full cancellation, retain it on partial item refunds unless Pack 321 caused the error.**

Rationale: this is straightforward for customers, avoids prorating a flat order-level fee, and preserves the fee for successfully processed orders while allowing full cancellation to unwind the entire charge.

This recommendation is not activated. Approval is required before refund creation is enabled.

Other required inputs:

- Cloudflare Access team domain, application audience, and allowed operators.
- Approved non-production storefront origin.
- Stripe test secret and webhook signing secret.
- Operational support contact wording and whether phone remains required for pickup orders only.
- Review of current npm audit findings before test transactions.
