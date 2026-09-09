# ScoutHQ P0 Auth Report

Package 1 authentication, identity, onboarding, approval, and authorization validation passed on 2026-08-08.

## Real-browser results

- Leadership Google/Cloudflare Access authentication: PASS
- ScoutHQ application session creation and refresh persistence: PASS
- Normal logout: PASS
- Switch account / Cloudflare Access logout: PASS
- New Parent identity authentication and onboarding: PASS
- Griffin Family creation: PASS
- Access-request submission and pending state: PASS
- Leadership pending-queue visibility, exactly once: PASS
- Leadership approval transition: PASS
- Approved Parent / Guardian experience: PASS
- Parent request to `/leadership/approvals`: DENIED with branded safe error and correlation ID

## Final staging state

Staging D1 contains exactly one Parent user, one auth identity, one Griffin Family household, one active guardian relationship, one approved Pack 321 membership, one active Parent / Guardian role, one preserved approved access request, one submission audit event, and one approval audit event. Leadership remains approved with the `committee_chair`, `cubmaster`, `treasurer`, and `campaign_admin` roles.

Active staging Worker version: `993d6c6a-d9b7-4aba-bbe9-ee7120a8fc17`.

Production `hq.pack321wi.org` was not modified and remains protected by its existing Cloudflare Access application.

Package 1 status: PASS. Package 2 may begin only under a separate approved request.
