ALTER TABLE refunds ADD COLUMN category TEXT CHECK(category IN ('customer_requested_full','customer_requested_partial','pack_cancellation','pack_unfulfillable','pack_duplicate','pack_error','external_reconciliation'));
ALTER TABLE refunds ADD COLUMN cumulative_refund_amount INTEGER NOT NULL DEFAULT 0;
ALTER TABLE refunds ADD COLUMN attribution_adjustment_amount INTEGER NOT NULL DEFAULT 0;
ALTER TABLE refunds ADD COLUMN details_json TEXT NOT NULL DEFAULT '{}';
CREATE INDEX idx_refunds_category ON refunds(order_id,category);
