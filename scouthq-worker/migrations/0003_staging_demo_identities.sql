INSERT INTO users(id,primary_email,email_verified,display_name,account_status,onboarding_status) VALUES
('usr-demo-leadership','jasonjgriffin@gmail.com',1,'Jason Griffin','active','complete'),
('usr-demo-parent','wicubscoutpack321@gmail.com',1,'Jordan Taylor','active','complete');
INSERT INTO organization_memberships(id,user_id,organization_id,status,approved_at) VALUES
('mem-demo-leadership','usr-demo-leadership','org-pack-321','approved',CURRENT_TIMESTAMP),
('mem-demo-parent','usr-demo-parent','org-pack-321','approved',CURRENT_TIMESTAMP);
INSERT INTO membership_roles(id,membership_id,role_id,assigned_by_user_id) VALUES
('mr-demo-chair','mem-demo-leadership','role-chair','usr-demo-leadership'),
('mr-demo-cubmaster','mem-demo-leadership','role-cubmaster','usr-demo-leadership'),
('mr-demo-treasurer','mem-demo-leadership','role-treasurer','usr-demo-leadership'),
('mr-demo-campaign','mem-demo-leadership','role-campaign-admin','usr-demo-leadership'),
('mr-demo-parent','mem-demo-parent','role-parent','usr-demo-leadership');
INSERT INTO households(id,organization_id,display_name,status) VALUES('hh-demo-taylor','org-pack-321','Taylor Household','active');
INSERT INTO household_members(id,household_id,user_id,relationship,primary_guardian) VALUES('hm-demo-parent','hh-demo-taylor','usr-demo-parent','guardian',1);
INSERT INTO dependents(id,household_id,display_name,status,fictional_demo) VALUES('dep-demo-riley','hh-demo-taylor','Riley Taylor','active',1),('dep-demo-casey','hh-demo-taylor','Casey Taylor','active',1);
INSERT INTO audit_events(id,organization_id,actor_user_id,action,target_type,target_id,details_json) VALUES
('aud-demo-leadership-seed','org-pack-321',NULL,'staging.demo_identity_seeded','user','usr-demo-leadership','{"fictionalDataOnly":true}'),
('aud-demo-parent-seed','org-pack-321',NULL,'staging.demo_identity_seeded','user','usr-demo-parent','{"fictionalDataOnly":true}');
