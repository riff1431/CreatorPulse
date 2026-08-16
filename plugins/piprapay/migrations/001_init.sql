-- PipraPay Database Schema Initialization
CREATE TABLE IF NOT EXISTS cp_plugin_piprapay_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL UNIQUE,
  amount NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'BDT',
  status VARCHAR(30) NOT NULL DEFAULT 'Pending',
  gateway_reference TEXT,
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_piprapay_order_id ON cp_plugin_piprapay_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_piprapay_status ON cp_plugin_piprapay_transactions(status);
