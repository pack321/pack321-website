# Authentication Flow

Google IdP → Cloudflare Access → verified Access JWT → provider-subject reconciliation → ScoutHQ user → revocable ScoutHQ application session → D1 membership, roles, and household authorization → Parent or Leadership My Day.

Normal Sign out revokes the D1 session and clears the ScoutHQ cookie. Switch account additionally uses the supported Cloudflare Access logout endpoint. Both flows passed real-browser validation.

No password or OAuth token is stored. Authorization is reloaded from D1 on every request, so the Parent session resolved its newly approved membership and role without retaining stale pending authorization.
