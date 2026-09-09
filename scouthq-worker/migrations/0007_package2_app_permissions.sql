INSERT OR IGNORE INTO role_permissions(role_id, permission_key) VALUES
('role-chair', 'activities.read'),
('role-chair', 'achievements.read'),
('role-chair', 'families.read'),
('role-chair', 'reports.read'),
('role-chair', 'campaigns.manage'),
('role-cubmaster', 'activities.read'),
('role-cubmaster', 'achievements.read'),
('role-campaign-admin', 'fundraising.read.organization');
