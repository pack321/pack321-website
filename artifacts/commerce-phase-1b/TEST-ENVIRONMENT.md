# Test Environment

Configured names:

- Worker: `pack321-storefront-api-test`
- D1: `pack321-storefront-commerce-test`
- D1 UUID: `4f8c972a-4353-4444-b442-a7660d1a8167`
- Worker version: `6b7d0b9a-53b9-498e-9ee3-e9945978f506`
- Worker URL: `https://pack321-storefront-api-test.wicubscoutpack321.workers.dev`
- Wrangler environment: `test-commerce`
- Commerce mode: `test`

Public preview uses an empty API base and remains unchanged. Production commerce is explicitly disabled and has no D1 binding.

The test D1 and Worker are provisioned. The D1 contains the validated schema plus 10 campaigns and 48 canonical products. Stripe `sk_test_...`, test webhook secret, approved Pages preview/test origin, Access team domain, and Access audience are still required. Never configure these values in the public-preview or production-disabled environments.

Safety validation: health `200`; checkout `503`; admin `403`; configured Worker secrets `[]`.
