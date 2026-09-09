PRAGMA foreign_keys = ON;

CREATE TABLE campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  campaign_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('draft','scheduled','active','pricing-pending','closed','unavailable')),
  visibility TEXT NOT NULL,
  starts_at TEXT,
  ends_at TEXT,
  fulfillment_promise TEXT,
  pickup_instructions TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id TEXT PRIMARY KEY,
  campaign_id TEXT REFERENCES campaigns(id),
  name TEXT NOT NULL,
  sku TEXT,
  description TEXT,
  unit_amount INTEGER NOT NULL CHECK(unit_amount>=0),
  currency TEXT NOT NULL DEFAULT 'usd',
  price_status TEXT NOT NULL CHECK(price_status IN ('approved','pending')),
  active INTEGER NOT NULL DEFAULT 0,
  fulfillment_type TEXT NOT NULL CHECK(fulfillment_type IN ('local-pickup','program-direct-shipment','ceremony-placement','none')),
  inventory_mode TEXT NOT NULL CHECK(inventory_mode IN ('none','unlimited','preorder','tracked','sold_out')),
  inventory_quantity INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE product_options (product_id TEXT NOT NULL REFERENCES products(id), option_id TEXT NOT NULL, value_id TEXT NOT NULL, label TEXT NOT NULL, required INTEGER NOT NULL DEFAULT 0, active INTEGER NOT NULL DEFAULT 1, PRIMARY KEY(product_id,option_id,value_id));
CREATE TABLE pickup_locations (id TEXT PRIMARY KEY, name TEXT NOT NULL, instructions TEXT, active INTEGER NOT NULL DEFAULT 1);
CREATE TABLE campaign_pickup_locations (campaign_id TEXT NOT NULL REFERENCES campaigns(id), pickup_location_id TEXT NOT NULL REFERENCES pickup_locations(id), PRIMARY KEY(campaign_id,pickup_location_id));
CREATE TABLE public_scout_profiles (fundraising_code TEXT PRIMARY KEY, public_display_name TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 0, visibility TEXT NOT NULL, guardian_approved INTEGER NOT NULL DEFAULT 0, expires_at TEXT);
CREATE TABLE scout_campaigns (fundraising_code TEXT NOT NULL REFERENCES public_scout_profiles(fundraising_code), campaign_id TEXT NOT NULL REFERENCES campaigns(id), active INTEGER NOT NULL DEFAULT 1, PRIMARY KEY(fundraising_code,campaign_id));

CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  checkout_fingerprint TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK(status IN ('pending','checkout_created','paid','payment_failed','cancelled','refunded','partially_refunded','payment-reconciliation-required')),
  payment_status TEXT NOT NULL CHECK(payment_status IN ('unpaid','pending','paid','failed','partially_refunded','refunded','reconciliation_required')),
  fulfillment_status TEXT NOT NULL CHECK(fulfillment_status IN ('not_required','awaiting_campaign_close','ordered_from_vendor','ready_for_pickup','partially_completed','completed','reconciliation_required')),
  campaign_id TEXT,
  campaign_name TEXT,
  campaign_type TEXT,
  currency TEXT NOT NULL,
  subtotal_amount INTEGER NOT NULL,
  tax_amount INTEGER NOT NULL DEFAULT 0,
  customer_fee_amount INTEGER NOT NULL DEFAULT 300,
  gross_amount INTEGER NOT NULL,
  stripe_fee_amount INTEGER NOT NULL DEFAULT 0,
  refund_amount INTEGER NOT NULL DEFAULT 0,
  net_amount INTEGER NOT NULL,
  scout_credit_amount INTEGER NOT NULL DEFAULT 0,
  customer_first_name TEXT NOT NULL,
  customer_last_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_email_normalized TEXT NOT NULL,
  customer_phone TEXT,
  pickup_location_id TEXT,
  pickup_location_name TEXT,
  pickup_instructions TEXT,
  attribution_type TEXT NOT NULL CHECK(attribution_type IN ('scout','pack')),
  scout_attribution_ref TEXT,
  attribution_display_text TEXT NOT NULL,
  attribution_source TEXT NOT NULL,
  source_page TEXT,
  stripe_session_id TEXT UNIQUE,
  stripe_checkout_url TEXT,
  stripe_session_expires_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  paid_at TEXT,
  completed_at TEXT
);
CREATE INDEX idx_orders_email ON orders(customer_email_normalized);
CREATE INDEX idx_orders_campaign_status ON orders(campaign_id,status);
CREATE INDEX idx_orders_fulfillment ON orders(fulfillment_status);

CREATE TABLE order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id),
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_sku TEXT,
  unit_amount INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  line_amount INTEGER NOT NULL,
  fulfillment_type TEXT NOT NULL CHECK(fulfillment_type IN ('local-pickup','program-direct-shipment','ceremony-placement','none')),
  campaign_id TEXT,
  campaign_name TEXT,
  campaign_type TEXT,
  campaign_fulfillment_promise TEXT,
  pickup_location_id TEXT,
  pickup_location_name TEXT,
  pickup_instructions TEXT,
  scout_credit_eligible INTEGER NOT NULL DEFAULT 0,
  scout_credit_amount INTEGER NOT NULL DEFAULT 0,
  option_ids_json TEXT NOT NULL DEFAULT '[]'
);

CREATE TABLE payment_attempts (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id),
  request_fingerprint TEXT NOT NULL UNIQUE,
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('creating','open','succeeded','failed','expired','reconciliation_required')),
  failure_code TEXT,
  failure_category TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  succeeded_at TEXT
);
CREATE INDEX idx_payment_attempts_order ON payment_attempts(order_id,created_at);

CREATE TABLE refunds (
  id TEXT PRIMARY KEY,
  stripe_refund_id TEXT NOT NULL UNIQUE,
  order_id TEXT NOT NULL REFERENCES orders(id),
  amount INTEGER NOT NULL CHECK(amount>0),
  eligible_merchandise_amount INTEGER NOT NULL DEFAULT 0,
  customer_fee_refund_amount INTEGER,
  reason TEXT,
  actor TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX idx_refunds_order ON refunds(order_id,created_at);

CREATE TABLE scout_attribution (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id),
  fundraising_code TEXT,
  attribution_type TEXT NOT NULL CHECK(attribution_type IN ('scout','pack')),
  display_text TEXT NOT NULL,
  source_page TEXT,
  corrected_from_code TEXT,
  correction_reason TEXT,
  corrected_by TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX idx_attribution_code ON scout_attribution(fundraising_code);

CREATE TABLE attribution_adjustments (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id),
  attribution_id TEXT NOT NULL REFERENCES scout_attribution(id),
  refund_id TEXT NOT NULL REFERENCES refunds(id),
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  actor TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE fulfillment_events (id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id), from_status TEXT, to_status TEXT NOT NULL, actor TEXT NOT NULL, note TEXT, created_at TEXT NOT NULL);
CREATE TABLE order_audit_log (id TEXT PRIMARY KEY, order_id TEXT, action TEXT NOT NULL, actor TEXT NOT NULL, reason TEXT, details_json TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL);
CREATE TABLE stripe_events (stripe_event_id TEXT PRIMARY KEY, event_type TEXT NOT NULL, processing_status TEXT NOT NULL CHECK(processing_status IN ('claimed','processed','ignored','failed')), received_at TEXT NOT NULL, processed_at TEXT, result TEXT);
CREATE TABLE email_events (id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id), event_type TEXT NOT NULL, idempotency_key TEXT NOT NULL UNIQUE, payload_json TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', created_at TEXT NOT NULL, sent_at TEXT);
