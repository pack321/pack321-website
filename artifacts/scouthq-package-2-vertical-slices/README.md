# ScoutHQ Package 2 staging recovery evidence

Status: deployment recovered; authenticated browser validation pending user sign-in.

## Source and remote build

- Repository: `pack321/grijas-platform`
- Branch: `codex/fundraising-studio-foundation`
- Commit: `cf5ba1805f024da70f65593d7f9efd8272c46ec5`
- Cloudflare build: `321ff715-93c1-4035-99dc-ad0d8da12b25`
- Environment: Cloudflare Builds Linux
- Node: 24.18.0
- pnpm: 11.9.0
- Next.js: 16.2.10
- OpenNext Cloudflare: 1.20.2
- Wrangler: 4.113.0
- Tests: 173 passed, 0 failed
- Next production build: passed
- OpenNext packaging: passed
- Wrangler staging deployment: passed

An earlier manually triggered build (`d0100567-9896-4128-9ac7-4973e34b1c18`) failed before checkout because an incorrect expanded commit SHA was supplied. Retrying with the exact Git commit resolved it; this was not an application defect.

## Deployment

- Application Worker: `scouthq-pack321-staging`
- Application Worker version: `3ea6643f-7c53-4ac1-991b-8d98b1f9d7d0`
- Hostname: `staging-hq.pack321wi.org`
- Internal service binding: `SCOUTHQ_IDENTITY` -> `scouthq-identity-staging`
- Identity Worker version: `94bc8d40-5253-40c4-973b-379c139d61bd`
- D1 binding: `scouthq-identity-staging`
- Identity Worker exposure: service-only; no public route or workers.dev target

The deployed Next/OpenNext application owns the staging hostname. Browser-facing identity operations use same-origin route facades, which call the Package 1 identity Worker through the internal service binding. Missing binding behavior fails closed.

## Migration 0007

Applied only to staging D1 `scouthq-identity-staging` (`5261a2b5-3c86-46f3-ab74-cef5f19534ae`). The migration added eight idempotent application-permission mappings and did not alter users, identities, sessions, or production data. Ledger entry `0007_package2_app_permissions.sql` was verified as migration 7 at `2026-08-08 17:12:23`.

## Browser validation

The unauthenticated staging landing page rendered correctly and `Continue with Google` reached the configured Google identity-provider flow through Cloudflare Access. The automation browser did not contain a reusable Google session, so Parent and Leadership authenticated walkthroughs, authorization regression, logout/account switching, desktop screenshots, and 390x844 screenshots remain pending user completion of Google sign-in.

No authenticated result is claimed without evidence.

## Production isolation

No deployment, migration, DNS change, merge, or route change was made to `hq.pack321wi.org` or `scouthq-pack321`. Package 3 was not started.
