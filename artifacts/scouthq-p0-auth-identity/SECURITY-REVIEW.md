# Security Review

- Cloudflare Access authentication and ScoutHQ authorization remain separate.
- Access JWT signature, issuer, audience, subject, and email claims are verified server-side.
- ScoutHQ application sessions are opaque, hashed in D1, revocable, and issued with `Secure`, `HttpOnly`, and `SameSite=Lax` cookies.
- Membership, roles, permissions, organization, and household scope load from D1 on every request.
- Approval requires the authenticated server-derived `access_requests.review` permission.
- Approval never trusts email, browser role values, or Cloudflare membership as ScoutHQ authorization.
- Parent household access is scoped to the linked household.
- Parent access to `/leadership/approvals` was denied in a real browser with a branded safe error and correlation ID.
- Submission and approval actors are server-derived; audit events are preserved.
- Structured logs exclude JWTs, cookies, tokens, secrets, and sensitive identity data.
- Production was not deployed, migrated, or reconfigured.

Package 1 security validation: PASS.
