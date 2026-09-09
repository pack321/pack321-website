CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id),
  stripe_payment_intent_id TEXT NOT NULL UNIQUE,
  stripe_charge_id TEXT,
  stripe_balance_transaction_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('succeeded','reconciliation_required')),
  card_brand TEXT,
  card_last4 TEXT,
  funding_type TEXT,
  stripe_fee_amount INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id, created_at);

CREATE TABLE IF NOT EXISTS finance_posting_references (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE REFERENCES orders(id),
  posting_key TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK(status IN ('pending','posted','reconciliation_required')),
  merchandise_amount INTEGER NOT NULL,
  convenience_fee_amount INTEGER NOT NULL,
  stripe_fee_amount INTEGER NOT NULL,
  refund_amount INTEGER NOT NULL DEFAULT 0,
  net_amount INTEGER NOT NULL,
  scout_credit_amount INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_finance_posting_status ON finance_posting_references(status, updated_at);
