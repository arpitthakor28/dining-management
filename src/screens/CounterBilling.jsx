import React, { useState, useEffect } from 'react';
import { CreditCard, Printer, Users, Bell, DollarSign, CheckCircle2, Download, LogOut, XCircle, Plus, Trash2, Copy, ExternalLink, ChefHat, Clock, Play, Check, Edit2, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useCart } from '../context/CartContext';
const BACKEND_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8080'
  : 'https://dining-management.onrender.com';

const socket = io(BACKEND_URL, {
    autoConnect: false
});
const CATEGORIES = [
    { id: 'Kathiyawadi', name: 'Kathiyawadi' },
    { id: 'Kathiyawadi Special', name: 'Kathiyawadi Special' },
    { id: 'Kaju', name: 'Kaju' },
    { id: 'Vegetables', name: 'Vegetables' },
    { id: 'Paneer', name: 'Paneer' },
    { id: 'Soup', name: 'Soup' },
    { id: 'Chinese', name: 'Chinese' },
    { id: 'Tandoor', name: 'Tandoor' },
    { id: 'Dal', name: 'Dal' },
    { id: 'Rice', name: 'Rice' },
    { id: 'Chole Bhature', name: 'Chole Bhature' },
    { id: 'Beverages', name: 'Beverages' },
    { id: 'Desserts', name: 'Desserts' }
];
export default function CounterBilling() {
    const navigate = useNavigate();
    // Auth headers helper - sends JWT token so backend can scope data to this manager's restaurant
    const authHeaders = () => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    });
    // Custom context for KOT live queue feed
    const { batches, updateItemStatus, fetchLiveOrders } = useCart();
    const [now, setNow] = useState(new Date());
    // Existing data states
    const [tables, setTables] = useState([]);
    const [orders, setOrders] = useState([]);
    const [helpRequests, setHelpRequests] = useState([]);
    const [todaySales, setTodaySales] = useState({ totalRevenue: 0, billsCount: 0 });
    const [selectedTableId, setSelectedTableId] = useState('');
    const [pdfDownloadUrl, setPdfDownloadUrl] = useState(null);
    // Tab State
    const [activeTab, setActiveTab] = useState('billing');
    // Table Management States
    const [newTableNum, setNewTableNum] = useState('');
    const [tableError, setTableError] = useState('');
    const [tableSuccess, setTableSuccess] = useState('');
    // Menu Management States
    const [menuItems, setMenuItems] = useState([]);
    const [newItemName, setNewItemName] = useState('');
    const [newItemPrice, setNewItemPrice] = useState('');
    const [newItemCategory, setNewItemCategory] = useState('Kathiyawadi');
    const [menuError, setMenuError] = useState('');
    const [menuSuccess, setMenuSuccess] = useState('');
    const [editingItemId, setEditingItemId] = useState(null);
    const [editPrice, setEditPrice] = useState('');
    const [editCategory, setEditCategory] = useState('Kathiyawadi');
    const fetchData = async () => {
        const headers = authHeaders();
        try {
            // Fetch Tables
            const tablesRes = await fetch('http://localhost:8080/api/tables', { headers });
            if (tablesRes.ok) {
                const tData = await tablesRes.json();
                setTables(tData);
                // Default select first active or first table if not set
                if (!selectedTableId && tData.length > 0) {
                    const activeTable = tData.find((t) => t.status !== 'empty');
                    setSelectedTableId(activeTable ? activeTable.id : tData[0].id);
                }
            }
            // Fetch Orders
            const ordersRes = await fetch('http://localhost:8080/api/orders', { headers });
            if (ordersRes.ok) {
                setOrders(await ordersRes.json());
            }
            // Fetch Help Requests
            const helpRes = await fetch('http://localhost:8080/api/help', { headers });
            if (helpRes.ok) {
                setHelpRequests(await helpRes.json());
            }
            // Fetch Today's Sales
            const salesRes = await fetch('http://localhost:8080/api/sales/today', { headers });
            if (salesRes.ok) {
                setTodaySales(await salesRes.json());
            }
        }
        catch (err) {
            console.error("Error loading counter data:", err);
        }
    };
    const fetchMenu = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/menu?all=true', { headers: authHeaders() });
            if (response.ok) {
                setMenuItems(await response.json());
            }
        }
        catch (err) {
            console.error("Error fetching menu items:", err);
        }
    };
    useEffect(() => {
        fetchData();
        fetchMenu();
        fetchLiveOrders();
        // Clock updates for Kitchen dashboard wait time calculator
        const clockInterval = setInterval(() => {
            setNow(new Date());
        }, 5000);
        const restaurantId = localStorage.getItem('restaurant_id') || 'r_001';
        socket.io.opts.query = { restaurantId };
        if (!socket.connected) {
            socket.connect();
        }
        else {
            socket.disconnect().connect();
        }
        // Socket.io listeners for instant sync
        socket.on('connect', () => console.log('Manager socket connected'));
        const handleUpdate = () => {
            fetchData();
            fetchLiveOrders();
        };
        socket.on('order_placed', handleUpdate);
        socket.on('order_status_updated', handleUpdate);
        socket.on('help_request_updated', handleUpdate);
        socket.on('tables_updated', handleUpdate);
        socket.on('bill_updated', handleUpdate);
        socket.on('menu_updated', fetchMenu);
        return () => {
            clearInterval(clockInterval);
            socket.off('connect');
            socket.off('order_placed', handleUpdate);
            socket.off('order_status_updated', handleUpdate);
            socket.off('help_request_updated', handleUpdate);
            socket.off('tables_updated', handleUpdate);
            socket.off('bill_updated', handleUpdate);
            socket.off('menu_updated', fetchMenu);
        };
    }, [selectedTableId]);
    const handleResolveHelp = async (requestId) => {
        try {
            const res = await fetch('http://localhost:8080/api/help/resolve', {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ requestId })
            });
            if (res.ok) {
                fetchData();
            }
        }
        catch (err) {
            console.error(err);
        }
    };
    const handleCancelBillRequest = async (sessionId) => {
        if (!window.confirm("Are you sure you want to cancel this bill request? This will unlock ordering for the table."))
            return;
        try {
            const res = await fetch('http://localhost:8080/api/bills/cancel', {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ sessionId })
            });
            if (res.ok) {
                alert("Bill request cancelled. Table is unlocked.");
                setPdfDownloadUrl(null);
                fetchData();
            }
        }
        catch (err) {
            console.error(err);
        }
    };
    const handleConfirmBill = async (sessionId) => {
        try {
            const response = await fetch('http://localhost:8080/api/bills/confirm', {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ sessionId })
            });
            const data = await response.json();
            if (response.ok) {
                setPdfDownloadUrl(`http://localhost:8080${data.pdfUrl}`);
                // Trigger direct print or download dialog
                window.open(`http://localhost:8080${data.pdfUrl}`, '_blank');
                fetchData();
            }
            else {
                alert(data.error || 'Failed to confirm bill');
            }
        }
        catch (err) {
            console.error(err);
        }
    };
    const handleLogout = () => {
        localStorage.removeItem('staff_auth');
        localStorage.removeItem('staff_role');
        localStorage.removeItem('token');
        localStorage.removeItem('restaurant_id');
        navigate('/login');
    };
    // ==========================================
    // TABLE MANAGEMENT ACTIONS
    // ==========================================
    const handleAddTable = async (e) => {
        e.preventDefault();
        if (!newTableNum.trim())
            return;
        try {
            const response = await fetch('http://localhost:8080/api/tables', {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ tableNumber: newTableNum })
            });
            const data = await response.json();
            if (!response.ok) {
                setTableError(data.error || 'Failed to add table');
                setTableSuccess('');
            }
            else {
                setTableSuccess(`Table ${newTableNum} added successfully!`);
                setTableError('');
                setNewTableNum('');
                fetchData();
            }
        }
        catch (err) {
            setTableError('Connection error');
        }
    };
    const handleDeleteTable = async (tableId, tableNum) => {
        if (!window.confirm(`Are you sure you want to delete Table ${tableNum}?`))
            return;
        try {
            const response = await fetch(`http://localhost:8080/api/tables/${tableId}`, {
                method: 'DELETE',
                headers: authHeaders()
            });
            if (response.ok) {
                setTableSuccess(`Table ${tableNum} deleted!`);
                setTableError('');
                fetchData();
            }
            else {
                setTableError('Failed to delete table');
            }
        }
        catch (err) {
            setTableError('Connection error');
        }
    };
    const getGuestLink = (tableId, token) => {
        const restaurantId = localStorage.getItem('restaurant_id') || 'r_001';
        return `${window.location.origin}/restaurant/${restaurantId}/table/${tableId}/join?token=${token}`;
    };
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };
    const printSingleQR = (tableNum, link) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow)
            return;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(link)}`;
        printWindow.document.write(`
      <html>
        <head>
          <title>Print Table ${tableNum} QR</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 50px; }
            h1 { font-size: 32px; color: #16a34a; margin-bottom: 5px; }
            h2 { font-size: 24px; color: #374151; margin-top: 0; }
            .qr-container { border: 3px solid #16a34a; display: inline-block; padding: 20px; border-radius: 15px; margin: 20px 0; }
            p { font-size: 14px; color: #6b7280; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <h1>THE SPICE ROUTE</h1>
          <h2>TABLE ${tableNum}</h2>
          <div class="qr-container">
            <img src="${qrUrl}" width="300" height="300" alt="QR Code" />
          </div>
          <p>Scan to browse menu and order instantly</p>
        </body>
      </html>
    `);
        printWindow.document.close();
    };
    const printAllQRs = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow)
            return;
        printWindow.document.write(`
      <html>
        <head>
          <title>Print All QR Codes</title>
          <style>
            body { font-family: sans-serif; margin: 0; padding: 0; }
            .page { page-break-after: always; text-align: center; padding-top: 100px; height: 100vh; box-sizing: border-box; }
            h1 { font-size: 36px; color: #16a34a; margin-bottom: 5px; }
            h2 { font-size: 28px; color: #374151; margin-top: 0; }
            .qr-container { border: 4px solid #16a34a; display: inline-block; padding: 30px; border-radius: 20px; margin: 40px 0; }
            p { font-size: 16px; color: #6b7280; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          ${tables.map(t => {
            const link = getGuestLink(t.id, t.qr_code_token);
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(link)}`;
            return `
              <div class="page">
                <h1>THE SPICE ROUTE</h1>
                <h2>TABLE ${t.table_number}</h2>
                <div class="qr-container">
                  <img src="${qrUrl}" width="300" height="300" alt="QR Code" />
                </div>
                <p>Scan to browse menu and order instantly</p>
              </div>
            `;
        }).join('')}
        </body>
      </html>
    `);
        printWindow.document.close();
    };
    // ==========================================
    // MENU CATALOG ACTIONS
    // ==========================================
    const handleAddMenuItem = async (e) => {
        e.preventDefault();
        if (!newItemName.trim() || !newItemPrice.trim())
            return;
        try {
            const response = await fetch('http://localhost:8080/api/menu', {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({
                    name: newItemName,
                    price: parseFloat(newItemPrice),
                    category: newItemCategory
                })
            });
            const data = await response.json();
            if (!response.ok) {
                setMenuError(data.error || 'Failed to add item');
                setMenuSuccess('');
            }
            else {
                setMenuSuccess(`Item "${newItemName}" added successfully!`);
                setMenuError('');
                setNewItemName('');
                setNewItemPrice('');
                fetchMenu();
            }
        }
        catch (err) {
            setMenuError('Connection error');
        }
    };
    const handleUpdateMenuItem = async (itemId) => {
        if (!editPrice.trim())
            return;
        try {
            const response = await fetch(`http://localhost:8080/api/menu/${itemId}`, {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify({
                    price: parseFloat(editPrice),
                    category: editCategory
                })
            });
            if (response.ok) {
                setMenuSuccess('Item updated successfully!');
                setMenuError('');
                setEditingItemId(null);
                fetchMenu();
            }
            else {
                setMenuError('Failed to update item');
            }
        }
        catch (err) {
            setMenuError('Connection error');
        }
    };
    const handleDeleteMenuItem = async (itemId, itemName) => {
        if (!window.confirm(`Are you sure you want to delete "${itemName}"?`))
            return;
        try {
            const response = await fetch(`http://localhost:8080/api/menu/${itemId}`, {
                method: 'DELETE',
                headers: authHeaders()
            });
            if (response.ok) {
                setMenuSuccess(`Item "${itemName}" deleted!`);
                setMenuError('');
                fetchMenu();
            }
            else {
                setMenuError('Failed to delete item');
            }
        }
        catch (err) {
            setMenuError('Connection error');
        }
    };
    // Compute stats for selected table
    const selectedTable = tables.find(t => t.id === selectedTableId);
    const isBillRequested = selectedTable?.status === 'bill_requested';
    const tableSessionId = selectedTable?.current_session_id;
    // Comments for this table session
    const tableOrders = tableSessionId ? orders.filter(o => o.sessionId === tableSessionId) : [];
    // Group items maps
    const groupedItemsMap = tableOrders.reduce((acc, order) => {
        const itemId = order.menuItemId;
        if (!acc[itemId]) {
            acc[itemId] = {
                name: order.itemName,
                price: order.itemPrice,
                qty: 0,
                notes: []
            };
        }
        acc[itemId].qty += order.qty;
        if (order.notes)
            acc[itemId].notes.push(order.notes);
        return acc;
    }, {});
    const allOrderedItems = Object.values(groupedItemsMap);
    const subtotal = allOrderedItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const cgst = subtotal * 0.025;
    const sgst = subtotal * 0.025;
    const grandTotal = subtotal + cgst + sgst;
    // Separate help requests
    const staffCalls = helpRequests.filter(hr => hr.type === 'staff_call');
    const billRequests = helpRequests.filter(hr => hr.type === 'bill_request');
    const handleMouseMove = (e) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    };
    return (<div className="dark-theme-wrapper p-6">
      <div className="ambient-glow-bubble-1"></div>
      <div className="ambient-glow-bubble-2"></div>
      
      <div className="max-w-[1440px] mx-auto z-10 relative">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-lg">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Counter & Billing</h1>
            <p className="text-gray-400 font-semibold mt-1">Live synchronized management console</p>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
             <button onClick={() => setActiveTab('billing')} className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'billing'
            ? 'btn-premium-green'
            : 'btn-premium-outline border border-white/10 text-white hover:bg-white/5'}`}>
               Billing & Desk
             </button>
             <button onClick={() => setActiveTab('kitchen')} className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'kitchen'
            ? 'btn-premium-green'
            : 'btn-premium-outline border border-white/10 text-white hover:bg-white/5'}`}>
               Kitchen Monitor
             </button>
             <button onClick={() => setActiveTab('tables')} className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'tables'
            ? 'btn-premium-green'
            : 'btn-premium-outline border border-white/10 text-white hover:bg-white/5'}`}>
               Tables & QRs
             </button>
             <button onClick={() => setActiveTab('menu')} className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'menu'
            ? 'btn-premium-green'
            : 'btn-premium-outline border border-white/10 text-white hover:bg-white/5'}`}>
               Menu Catalog
             </button>
             <button onClick={handleLogout} className="px-4 py-2.5 btn-premium-danger rounded-lg transition text-sm flex items-center gap-1.5 ml-2">
               <LogOut size={16}/> Logout
             </button>
          </div>
        </div>

        {/* Tab 1: Billing & Desk */}
        {activeTab === 'billing' && (<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
            {/* Left Panel: Help Requests & Sales Summary */}
            <div className="space-y-6 flex flex-col">
              {/* Real-time Inbox */}
              <div className="glass-card rounded-xl border border-white/10 overflow-hidden" onMouseMove={handleMouseMove}>
                <div className="p-4 bg-white/5 border-b border-white/10 z-10">
                  <h2 className="font-bold text-white text-lg flex items-center gap-2">
                    <Bell className="text-orange-455 animate-bounce" size={20}/> Help Request Inbox
                  </h2>
                </div>
                
                <div className="p-4 space-y-4 max-h-[350px] overflow-y-auto z-10">
                  {/* Staff Calls Section */}
                  <div>
                    <h3 className="text-xs font-black uppercase text-gray-550 tracking-wider mb-2">Staff Calls ({staffCalls.length})</h3>
                    {staffCalls.length === 0 ? (<p className="text-xs text-gray-400 italic py-2">No active staff calls</p>) : (<div className="space-y-2">
                        {staffCalls.map(hr => (<div key={hr.id} className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex justify-between items-center animate-in slide-in-from-top-1">
                            <span className="font-bold text-sm text-blue-200">Table {hr.table_number} requests help</span>
                            <button onClick={() => handleResolveHelp(hr.id)} className="btn-premium-green text-white font-bold p-1.5 rounded transition-all active:scale-95" title="Resolve call">
                              <CheckCircle2 size={16}/>
                            </button>
                          </div>))}
                      </div>)}
                  </div>

                  {/* Bill Requests Section */}
                  <div className="border-t border-white/10 pt-3">
                    <h3 className="text-xs font-black uppercase text-gray-550 tracking-wider mb-2">Bill Requests ({billRequests.length})</h3>
                    {billRequests.length === 0 ? (<p className="text-xs text-gray-400 italic py-2">No pending bill requests</p>) : (<div className="space-y-2">
                        {billRequests.map(hr => (<div key={hr.id} onClick={() => setSelectedTableId(hr.table_id)} className={`p-3 border rounded-lg flex justify-between items-center cursor-pointer transition-all ${selectedTableId === hr.table_id
                        ? 'bg-orange-500/20 border-orange-400 ring-2 ring-orange-500/10'
                        : 'bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/15'}`}>
                            <span className="font-bold text-sm text-orange-200 flex items-center gap-1.5">
                              Table {hr.table_number} requested bill
                            </span>
                            <span className="text-[10px] bg-orange-500/30 text-orange-300 px-2.5 py-0.5 rounded font-black uppercase border border-orange-400/30 animate-pulse">View</span>
                          </div>))}
                      </div>)}
                  </div>
                </div>
              </div>

              {/* Tables Directory */}
              <div className="glass-card rounded-xl border border-white/10 overflow-hidden flex-1" onMouseMove={handleMouseMove}>
                <div className="p-4 border-b border-white/10 bg-white/5 z-10">
                  <h2 className="font-bold text-white text-lg flex items-center justify-between">
                    Tables Directory
                    <span className="text-xs font-bold bg-primary/20 text-green-400 border border-green-500/35 px-2.5 py-0.5 rounded-full">
                      {tables.filter(t => t.status !== 'empty').length} Active
                    </span>
                  </h2>
                </div>
                
                <div className="p-3 space-y-2.5 max-h-[300px] overflow-y-auto scrollbar-glass z-10">
                  {tables.map(table => {
                const tOrders = orders.filter(o => o.sessionId === table.current_session_id);
                const tSubtotal = tOrders.reduce((sum, o) => sum + (o.itemPrice * o.qty || 0), 0);
                const tGrandTotal = tSubtotal * 1.05;
                const tBillReq = table.status === 'bill_requested';
                const isSelected = table.id === selectedTableId;
                return (<div key={table.id} onClick={() => {
                        setSelectedTableId(table.id);
                        setPdfDownloadUrl(null);
                    }} className={`p-3.5 border rounded-xl flex justify-between items-center transition-all cursor-pointer ${isSelected
                        ? 'border-primary bg-green-500/10 shadow-md ring-2 ring-primary/20'
                        : tBillReq
                            ? 'border-orange-400 bg-orange-500/10 animate-pulse'
                            : table.status === 'active'
                                ? 'border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/15'
                                : 'border-white/5 bg-white/5 opacity-60 hover:opacity-100'}`}>
                        <div>
                          <h3 className="font-bold text-base text-white">Table {table.table_number}</h3>
                          <p className={`text-[10px] font-bold ${tBillReq ? 'text-orange-400' :
                        table.status === 'active' ? 'text-blue-400' : 'text-gray-500'}`}>
                            {tBillReq ? 'BILL REQUESTED' : table.status === 'active' ? 'Active Session' : 'Free / Available'}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <span className="font-black text-base text-white block">₹{tGrandTotal.toFixed(0)}</span>
                        </div>
                      </div>);
            })}
                </div>
              </div>

              {/* Today's Sales */}
              <div className="glass-card rounded-xl border border-white/10 p-5" onMouseMove={handleMouseMove}>
                <h2 className="font-bold text-white text-base mb-4 flex items-center gap-1.5"><DollarSign className="text-green-400" size={20}/> Today's Sales Summary</h2>
                <div className="grid grid-cols-2 gap-4 z-10 relative">
                  <div className="bg-green-500/10 p-4 rounded-xl border border-green-500/20">
                    <span className="text-xs font-bold text-green-300 uppercase tracking-wider block">Total Revenue</span>
                    <span className="text-2xl font-black text-green-400 block mt-1">₹{todaySales.totalRevenue ? todaySales.totalRevenue.toFixed(2) : '0.00'}</span>
                  </div>
                  <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                    <span className="text-xs font-bold text-blue-300 uppercase tracking-wider block">Bills Paid</span>
                    <span className="text-2xl font-black text-blue-400 block mt-1">{todaySales.billsCount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel: Invoice Detailed View */}
            <div className="glass-card rounded-xl border border-white/10 lg:col-span-2 h-[80vh] flex flex-col overflow-hidden" onMouseMove={handleMouseMove}>
               {/* Selected Table Header */}
               <div className="flex justify-between items-start border-b border-white/10 p-6 bg-white/5 z-10">
                    <div>
                      <h2 className="text-2xl font-black text-white flex items-center gap-3">
                        Table {selectedTable ? selectedTable.table_number : ''}
                        {isBillRequested && (<span className="bg-orange-500/20 text-orange-300 border border-orange-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm animate-pulse">
                            Bill Requested
                          </span>)}
                      </h2>
                      <p className="text-gray-400 font-semibold mt-1">Active Session Invoice Detail</p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <p className="text-xs text-gray-550 font-mono tracking-widest uppercase">
                        {tableSessionId ? `SESSION-${tableSessionId}` : 'NO ACTIVE SESSION'}
                      </p>
                      {tableSessionId && <p className="text-xs font-semibold text-gray-400 mt-1">Status: {selectedTable?.status}</p>}
                    </div>
               </div>
               
               {/* Bill Content */}
               <div className="flex-1 overflow-y-auto w-full p-4 scrollbar-glass z-10">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-transparent border-b border-white/10 z-10">
                        <tr>
                          <th className="py-4 px-6 text-xs text-gray-400 uppercase tracking-widest">Ordered Dish</th>
                          <th className="py-4 px-6 text-center text-xs text-gray-400 uppercase tracking-widest w-24">QTY</th>
                          <th className="py-4 px-6 text-right text-xs text-gray-400 uppercase tracking-widest w-32">Price</th>
                          <th className="py-4 px-6 text-right text-xs text-gray-400 uppercase tracking-widest w-32">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allOrderedItems.length === 0 ? (<tr>
                            <td colSpan={4} className="py-20 text-center">
                               <div className="font-bold text-gray-550 text-lg">No items ordered yet</div>
                               <p className="text-gray-500 text-sm">Table is empty or reset</p>
                            </td>
                          </tr>) : (allOrderedItems.map((item, idx) => (<tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                              <td className="py-4 px-6">
                                <span className="font-bold text-white">{item.name}</span>
                                {item.notes.length > 0 && item.notes.filter(Boolean).map((note, nIdx) => (<span key={nIdx} className="block text-xs text-red-300 font-semibold mt-1">Note: {note}</span>))}
                              </td>
                              <td className="py-4 px-6 text-center font-mono font-bold text-gray-300 bg-white/5">{item.qty}</td>
                              <td className="py-4 px-6 text-right font-mono text-gray-400">₹{item.price}</td>
                              <td className="py-4 px-6 text-right font-mono font-bold text-white">₹{item.price * item.qty}</td>
                            </tr>)))}
                      </tbody>
                    </table>

                    {/* Comments from guest */}
                    {tableOrders.length > 0 && (<div className="mt-8 border-t border-white/10 pt-4">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Guest comments/requests</h3>
                        <div className="space-y-2">
                          {tables.find(t => t.id === selectedTableId)?.comments ? (<div className="p-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-350 rounded-lg text-sm font-semibold">
                              "{tables.find(t => t.id === selectedTableId).comments}"
                            </div>) : (<p className="text-xs text-gray-555 italic">No notes sent by guest</p>)}
                        </div>
                      </div>)}
                    
                    {allOrderedItems.length > 0 && (<div className="flex justify-end p-8 w-full border-t border-dashed border-white/10 mt-6 bg-white/5">
                        <div className="w-full max-w-sm space-y-3 p-6 bg-white/5 border border-white/10 rounded-xl shadow-sm">
                           <div className="flex justify-between text-gray-400 font-medium"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                           <div className="flex justify-between text-gray-550 text-sm"><span>CGST 2.5%</span><span>₹{cgst.toFixed(2)}</span></div>
                           <div className="flex justify-between text-gray-550 text-sm"><span>SGST 2.5%</span><span>₹{sgst.toFixed(2)}</span></div>
                           <div className="flex justify-between items-end pt-4 border-t-2 border-white/10 mt-2">
                             <span className="font-bold text-white uppercase tracking-wider text-sm">Grand Total</span>
                             <span className="text-3xl font-black text-green-400 leading-none tracking-tight">₹{grandTotal.toFixed(2)}</span>
                           </div>
                        </div>
                      </div>)}
               </div>
               
               {/* Action bar */}
               <div className="border-t border-white/10 p-4 bg-white/5 flex gap-4 mt-auto z-10">
                    {pdfDownloadUrl && (<a href={pdfDownloadUrl} download className="px-6 py-3 btn-premium-outline rounded-lg font-bold transition flex items-center justify-center gap-2 hover:border-green-500 hover:text-green-400">
                        <Download size={20}/> Download PDF
                      </a>)}
                    
                    {isBillRequested && tableSessionId && (<button onClick={() => handleCancelBillRequest(tableSessionId)} className="px-6 py-3 btn-premium-danger rounded-lg transition flex items-center justify-center gap-2">
                        <XCircle size={20}/> Reject & Unlock
                      </button>)}
                    
                    <div className="flex-1"></div>
                    
                    <button onClick={() => tableSessionId && handleConfirmBill(tableSessionId)} disabled={allOrderedItems.length === 0} className={`px-8 py-3 rounded-lg font-bold flex items-center gap-2 justify-center transition-all sm:w-auto w-full ${allOrderedItems.length === 0
                ? 'bg-white/5 border border-white/5 text-gray-500 cursor-not-allowed'
                : 'btn-premium-green active:scale-95'}`}>
                      <CreditCard size={20}/> Confirm Bill & Print Receipt
                    </button>
                </div>
            </div>
          </div>)}

        {/* Tab 2: Kitchen Live Queue Feed */}
        {activeTab === 'kitchen' && (<div className="animate-in fade-in duration-200">
            <h2 className="font-bold text-gray-300 mb-6 flex justify-between items-center">
              <span>Active KOT Tickets ({batches.filter(b => b.items.some(i => i.status !== 'served')).length})</span>
              <span className="text-xs font-bold bg-primary/20 text-green-400 border border-green-500/35 px-3 py-1.5 rounded-full uppercase tracking-wider">Oldest Tickets First</span>
            </h2>
            
            {batches.filter(b => b.items.some(i => i.status !== 'served')).length === 0 ? (<div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl shadow-lg text-gray-400">
                <ChefHat size={64} className="mx-auto mb-4 opacity-20 text-green-400 animate-bounce"/>
                <p className="font-bold text-lg text-white">No active orders in the kitchen</p>
                <p className="text-sm text-gray-550 font-semibold">New guest orders will appear here automatically.</p>
              </div>) : (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {batches.filter(b => b.items.some(i => i.status !== 'served')).map((batch) => {
                    const diffMs = now.getTime() - new Date(batch.timestamp).getTime();
                    const minutesAgo = Math.floor(diffMs / 60000);
                    const isUrgent = minutesAgo >= 10;
                    return (<div key={batch.id} onMouseMove={handleMouseMove} className={`glass-card rounded-2xl overflow-hidden flex flex-col min-h-[300px] border transition-all duration-300 ${isUrgent ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'border-white/10'}`}>
                      {/* Ticket Header */}
                      <div className={`px-4 py-3 border-b flex justify-between items-center z-10 ${isUrgent ? 'bg-red-500/10 border-red-500/20' : 'bg-white/5 border-white/10'}`}>
                        <div>
                          <h3 className="font-bold text-lg text-white">
                            Table {batch.tableId ? batch.tableId.replace('T-', '') : 'Unknown'}
                          </h3>
                          <p className="text-[10px] font-mono text-gray-400 uppercase">KOT #{batch.id}</p>
                        </div>
                        
                        <span className={`text-xs font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg ${isUrgent ? 'bg-red-500/20 text-red-300 animate-pulse' : 'bg-white/10 text-gray-300'}`}>
                          <Clock size={12}/> {minutesAgo}m ago
                        </span>
                      </div>

                      {/* Ticket Content */}
                      <div className="flex-1 p-4 divide-y divide-white/10 z-10 flex flex-col justify-between">
                        <div>
                          {batch.items.map((item, idx) => (<div key={idx} className={`py-3 flex flex-col gap-2 ${item.status === 'served' ? 'opacity-30' : ''} ${idx !== 0 ? 'border-t border-white/10' : ''}`}>
                              
                              <div className="flex justify-between items-start">
                                <div className="flex-1 pr-2">
                                  <span className="font-bold text-[15px] text-gray-200">
                                    {item.qty}x {item.name}
                                  </span>
                                  {item.notes && (<span style={{
                                    display: 'block',
                                    marginTop: '6px',
                                    padding: '6px 8px',
                                    borderRadius: '6px',
                                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                                    border: '1px solid rgba(239, 68, 68, 0.25)',
                                    color: '#fca5a5',
                                    fontSize: '11px',
                                    fontWeight: 'bold'
                                }}>
                                      Note: {item.notes}
                                    </span>)}
                                </div>
                                
                                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${item.status === 'served' ? 'bg-white/10 text-gray-400' :
                                item.status === 'ready' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                                    item.status === 'preparing' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'}`}>
                                  {item.status}
                                </span>
                              </div>

                              {item.status !== 'served' && (<div className="flex gap-1.5 mt-1">
                                  {item.status === 'pending' && (<button onClick={() => updateItemStatus(item.itemId, 'preparing')} className="flex-1 btn-premium-blue py-1.5 px-2 text-xs rounded-lg transition-all flex items-center justify-center gap-1 active:scale-95">
                                      <Play size={12}/> Prepare
                                    </button>)}
                                  {item.status === 'preparing' && (<button onClick={() => updateItemStatus(item.itemId, 'ready')} className="flex-1 btn-premium-amber py-1.5 px-2 text-xs rounded-lg transition-all flex items-center justify-center gap-1 active:scale-95">
                                      <Check size={12}/> Ready
                                    </button>)}
                                  {item.status === 'ready' && (<button onClick={() => updateItemStatus(item.itemId, 'served')} className="flex-1 btn-premium-green py-1.5 px-2 text-xs rounded-lg transition-all flex items-center justify-center gap-1 active:scale-95">
                                      <CheckCircle2 size={12}/> Serve
                                    </button>)}
                                </div>)}
                            </div>))}
                        </div>

                        {batch.comments && (<div style={{
                                marginTop: '12px',
                                padding: '10px 12px',
                                borderRadius: '8px',
                                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                                border: '1px solid rgba(245, 158, 11, 0.25)',
                                color: '#fde047',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                lineHeight: '1.4'
                            }}>
                            ⚠️ Order Note: "{batch.comments}"
                          </div>)}
                      </div>
                    </div>);
                })}
              </div>)}
          </div>)}

        {/* Tab 3: Tables & QR Management */}
        {activeTab === 'tables' && (<div className="space-y-8 animate-in fade-in duration-200">
            {/* Header / Top actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">Table QR Code Registry</h2>
                <p className="text-gray-400 font-semibold text-xs mt-1">Configure physical dining tables and export printable QR slips.</p>
              </div>
              <button onClick={printAllQRs} disabled={tables.length === 0} className="flex items-center gap-2 btn-premium-green px-6 py-3 rounded-lg transition-all">
                <Printer size={20}/> Print All QR Codes
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Add Table card */}
              <div className="glass-card rounded-xl border border-white/10 p-6 h-fit" onMouseMove={handleMouseMove}>
                <h3 className="text-lg font-bold text-white mb-4">Add Restaurant Table</h3>
                
                {tableError && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-semibold rounded-lg">{tableError}</div>}
                {tableSuccess && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 text-green-300 text-xs font-semibold rounded-lg">{tableSuccess}</div>}

                <form onSubmit={handleAddTable} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-2">Table Number / Label</label>
                    <input type="text" placeholder="e.g. 7 or 18" value={newTableNum} onChange={(e) => setNewTableNum(e.target.value)} className="input-dark w-full rounded-lg py-2.5 px-4 font-bold text-sm" required/>
                  </div>
                  
                  <button type="submit" className="w-full btn-premium-green py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5">
                    <Plus size={18}/> Register Table
                  </button>
                </form>
              </div>

              {/* Table listings grid */}
              <div className="lg:col-span-2 glass-card rounded-xl border border-white/10 overflow-hidden" onMouseMove={handleMouseMove}>
                <div className="p-4 bg-white/5 border-b border-white/10 font-bold text-white flex justify-between items-center">
                  <span>Registered Tables ({tables.length})</span>
                </div>
                
                <div className="divide-y divide-white/5 max-h-[60vh] overflow-y-auto scrollbar-glass">
                  {tables.length === 0 ? (<div className="text-center py-20 text-gray-500">
                      <Users size={48} className="mx-auto mb-4 opacity-20 text-green-400"/>
                      <p className="font-bold text-lg text-white">No tables registered yet</p>
                      <p className="text-sm">Use the form to add a dining table.</p>
                    </div>) : (tables.map((table) => {
                const guestLink = getGuestLink(table.id, table.qr_code_token);
                const qrPreview = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(guestLink)}`;
                return (<div key={table.id} className="p-4 flex flex-col md:flex-row items-center gap-4 hover:bg-white/5 transition-colors">
                          <div className="border border-white/10 rounded-lg p-2 bg-white flex-shrink-0 flex items-center justify-center">
                            <img src={qrPreview} width="80" height="80" alt="QR Preview" className="w-20 h-20"/>
                          </div>
                          
                          <div className="flex-1 text-center md:text-left min-w-0">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1.5">
                              <h4 className="font-bold text-lg text-white">Table {table.table_number}</h4>
                              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${table.status === 'bill_requested' ? 'bg-orange-500/20 text-orange-355 border border-orange-500/30' :
                        table.status === 'active' ? 'bg-blue-500/20 text-blue-355 border border-blue-500/30' : 'bg-white/10 text-gray-400 border border-white/10'}`}>
                                {table.status}
                              </span>
                            </div>
                            
                            <p className="text-xs text-gray-550 font-mono truncate mb-3 select-all">
                              {guestLink}
                            </p>
                            
                            <div className="flex flex-wrap justify-center md:justify-start gap-2">
                               <button onClick={() => copyToClipboard(guestLink)} className="btn-premium-outline text-xs font-bold py-1.5 px-3 rounded transition">
                                 <Copy size={12}/> Copy URL
                               </button>
                               <a href={guestLink} target="_blank" rel="noreferrer" className="btn-premium-outline text-green-400 text-xs font-bold py-1.5 px-3 rounded transition flex items-center gap-1">
                                 <ExternalLink size={12}/> Simulate Scan
                               </a>
                               <button onClick={() => printSingleQR(table.table_number, guestLink)} className="btn-premium-outline hover:border-green-500 hover:text-green-400 text-xs font-bold py-1.5 px-3 rounded flex items-center gap-1 transition">
                                 <Printer size={12}/> Print Slip
                               </button>
                            </div>
                          </div>
                          
                          <button onClick={() => handleDeleteTable(table.id, table.table_number)} className="p-2.5 btn-premium-danger rounded-lg transition" title="Delete table">
                            <Trash2 size={18}/>
                          </button>
                        </div>);
            }))}
                </div>
              </div>
            </div>
          </div>)}

        {/* Tab 4: Menu Items CRUD Catalog */}
        {activeTab === 'menu' && (<div className="space-y-8 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-white">Dish & Price Catalog</h2>
              <p className="text-gray-400 font-semibold text-xs mt-1">Configure food items, update pricing, and modify categories instantly.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Add Menu Item form */}
              <div className="glass-card rounded-xl border border-white/10 p-6 h-fit" onMouseMove={handleMouseMove}>
                <h3 className="text-lg font-bold text-white mb-4">Add Menu Item</h3>
                
                {menuError && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-semibold rounded-lg">{menuError}</div>}
                {menuSuccess && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 text-green-300 text-xs font-semibold rounded-lg">{menuSuccess}</div>}

                <form onSubmit={handleAddMenuItem} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-2">Item Name</label>
                    <input type="text" placeholder="e.g. Garlic Naan" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} className="input-dark w-full rounded-lg py-2.5 px-4 font-bold text-sm" required/>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-2">Price (₹)</label>
                    <input type="number" placeholder="e.g. 150" value={newItemPrice} onChange={(e) => setNewItemPrice(e.target.value)} className="input-dark w-full rounded-lg py-2.5 px-4 font-bold text-sm" required/>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-2">Category</label>
                    <select value={newItemCategory} onChange={(e) => setNewItemCategory(e.target.value)} className="input-dark w-full rounded-lg py-2.5 px-4 font-bold text-sm bg-[#0d120e] text-[#f1f5f2]">
                      {CATEGORIES.map(cat => (<option key={cat.id} value={cat.id} className="bg-[#0d120e] text-[#f1f5f2]">{cat.name}</option>))}
                    </select>
                  </div>
                  
                  <button type="submit" className="w-full btn-premium-green py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5">
                    <Plus size={18}/> Add Dish
                  </button>
                </form>
              </div>

              {/* Menu items listings table */}
              <div className="lg:col-span-2 glass-card rounded-xl border border-white/10 overflow-hidden" onMouseMove={handleMouseMove}>
                <div className="p-4 bg-white/5 border-b border-white/10 font-bold text-white">
                  <span>Menu Registry ({menuItems.length})</span>
                </div>
                
                <div className="max-h-[60vh] overflow-y-auto scrollbar-glass">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-white/5 border-b border-white/10">
                      <tr>
                        <th className="py-3.5 px-4 text-xs text-gray-400 uppercase tracking-wider">Dish Name</th>
                        <th className="py-3.5 px-4 text-xs text-gray-400 uppercase tracking-wider">Category</th>
                        <th className="py-3.5 px-4 text-xs text-gray-400 tracking-wider text-right w-36">Price</th>
                        <th className="py-3.5 px-4 text-center text-xs text-gray-400 uppercase tracking-wider w-32">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {menuItems.length === 0 ? (<tr>
                          <td colSpan={4} className="py-20 text-center text-gray-500 font-semibold">
                            No menu items found. Add dishes to get started!
                          </td>
                        </tr>) : (menuItems.map((item) => {
                const isEditing = editingItemId === item.id;
                return (<tr key={item.id} className="hover:bg-white/5 transition-colors">
                              <td className="py-4 px-4 font-bold text-white text-sm">{item.name}</td>
                              
                              <td className="py-4 px-4">
                                {isEditing ? (<select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="input-dark rounded py-1 px-2 text-xs font-bold bg-[#0d120e]">
                                    {CATEGORIES.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                                  </select>) : (<span className="text-xs font-black bg-white/5 border border-white/10 text-gray-300 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                    {item.category}
                                  </span>)}
                              </td>

                              <td className="py-4 px-4 text-right">
                                {isEditing ? (<div className="flex items-center gap-1 justify-end">
                                    <span className="text-xs font-bold text-green-400">₹</span>
                                    <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="input-dark w-20 rounded py-1 px-2 text-xs font-bold text-right"/>
                                  </div>) : (<span className="font-bold text-green-400 text-sm">₹{item.price}</span>)}
                              </td>

                              <td className="py-4 px-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  {isEditing ? (<>
                                      <button onClick={() => handleUpdateMenuItem(item.id)} className="p-1.5 btn-premium-green rounded transition" title="Save Changes">
                                        <Save size={14}/>
                                      </button>
                                      <button onClick={() => setEditingItemId(null)} className="p-1.5 btn-premium-danger rounded transition" title="Cancel">
                                        <XCircle size={14}/>
                                      </button>
                                    </>) : (<>
                                      <button onClick={() => {
                            setEditingItemId(item.id);
                            setEditPrice(item.price.toString());
                            setEditCategory(item.category || 'Kathiyawadi');
                        }} className="p-1.5 btn-premium-outline hover:border-green-500 hover:text-green-400 rounded transition" title="Edit Item">
                                        <Edit2 size={14}/>
                                      </button>
                                      <button onClick={() => handleDeleteMenuItem(item.id, item.name)} className="p-1.5 btn-premium-danger rounded transition" title="Delete Item">
                                        <Trash2 size={14}/>
                                      </button>
                                    </>)}
                                </div>
                              </td>
                            </tr>);
            }))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>)}

      </div>
    </div>);
}
