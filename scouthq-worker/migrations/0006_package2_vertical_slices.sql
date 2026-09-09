INSERT OR IGNORE INTO role_permissions(role_id, permission_key) VALUES
('role-parent', 'communications.read.family'),
('role-parent', 'fundraising.read.own'),
('role-chair', 'calendar.read.organization'),
('role-chair', 'communications.read.organization'),
('role-cubmaster', 'calendar.read.organization'),
('role-cubmaster', 'communications.read.organization');

INSERT OR IGNORE INTO dependents(id, household_id, display_name, status, fictional_demo)
SELECT 'dep-griffin-ava', id, 'Ava Griffin', 'active', 1
FROM households WHERE display_name='Griffin Family' LIMIT 1;

INSERT OR IGNORE INTO dependents(id, household_id, display_name, status, fictional_demo)
SELECT 'dep-griffin-miles', id, 'Miles Griffin', 'active', 1
FROM households WHERE display_name='Griffin Family' LIMIT 1;
