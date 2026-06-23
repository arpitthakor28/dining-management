import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PDFDocument from 'pdfkit';
import { v4 as uuidv4 } from 'uuid';
import { connectDb, getDb, managerStorage } from './database.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'dineflow_secret_key_123';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Scoping middleware (verifies JWT or extracts x-restaurant-id)
app.use((req, res, next) => {
  const authHeader = req.headers['authorization'];
  const restaurantIdHeader = req.headers['x-restaurant-id'] || req.query.restaurantId;
  
  let restaurantId = restaurantIdHeader;
  let role = 'guest';
  let userId = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      restaurantId = decoded.restaurantId;
      role = decoded.role;
      userId = decoded.userId;
    } catch (err) {
      console.warn('[Auth Middleware] Invalid token:', err.message);
    }
  }

  if (restaurantId) {
    managerStorage.run({ restaurantId, role, userId }, () => {
      next();
    });
  } else {
    next();
  }
});

// Ensure receipts directory exists
const receiptsDir = path.join(__dirname, 'receipts');
if (!fs.existsSync(receiptsDir)) {
  fs.mkdirSync(receiptsDir, { recursive: true });
}

// Serve receipts as static files (accessible by manager)
app.use('/receipts', express.static(receiptsDir));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  const restaurantId = socket.handshake.query.restaurantId;
  if (restaurantId) {
    socket.join(`restaurant:${restaurantId}`);
    console.log(`Socket ${socket.id} joined restaurant room: restaurant:${restaurantId}`);
  }

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const emitToRestaurant = (event, data) => {
  const store = managerStorage.getStore();
  const restaurantId = store?.restaurantId;
  if (restaurantId) {
    io.to(`restaurant:${restaurantId}`).emit(event, data);
  } else {
    io.emit(event, data);
  }
};

// Initialize Database connection
await connectDb();

// Helper to get collections
const getCollections = () => {
  const db = getDb();
  return {
    tables: db.collection("tables"),
    sessions: db.collection("sessions"),
    menuItems: db.collection("menu_items"),
    orders: db.collection("orders"),
    helpRequests: db.collection("help_requests"),
    bills: db.collection("bills")
  };
};

// -------------------------------------------------------------
// AUTHENTICATION ENDPOINTS
// -------------------------------------------------------------

// Sign Up a new Restaurant (creates a manager and kitchen account)
app.post('/api/auth/signup', async (req, res) => {
  const { restaurantName, email, password } = req.body;
  if (!restaurantName || !email || !password) {
    return res.status(400).json({ error: 'Missing restaurantName, email, or password' });
  }

  try {
    const db = getDb();
    const usersCol = db.collection('users');

    const existingUser = await usersCol.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const restaurantId = 'r_' + uuidv4().substring(0, 8);

    // Insert manager user
    const managerUser = {
      _id: 'U-' + uuidv4().substring(0, 8).toUpperCase(),
      email: email.toLowerCase(),
      password: password,
      role: 'manager',
      restaurant_id: restaurantId,
      restaurant_name: restaurantName
    };
    await usersCol.insertOne(managerUser);

    // Auto-generate kitchen user
    const kitchenUser = {
      _id: 'U-' + uuidv4().substring(0, 8).toUpperCase(),
      email: `kitchen@${restaurantId}.com`,
      password: 'kitchen123',
      role: 'kitchen',
      restaurant_id: restaurantId,
      restaurant_name: restaurantName
    };
    await usersCol.insertOne(kitchenUser);

    const token = jwt.sign(
      { userId: managerUser._id, restaurantId, role: 'manager' },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      token,
      restaurantId,
      role: 'manager',
      email: managerUser.email,
      restaurantName
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// Log In as Manager or Kitchen staff
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }

  try {
    const db = getDb();
    const usersCol = db.collection('users');

    const user = await usersCol.findOne({ email: email.toLowerCase() });
    if (!user || user.password !== password) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user._id, restaurantId: user.restaurant_id, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      restaurantId: user.restaurant_id,
      role: user.role,
      email: user.email
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// -------------------------------------------------------------
// REST API ENDPOINTS
// -------------------------------------------------------------

// Validate Table QR Code / Token & Handle automatic session start
app.get('/api/tables/validate', async (req, res) => {
  const { tableId, token } = req.query;
  if (!tableId || !token) {
    return res.status(400).json({ error: 'Missing tableId or token' });
  }

  try {
    const cols = getCollections();
    const table = await cols.tables.findOne({ id: tableId });
    if (!table) {
      return res.status(404).json({ error: 'Table not found' });
    }

    if (table.qr_code_token !== token) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    let sessionId = table.current_session_id;

    // If table status is 'empty' or current_session_id is null, automatically start a new session
    if (table.status === 'empty' || !sessionId) {
      sessionId = `S-${uuidv4().substring(0, 8).toUpperCase()}`;
      
      // Insert new session
      await cols.sessions.insertOne({
        id: sessionId,
        table_id: tableId,
        status: 'open',
        comments: null,
        created_at: new Date()
      });

      // Update table status
      await cols.tables.updateOne(
        { id: tableId },
        { $set: { status: 'active', current_session_id: sessionId } }
      );

      console.log(`Started new session ${sessionId} for table ${tableId}`);
      emitToRestaurant('tables_updated');
    }

    res.json({
      valid: true,
      tableId,
      tableNumber: table.table_number,
      sessionId,
      status: table.status
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Fetch all tables (Manager Dashboard with Session Comments Joined)
app.get('/api/tables', async (req, res) => {
  try {
    const cols = getCollections();
    const tablesList = await cols.tables.find().toArray();
    const sessionsList = await cols.sessions.find().toArray();
    const sessionsMap = new Map(sessionsList.map(s => [s.id, s]));

    const result = tablesList.map(t => ({
      id: t.id,
      table_number: t.table_number,
      qr_code_token: t.qr_code_token,
      status: t.status,
      current_session_id: t.current_session_id,
      comments: t.current_session_id ? (sessionsMap.get(t.current_session_id)?.comments || null) : null
    }));
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new table (Manager dynamic table config)
app.post('/api/tables', async (req, res) => {
  const { tableNumber } = req.body;
  if (!tableNumber) {
    return res.status(400).json({ error: 'Missing tableNumber' });
  }

  const tableId = `T-${tableNumber}`;
  const token = uuidv4().substring(0, 12); // unique token for QR link

  try {
    const cols = getCollections();
    const existing = await cols.tables.findOne({ id: tableId });
    if (existing) {
      return res.status(400).json({ error: `Table ${tableNumber} already exists` });
    }

    await cols.tables.insertOne({
      id: tableId,
      table_number: tableNumber,
      qr_code_token: token,
      status: 'empty',
      current_session_id: null
    });

    emitToRestaurant('tables_updated');
    res.status(201).json({ id: tableId, tableNumber, qrCodeToken: token });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a table (Manager dynamic table config)
app.delete('/api/tables/:tableId', async (req, res) => {
  const { tableId } = req.params;
  try {
    const cols = getCollections();
    await cols.tables.deleteOne({ id: tableId });
    emitToRestaurant('tables_updated');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Fetch menu (supports returning all items for manager)
app.get('/api/menu', async (req, res) => {
  const { all } = req.query;
  try {
    const cols = getCollections();
    const filter = all === 'true' ? {} : { available: true };
    const items = await cols.menuItems.find(filter).toArray();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add new menu item (Manager Dashboard)
app.post('/api/menu', async (req, res) => {
  const { name, price, category } = req.body;
  if (!name || price === undefined || !category) {
    return res.status(400).json({ error: 'Missing name, price, or category' });
  }
  const cleanId = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  try {
    const cols = getCollections();
    const existing = await cols.menuItems.findOne({ id: cleanId });
    if (existing) {
      return res.status(400).json({ error: 'Item already exists' });
    }
    const newItem = {
      id: cleanId,
      name,
      price: parseFloat(price),
      category,
      available: true
    };
    await cols.menuItems.insertOne(newItem);
    emitToRestaurant('menu_updated');
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update menu item (Manager Dashboard)
app.put('/api/menu/:itemId', async (req, res) => {
  const { itemId } = req.params;
  const { name, price, category, available } = req.body;
  try {
    const cols = getCollections();
    const existing = await cols.menuItems.findOne({ id: itemId });
    if (!existing) {
      return res.status(404).json({ error: 'Item not found' });
    }
    const updateDoc = {};
    if (name !== undefined) updateDoc.name = name;
    if (price !== undefined) updateDoc.price = parseFloat(price);
    if (category !== undefined) updateDoc.category = category;
    if (available !== undefined) updateDoc.available = !!available;
    
    await cols.menuItems.updateOne({ id: itemId }, { $set: updateDoc });
    emitToRestaurant('menu_updated');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete menu item (Manager Dashboard)
app.delete('/api/menu/:itemId', async (req, res) => {
  const { itemId } = req.params;
  try {
    const cols = getCollections();
    await cols.menuItems.deleteOne({ id: itemId });
    emitToRestaurant('menu_updated');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Fetch orders (supports filtering by sessionId or tableId)
app.get('/api/orders', async (req, res) => {
  const { sessionId, tableId } = req.query;
  try {
    const cols = getCollections();
    let query = {};

    if (sessionId) {
      query.session_id = sessionId;
    } else if (tableId) {
      query.table_id = tableId;
    }

    const activeOrders = await cols.orders.find(query).sort({ created_at: 1 }).toArray();
    const menuItems = await cols.menuItems.find().toArray();
    const menuMap = new Map(menuItems.map(m => [m.id, m]));
    
    // Fetch all sessions to map comments
    const sessionsList = await cols.sessions.find().toArray();
    const sessionsMap = new Map(sessionsList.map(s => [s.id, s]));

    // Flatten order items to match frontend KOT batch mapping
    const result = [];
    for (const order of activeOrders) {
      const sessionDoc = sessionsMap.get(order.session_id);
      const sessionComment = sessionDoc ? sessionDoc.comments : null;
      for (const item of order.items) {
        const mItem = menuMap.get(item.menuItemId) || { name: 'Unknown', price: 0 };
        result.push({
          orderId: order.id,
          sessionId: order.session_id,
          tableId: order.table_id,
          orderStatus: order.status,
          createdAt: order.created_at,
          itemId: item.itemId,
          menuItemId: item.menuItemId,
          qty: item.qty,
          notes: item.notes,
          itemStatus: item.status,
          itemName: mItem.name,
          itemPrice: mItem.price,
          sessionComment: sessionComment
        });
      }
    }

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Place new order batch
app.post('/api/orders', async (req, res) => {
  const { sessionId, tableId, items } = req.body;
  if (!sessionId || !tableId || !items || !items.length) {
    return res.status(400).json({ error: 'Missing sessionId, tableId or items' });
  }

  try {
    const cols = getCollections();
    // Verify table is active and belongs to this session
    const table = await cols.tables.findOne({ id: tableId });
    if (!table || table.current_session_id !== sessionId) {
      return res.status(400).json({ error: 'Invalid session for this table' });
    }

    if (table.status === 'bill_requested') {
      return res.status(403).json({ error: 'Bill requested — ask staff to add anything else' });
    }

    const orderId = `O-${uuidv4().substring(0, 8).toUpperCase()}`;
    const itemIdCounter = Date.now();

    const mappedItems = items.map((item, idx) => ({
      itemId: itemIdCounter + idx,
      menuItemId: item.menuItemId,
      qty: item.qty,
      notes: item.notes || null,
      status: 'pending'
    }));

    const newOrder = {
      id: orderId,
      session_id: sessionId,
      table_id: tableId,
      status: 'pending',
      created_at: new Date(),
      items: mappedItems
    };

    await cols.orders.insertOne(newOrder);

    // Get order info with names for socket notification
    const menuItems = await cols.menuItems.find().toArray();
    const menuMap = new Map(menuItems.map(m => [m.id, m]));
    const orderDetails = mappedItems.map(item => ({
      itemId: item.itemId,
      qty: item.qty,
      notes: item.notes,
      itemName: (menuMap.get(item.menuItemId) || {}).name || 'Unknown',
      tableId,
      createdAt: newOrder.created_at
    }));

    emitToRestaurant('order_placed', { orderId, sessionId, tableId, items: orderDetails });
    res.status(201).json({ orderId, success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update status of a specific order item (Kitchen Dashboard)
app.put('/api/order-items/:itemId/status', async (req, res) => {
  const { itemId } = req.params;
  const { status } = req.body; // 'pending' | 'preparing' | 'ready' | 'served'
  const intItemId = parseInt(itemId);

  if (!['pending', 'preparing', 'ready', 'served'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const cols = getCollections();
    const order = await cols.orders.findOne({ "items.itemId": intItemId });

    if (!order) {
      return res.status(404).json({ error: 'Order item not found' });
    }

    // Update the item status in the items array
    await cols.orders.updateOne(
      { id: order.id, "items.itemId": intItemId },
      { $set: { "items.$.status": status } }
    );

    // Fetch updated order to check overall status
    const updatedOrder = await cols.orders.findOne({ id: order.id });
    const sisterItems = updatedOrder.items;
    
    let overallStatus = 'pending';
    if (sisterItems.every(i => i.status === 'served')) {
      overallStatus = 'served';
    } else if (sisterItems.every(i => i.status === 'ready' || i.status === 'served')) {
      overallStatus = 'ready';
    } else if (sisterItems.some(i => i.status === 'preparing' || i.status === 'ready')) {
      overallStatus = 'preparing';
    }

    await cols.orders.updateOne({ id: order.id }, { $set: { status: overallStatus } });

    // Broadcast update
    emitToRestaurant('order_status_updated', {
      itemId: intItemId,
      status,
      orderId: order.id,
      sessionId: order.session_id,
      tableId: order.table_id
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Fetch bill for a specific session
app.get('/api/sessions/:sessionId/bill', async (req, res) => {
  const { sessionId } = req.params;
  try {
    const cols = getCollections();
    // Check if session exists
    const session = await cols.sessions.findOne({ id: sessionId });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Get all items in this session
    const sessionOrders = await cols.orders.find({ session_id: sessionId }).toArray();
    const menuItems = await cols.menuItems.find().toArray();
    const menuMap = new Map(menuItems.map(m => [m.id, m]));

    const billItems = [];
    for (const o of sessionOrders) {
      for (const item of o.items) {
        const mItem = menuMap.get(item.menuItemId) || { name: 'Unknown', price: 0 };
        billItems.push({
          qty: item.qty,
          notes: item.notes,
          name: mItem.name,
          price: mItem.price,
          status: item.status
        });
      }
    }

    const subtotal = billItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const cgst = subtotal * 0.025;
    const sgst = subtotal * 0.025;
    const total = subtotal + cgst + sgst;

    res.json({
      sessionId,
      tableId: session.table_id,
      items: billItems,
      subtotal,
      cgst,
      sgst,
      total
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a HelpRequest (Call Staff / Bill Request)
app.post('/api/help', async (req, res) => {
  const { tableId, type } = req.body;
  if (!tableId || !['staff_call', 'bill_request'].includes(type)) {
    return res.status(400).json({ error: 'Missing tableId or invalid type' });
  }

  try {
    const cols = getCollections();
    const table = await cols.tables.findOne({ id: tableId });
    if (!table) {
      return res.status(404).json({ error: 'Table not found' });
    }

    const sessionId = table.current_session_id;

    // Insert Help Request
    const result = await cols.helpRequests.insertOne({
      table_id: tableId,
      session_id: sessionId,
      type,
      status: 'open',
      created_at: new Date()
    });

    if (type === 'bill_request') {
      // Lock ordering by updating table status
      await cols.tables.updateOne(
        { id: tableId },
        { $set: { status: 'bill_requested' } }
      );
      
      // Calculate and save the pending bill total
      const sessionOrders = await cols.orders.find({ session_id: sessionId }).toArray();
      const menuItems = await cols.menuItems.find().toArray();
      const menuMap = new Map(menuItems.map(m => [m.id, m]));

      let subtotal = 0;
      for (const o of sessionOrders) {
        for (const item of o.items) {
          const price = (menuMap.get(item.menuItemId) || { price: 0 }).price;
          subtotal += price * item.qty;
        }
      }
      const total = subtotal * 1.05; // subtotal + 5% tax

      // Save/Update Bill
      await cols.bills.updateOne(
        { session_id: sessionId },
        { $set: { table_id: tableId, total, status: 'pending', created_at: new Date() } },
        { upsert: true }
      );
    }

    emitToRestaurant('help_request_updated');
    emitToRestaurant('tables_updated');

    res.status(201).json({ id: result.insertedId, type, success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Resolve a help request
app.post('/api/help/resolve', async (req, res) => {
  const { requestId } = req.body;
  if (!requestId) {
    return res.status(400).json({ error: 'Missing requestId' });
  }

  try {
    const cols = getCollections();
    await cols.helpRequests.updateOne(
      { _id: requestId },
      { $set: { status: 'resolved' } }
    );
    emitToRestaurant('help_request_updated');
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Cancel a bill request (Manager rejects it, unlocking the table)
app.post('/api/bills/cancel', async (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) {
    return res.status(400).json({ error: 'Missing sessionId' });
  }

  try {
    const cols = getCollections();
    const session = await cols.sessions.findOne({ id: sessionId });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Unlock table back to active
    await cols.tables.updateOne(
      { id: session.table_id, current_session_id: sessionId },
      { $set: { status: 'active' } }
    );

    // Resolve any open bill_request help request for this session
    await cols.helpRequests.updateMany(
      { session_id: sessionId, type: 'bill_request' },
      { $set: { status: 'resolved' } }
    );

    // Delete pending bill record
    await cols.bills.deleteOne({ session_id: sessionId });

    emitToRestaurant('tables_updated');
    emitToRestaurant('help_request_updated');

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Confirm Bill (Manager site) - paid, generate PDF receipt, close session, reset table
app.post('/api/bills/confirm', async (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) {
    return res.status(400).json({ error: 'Missing sessionId' });
  }

  try {
    const cols = getCollections();
    const session = await cols.sessions.findOne({ id: sessionId });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const table = await cols.tables.findOne({ id: session.table_id });

    // Get all ordered items
    const sessionOrders = await cols.orders.find({ session_id: sessionId }).toArray();
    const menuItems = await cols.menuItems.find().toArray();
    const menuMap = new Map(menuItems.map(m => [m.id, m]));

    const items = [];
    for (const o of sessionOrders) {
      for (const item of o.items) {
        const mItem = menuMap.get(item.menuItemId) || { name: 'Unknown', price: 0 };
        items.push({
          qty: item.qty,
          name: mItem.name,
          price: mItem.price
        });
      }
    }

    if (!items.length) {
      return res.status(400).json({ error: 'No items ordered in this session' });
    }

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const total = subtotal * 1.05;

    // PDF filename
    const pdfFilename = `receipt_${sessionId}.pdf`;
    const pdfPath = path.join(receiptsDir, pdfFilename);

    // Generate PDF receipt asynchronously
    const doc = new PDFDocument({ margin: 40 });
    const writeStream = fs.createWriteStream(pdfPath);
    doc.pipe(writeStream);
    
    // Draw Receipt UI in PDF
    doc.fontSize(22).text('THE SPICE ROUTE', { align: 'center' });
    doc.fontSize(10).text('123 Gourmet Street, Foodie City', { align: 'center' });
    doc.fontSize(10).text('GSTIN: 27AAAAA1111A1Z1', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(12).text(`Receipt: INV-${sessionId}`);
    doc.text(`Table: Table ${table.table_number}`);
    doc.text(`Date: ${new Date().toLocaleString()}`);
    doc.moveDown();
    
    doc.fontSize(11).text('----------------------------------------------------', { align: 'center' });
    doc.moveDown(0.5);

    items.forEach(item => {
      const itemTotal = (item.qty * item.price).toFixed(2);
      doc.text(`${item.qty} x ${item.name}`, { continued: true });
      doc.text(`₹${itemTotal}`, { align: 'right' });
    });

    doc.moveDown(0.5);
    doc.text('----------------------------------------------------', { align: 'center' });
    doc.moveDown(0.5);

    const cgst = subtotal * 0.025;
    const sgst = subtotal * 0.025;

    doc.text(`Subtotal:`, { continued: true }); doc.text(`₹${subtotal.toFixed(2)}`, { align: 'right' });
    doc.text(`CGST (2.5%):`, { continued: true }); doc.text(`₹${cgst.toFixed(2)}`, { align: 'right' });
    doc.text(`SGST (2.5%):`, { continued: true }); doc.text(`₹${sgst.toFixed(2)}`, { align: 'right' });
    doc.moveDown(0.5);
    doc.fontSize(14).text(`Grand Total:`, { continued: true, bold: true }); 
    doc.text(`₹${total.toFixed(2)}`, { align: 'right', bold: true });
    
    doc.moveDown(1.5);
    doc.fontSize(11).text('Thank you for dining with us!', { align: 'center' });
    doc.text('Please visit again!', { align: 'center' });
    doc.end();

    await new Promise((resolve) => writeStream.on('finish', resolve));

    const relativePdfPath = `/receipts/${pdfFilename}`;

    // Update Bill
    await cols.bills.updateOne(
      { session_id: sessionId },
      { $set: { table_id: session.table_id, total, status: 'paid', pdf_path: relativePdfPath, created_at: new Date() } },
      { upsert: true }
    );

    // Close Session
    await cols.sessions.updateOne({ id: sessionId }, { $set: { status: 'closed' } });

    // Reset Table
    await cols.tables.updateOne(
      { id: session.table_id },
      { $set: { status: 'empty', current_session_id: null } }
    );

    // Resolve any open help requests for this session
    await cols.helpRequests.updateMany(
      { session_id: sessionId },
      { $set: { status: 'resolved' } }
    );

    console.log(`Confirmed bill. Table ${session.table_id} reset to empty. Session ${sessionId} closed.`);

    // Broadcast events
    emitToRestaurant('session_closed', { sessionId, tableId: session.table_id });
    emitToRestaurant('tables_updated');
    emitToRestaurant('help_request_updated');
    emitToRestaurant('bill_updated');

    res.json({ success: true, pdfUrl: relativePdfPath });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Post comment/feedback for a session
app.post('/api/sessions/:sessionId/comment', async (req, res) => {
  const { sessionId } = req.params;
  const { comment } = req.body;
  if (!comment) {
    return res.status(400).json({ error: 'Comment text is required' });
  }

  try {
    const cols = getCollections();
    const session = await cols.sessions.findOne({ id: sessionId });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    await cols.sessions.updateOne({ id: sessionId }, { $set: { comments: comment } });
    emitToRestaurant('comment_updated', { sessionId, comment });
    emitToRestaurant('tables_updated');
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Fetch active HelpRequests (Manager Dashboard with Table Number Joined)
app.get('/api/help', async (req, res) => {
  try {
    const cols = getCollections();
    const requests = await cols.helpRequests.find({ status: 'open' }).toArray();
    const tablesList = await cols.tables.find().toArray();
    const tablesMap = new Map(tablesList.map(t => [t.id, t]));

    const result = requests.map(r => ({
      id: r._id, // string representation of _id
      table_id: r.table_id,
      session_id: r.session_id,
      type: r.type,
      status: r.status,
      created_at: r.created_at,
      table_number: (tablesMap.get(r.table_id) || {}).table_number || '?'
    }));

    // Sort by created_at ascending
    result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Fetch today's sales summary (Manager Dashboard)
app.get('/api/sales/today', async (req, res) => {
  try {
    const cols = getCollections();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const billsList = await cols.bills.find({ status: 'paid' }).toArray();
    const matchSales = billsList.filter(b => new Date(b.created_at).getTime() >= startOfToday.getTime());

    const totalRevenue = matchSales.reduce((sum, b) => sum + b.total, 0);
    const billsCount = matchSales.length;

    res.json({
      totalRevenue,
      billsCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start listening
const PORT = 8080;
httpServer.listen(PORT, () => {
  console.log(`Node backend running on http://localhost:${PORT}`);
});
