-- Supabase DineFlow Database Schema
-- You can paste this entirely into the Supabase 'SQL Editor'

CREATE TABLE IF NOT EXISTS tables (
    id TEXT PRIMARY KEY,
    qr_code TEXT UNIQUE,
    status TEXT DEFAULT 'Free'
);

CREATE TABLE IF NOT EXISTS table_sessions (
    id SERIAL PRIMARY KEY,
    table_id TEXT REFERENCES tables(id),
    open_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_time TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menu_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    kitchen_station TEXT,
    available BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    batch_id TEXT NOT NULL,
    table_id TEXT REFERENCES tables(id),
    item_id TEXT REFERENCES menu_items(id),
    qty INTEGER DEFAULT 1,
    status TEXT DEFAULT 'New',
    notes TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bills (
    id SERIAL PRIMARY KEY,
    table_id TEXT REFERENCES tables(id),
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) NOT NULL,
    paid BOOLEAN DEFAULT false
);

-- Insert dummy Table 12 to ensure the frontend has data immediately
INSERT INTO tables (id, qr_code, status) VALUES ('T-12', 'QR-T12-DEMO', 'active')
ON CONFLICT (id) DO NOTHING;

-- ENABLE LIVE DASHBOARD SYNC (Very Important!)
begin;
  -- remove the supabase_realtime publication
  drop publication if exists supabase_realtime;
  -- re-create the supabase_realtime publication with no tables
  create publication supabase_realtime;
commit;
-- add tables to the publication
alter publication supabase_realtime add table tables, orders, table_sessions, bills;
