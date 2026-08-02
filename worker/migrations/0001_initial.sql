PRAGMA foreign_keys = ON;

CREATE TABLE campaigns (id TEXT PRIMARY KEY, name TEXT NOT NULL, status TEXT NOT NULL CHECK(status IN ('active','scheduled','closed','archived')), visibility TEXT NOT NULL, starts_at TEXT, ends_at TEXT, pickup_required INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE products (id TEXT PRIMARY KEY, campaign_id TEXT REFERENCES campaigns(id), name TEXT NOT NULL, description TEXT, unit_amount INTEGER NOT NULL CHECK(unit_amount>=0), currency TEXT NOT NULL DEFAULT 'usd', active INTEGER NOT NULL DEFAULT 1, inventory_mode TEXT NOT NULL CHECK(inventory_mode IN ('unlimited','preorder','tracked','sold_out')), inventory_quantity INTEGER, pickup_required INTEGER NOT NULL DEFAULT 0, stripe_product_id TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE product_options (product_id TEXT NOT NULL REFERENCES products(id), option_id TEXT NOT NULL, value_id TEXT NOT NULL, label TEXT NOT NULL, required INTEGER NOT NULL DEFAULT 0, active INTEGER NOT NULL DEFAULT 1, PRIMARY KEY(product_id,option_id,value_id));
CREATE TABLE pickup_locations (id TEXT PRIMARY KEY, name TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1);
CREATE TABLE campaign_pickup_locations (campaign_id TEXT NOT NULL REFERENCES campaigns(id), pickup_location_id TEXT NOT NULL REFERENCES pickup_locations(id), PRIMARY KEY(campaign_id,pickup_location_id));
CREATE TABLE public_scout_profiles (fundraising_code TEXT PRIMARY KEY, public_display_name TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 0, visibility TEXT NOT NULL, guardian_approved INTEGER NOT NULL DEFAULT 0, expires_at TEXT);
CREATE TABLE scout_campaigns (fundraising_code TEXT NOT NULL REFERENCES public_scout_profiles(fundraising_code), campaign_id TEXT NOT NULL REFERENCES campaigns(id), active INTEGER NOT NULL DEFAULT 1, PRIMARY KEY(fundraising_code,campaign_id));

CREATE TABLE orders (
  id TEXT PRIMARY KEY, order_number TEXT NOT NULL UNIQUE, status TEXT NOT NULL CHECK(status IN ('pending','checkout_created','paid','payment_failed','cancelled','refunded','partially_refunded')),
  fulfillment_status TEXT NOT NULL CHECK(fulfillment_status IN ('not_required','awaiting_campaign_close','ordered_from_vendor','ready_for_pickup','picked_up')),
  campaign_id TEXT REFERENCES campaigns(id), currency TEXT NOT NULL, subtotal_amount INTEGER NOT NULL, total_amount INTEGER NOT NULL,
  customer_first_name TEXT NOT NULL, customer_last_name TEXT NOT NULL, customer_email TEXT NOT NULL, customer_email_normalized TEXT NOT NULL, customer_phone TEXT NOT NULL,
  pickup_location_id TEXT REFERENCES pickup_locations(id), attribution_source TEXT NOT NULL, source_page TEXT, checkout_key TEXT NOT NULL UNIQUE,
  stripe_session_id TEXT UNIQUE, stripe_checkout_url TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, paid_at TEXT
);
CREATE INDEX idx_orders_email ON orders(customer_email_normalized);
CREATE INDEX idx_orders_campaign_status ON orders(campaign_id,status);
CREATE INDEX idx_orders_fulfillment ON orders(fulfillment_status);

CREATE TABLE order_items (id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id), product_id TEXT NOT NULL REFERENCES products(id), product_name TEXT NOT NULL, unit_amount INTEGER NOT NULL, quantity INTEGER NOT NULL, line_amount INTEGER NOT NULL, option_ids_json TEXT NOT NULL DEFAULT '[]');
CREATE TABLE payments (id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id), provider TEXT NOT NULL DEFAULT 'stripe', stripe_event_id TEXT UNIQUE, stripe_payment_intent_id TEXT, amount INTEGER NOT NULL, currency TEXT NOT NULL, status TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE scout_attribution (id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id), fundraising_code TEXT, attribution_type TEXT NOT NULL CHECK(attribution_type IN ('scout','pack')), source_page TEXT, corrected_from_code TEXT, correction_reason TEXT, corrected_by TEXT, created_at TEXT NOT NULL);
CREATE INDEX idx_attribution_code ON scout_attribution(fundraising_code);
CREATE TABLE fulfillment_events (id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id), from_status TEXT, to_status TEXT NOT NULL, actor TEXT NOT NULL, note TEXT, created_at TEXT NOT NULL);
CREATE TABLE order_audit_log (id TEXT PRIMARY KEY, order_id TEXT, action TEXT NOT NULL, actor TEXT NOT NULL, reason TEXT, details_json TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL);
CREATE TABLE stripe_events (stripe_event_id TEXT PRIMARY KEY, event_type TEXT NOT NULL, received_at TEXT NOT NULL);
