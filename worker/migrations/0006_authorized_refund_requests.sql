CREATE TABLE refund_requests (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id),
  requested_by TEXT NOT NULL,
  category TEXT NOT NULL,
  merchandise_refund_amount INTEGER NOT NULL,
  scout_eligible_refund_amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_refund_id TEXT,
  error_code TEXT,
  created_at TEXT NOT NULL,
  processed_at TEXT,
  UNIQUE(order_id, category, merchandise_refund_amount, reason)
);

CREATE INDEX idx_refund_requests_pending
  ON refund_requests(status, created_at);
