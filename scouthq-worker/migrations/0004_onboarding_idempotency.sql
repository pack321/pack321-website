CREATE UNIQUE INDEX IF NOT EXISTS idx_household_members_one_active_primary_guardian
ON household_members(user_id)
WHERE active = 1 AND primary_guardian = 1;

CREATE UNIQUE INDEX IF NOT EXISTS idx_access_requests_one_open_per_user_org
ON access_requests(requester_user_id, organization_id)
WHERE status IN ('pending', 'correction_requested');
