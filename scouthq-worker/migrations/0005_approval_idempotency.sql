CREATE UNIQUE INDEX IF NOT EXISTS idx_membership_roles_one_active_role
ON membership_roles(membership_id, role_id)
WHERE active = 1;

CREATE UNIQUE INDEX IF NOT EXISTS idx_audit_one_approval_per_request
ON audit_events(target_id, action)
WHERE action = 'access_request.approved';
