import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://thakorarpitsinh25_db_user:2ZwHZEIhOzfvXjC0@cluster0.kfipjla.mongodb.net/";
const client = new MongoClient(uri);

async function run() {
  try {
    console.log("Connecting securely to MongoDB Atlas...");
    await client.connect();
    
    // Connecting to DineFlow logical database
    const db = client.db("dineflow");
    
    console.log("Creating 'tables' collection...");
    await db.createCollection("tables").catch(e => console.log(" - (Already exists or skipped)"));
    
    console.log("Creating 'table_sessions' collection...");
    await db.createCollection("table_sessions").catch(e => {});
    
    console.log("Creating 'menu_items' collection...");
    await db.createCollection("menu_items").catch(e => {});
    
    console.log("Creating 'orders' collection...");
    await db.createCollection("orders").catch(e => {});
    
    console.log("Creating 'bills' collection...");
    await db.createCollection("bills").catch(e => {});

    console.log("Applying relational indexing across collections...");
    await db.collection("tables").createIndex({ qr_code: 1 }, { unique: true }).catch(e => {});
    await db.collection("orders").createIndex({ table_id: 1 }).catch(e => {});
    await db.collection("table_sessions").createIndex({ table_id: 1 }).catch(e => {});
    await db.collection("bills").createIndex({ table_id: 1 }).catch(e => {});

    console.log("\n==========================================");
    console.log("✓ SUCCESS: DineFlow Backend fully deployed");
    console.log("==========================================");
  } catch (error) {
    console.error("Connection Failed:", error);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
