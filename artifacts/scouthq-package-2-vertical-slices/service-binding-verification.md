# Service-binding verification

Cloudflare deployment output verified these staging bindings:

- `SCOUTHQ_IDENTITY` -> `scouthq-identity-staging`
- `WORKER_SELF_REFERENCE` -> `scouthq-pack321-staging`
- `SCOUTHQ_IDENTITY` D1 -> `scouthq-identity-staging`
- `ASSETS` -> OpenNext static assets
- `NEXT_PUBLIC_SCOUTHQ_ENV` -> `staging`

The Next application owns `staging-hq.pack321wi.org`. The Package 1 identity Worker is internal-only and has no public deployment target. Same-origin ScoutHQ route handlers proxy session, logout, switch-account, onboarding, account-status, and approval operations to the service binding.
