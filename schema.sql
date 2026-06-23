-- DineFlow Database Schema (SQLite Format)

-- Tables
CREATE TABLE IF NOT EXISTS tables (
    id TEXT PRIMARY KEY,
    qr_code TEXT UNIQUE,
    status TEXT DEFAULT 'Free'
);

-- Sessions
CREATE TABLE IF NOT EXISTS table_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_id TEXT,
    open_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    closed_time DATETIME,
    FOREIGN KEY(table_id) REFERENCES tables(id)
);

-- Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    kitchen_station TEXT,
    available BOOLEAN DEFAULT 1
);

-- Orders 
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    batch_id TEXT NOT NULL,
    table_id TEXT,
    item_id TEXT,
    qty INTEGER DEFAULT 1,
    status TEXT DEFAULT 'New',
    FOREIGN KEY(table_id) REFERENCES tables(id),
    FOREIGN KEY(item_id) REFERENCES menu_items(id)
);

-- Bills
CREATE TABLE IF NOT EXISTS bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_id TEXT,
    subtotal REAL NOT NULL,
    tax REAL NOT NULL,
    paid BOOLEAN DEFAULT 0,
    FOREIGN KEY(table_id) REFERENCES tables(id)
);
