// init-mongo.js
// MongoDB Initialization Script for DineFlow
use dineflow;

// Create collections explicitly
db.createCollection("tables");
db.createCollection("table_sessions");
db.createCollection("menu_items");
db.createCollection("orders");
db.createCollection("bills");

// Create optimizing indexes for relational speed
db.tables.createIndex({ qr_code: 1 }, { unique: true });
db.orders.createIndex({ table_id: 1 });
db.table_sessions.createIndex({ table_id: 1 });
db.bills.createIndex({ table_id: 1 });

print("✓ DineFlow Collections created successfully in MongoDB!");
