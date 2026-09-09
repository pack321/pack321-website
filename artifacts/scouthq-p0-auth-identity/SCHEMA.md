# Schema

Normalized tables: `users`, `auth_identities`, `organizations`, `organization_memberships`, `roles`, `role_permissions`, `membership_roles`, `households`, `household_members`, `dependents`, `access_requests`, `invitations`, `onboarding_sessions`, `application_sessions`, and append-only `audit_events`. Email is unique metadata, never a primary key. Authentication identities use provider subject identifiers.
