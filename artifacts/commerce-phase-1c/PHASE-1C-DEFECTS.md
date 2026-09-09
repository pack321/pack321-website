# Phase 1C Open Defects and Blockers

1. **Blocking — Stripe Worker credentials absent.** `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are not installed on `pack321-storefront-api-test`.
2. **Blocking — Stripe webhook not created.** Creating it before the signing secret can be installed would leave an unusable endpoint and risk secret exposure.
3. **Blocking — Required Stripe transactions/refunds not run.** Successful, declined, canceled, concurrency, webhook ordering, fee capture, refund, lookup, and confirmation scenarios require an activated test credential path.
4. **Validation pending — authenticated Access operator.** Unauthenticated denial is confirmed. Operator-allowed actions and audit identity require a leadership login session.
5. **Copy mismatch — test storefront still contains legacy “Phase 1 / not live” preview copy.** It is safety-preserving but should be reviewed before controlled tester handoff; no design or business-logic copy was changed in this phase.

No live-mode resource was created or enabled.
