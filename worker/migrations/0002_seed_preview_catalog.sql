INSERT INTO campaigns(id,name,status,visibility,starts_at,ends_at,pickup_required) VALUES
('wreaths-2026','2026 Holiday Wreath Fundraiser','active','public','2026-01-01','2026-11-01',1),
('popcorn-2026','2026 Popcorn Fundraiser','scheduled','public','2026-09-15','2026-10-31',1),
('wreaths-2025-closed','2025 Holiday Wreath Fundraiser','closed','public','2025-09-01','2025-11-01',0);
INSERT INTO products(id,campaign_id,name,description,unit_amount,currency,active,inventory_mode,inventory_quantity,pickup_required) VALUES
('classic-holiday-wreath','wreaths-2026','Classic Holiday Wreath','Fresh holiday wreath supporting Pack 321.',3500,'usd',1,'preorder',NULL,1),
('holiday-door-swag','wreaths-2026','Holiday Door Swag','Fresh seasonal greenery supporting Pack 321.',2800,'usd',1,'preorder',NULL,1),
('pack-321-donation',NULL,'Pack 321 Donation','General Pack 321 support.',2500,'usd',1,'unlimited',NULL,0);
INSERT INTO product_options(product_id,option_id,value_id,label,required) VALUES ('holiday-door-swag','style','traditional-bow','Traditional bow',1),('holiday-door-swag','style','plaid-bow','Plaid bow',1);
INSERT INTO pickup_locations(id,name,active) VALUES ('carollton-elementary','Carollton Elementary School',1);
INSERT INTO campaign_pickup_locations(campaign_id,pickup_location_id) VALUES ('wreaths-2026','carollton-elementary');
INSERT INTO public_scout_profiles(fundraising_code,public_display_name,active,visibility,guardian_approved) VALUES ('AB12CD','Emily G.',1,'public',1),('ZZ99ZZ','Unavailable',0,'private',0);
INSERT INTO scout_campaigns(fundraising_code,campaign_id,active) VALUES ('AB12CD','wreaths-2026',1),('AB12CD','popcorn-2026',1);
