# Package 1 Final Evidence

Validated 2026-08-08 against `staging-hq.pack321wi.org` and D1 `scouthq-identity-staging`.

| Evidence | Result |
|---|---|
| Leadership authentication | PASS |
| Application session and refresh | PASS |
| Normal logout | PASS |
| Switch account | PASS |
| Parent/new identity authentication | PASS |
| Griffin Family onboarding | PASS |
| Access request and pending state | PASS |
| Leadership queue visibility exactly once | PASS |
| Leadership approval | PASS |
| Parent role assignment from D1 | PASS |
| Approved Parent experience | PASS |
| Parent denied `/leadership/approvals` | PASS |

## D1 integrity

All required Griffin Family counts equal exactly one: Parent user, auth identity, household, active guardian relationship, approved Pack 321 membership, active Parent / Guardian role, approved historical access request, submission audit, and approval audit. Household status is active; Parent onboarding is complete; request reviewer and reviewed timestamp are present.

Leadership membership remains approved with four active roles: `committee_chair`, `cubmaster`, `treasurer`, and `campaign_admin`.

No unexpected duplicates were found. No valid history was removed or altered during final verification.

## Isolation

Staging Worker version `993d6c6a-d9b7-4aba-bbe9-ee7120a8fc17` is active at 100%. Production `hq.pack321wi.org` remains unchanged and protected by Cloudflare Access.
