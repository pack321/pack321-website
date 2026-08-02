CREATE TABLE inventory_reservations (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id),
  product_id TEXT NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('reserved','committed','released')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX idx_inventory_reservations_product_status ON inventory_reservations(product_id,status);
