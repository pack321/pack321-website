# Migrations

- `0001_identity_foundation.sql`: identity, organization, authorization, household, onboarding, session, request, invitation, and audit schema.
- `0002_founding_org_roles.sql`: Pack 321 Founding Organization Mode, reusable roles, and baseline permissions.
- `0003_staging_demo_identities.sql`: staging-only fictional Parent and Leadership seed records.
- `0004_onboarding_idempotency.sql`: unique active guardian and open-request protections.
- `0005_approval_idempotency.sql`: unique active membership-role and approval-audit protections.

Applied only to staging D1 `scouthq-identity-staging` (`5261a2b5-3c86-46f3-ab74-cef5f19534ae`).
