import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';

export interface CartItem {
  id: string; 
  name: string;
  price: number;
  quantity: number;
  notes: string;
  guestName: string;
}

export interface OrderBatch {
  id: string;
  batchNumber: number;
  status: 'pending' | 'preparing' | 'ready' | 'served';
  items: {
    itemId: number;
    menuItemId: string;
    name: string;
    price: number;
    qty: number;
    notes: string;
    status: 'pending' | 'preparing' | 'ready' | 'served';
  }[];
  timestamp: Date;
  tableId: string;
  comments?: string | null;
}

interface CartContextType {
  items: CartItem[];
  batches: OrderBatch[];
  isBillRequested: boolean;
  isOrderLocked: boolean;
  isConnected: boolean;
  tableId: string | null;
  tableNumber: string | null;
  sessionId: string | null;
  sessionClosed: boolean;
  validateTable: (tableId: string, token: string) => Promise<boolean>;
  addToCart: (item: Omit<CartItem, 'guestName'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, newQuantity: number) => void;
  updateNotes: (id: string, notes: string) => void;
  submitCart: () => Promise<void>;
  updateItemStatus: (itemId: number, status: 'pending' | 'preparing' | 'ready' | 'served') => Promise<void>;
  sendComment: (comment: string) => Promise<void>;
  requestBill: () => Promise<void>;
  clearTableSession: () => void;
  cartTotal: number;
  cartCount: number;
  fetchLiveOrders: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Initialize Socket.io client pointing to Port 8080
const socket = io('http://localhost:8080', {
  autoConnect: false
});

// Auth headers helper for staff API calls
const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
});

export function CartProvider({ children }: { children: ReactNode }) {
  const location = useLocation();

  // Local Cart State (Unsubmitted items)
  const [items, setItems] = useState<CartItem[]>([]);
  
  // Scoped Table States
  const [tableId, setTableId] = useState<string | null>(null);
  const [tableNumber, setTableNumber] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isBillRequested, setIsBillRequested] = useState(false);
  const [isOrderLocked, setIsOrderLocked] = useState(false);
  const [sessionClosed, setSessionClosed] = useState(false);
  
  // Cloud States (Live data from backend)
  const [batches, setBatches] = useState<OrderBatch[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Validate guest access using tableId and token
  const validateTable = async (tId: string, token: string): Promise<boolean> => {
    try {
      const response = await fetch(`http://localhost:8080/api/tables/validate?tableId=${tId}&token=${token}`);
      if (!response.ok) {
        return false;
      }
      const data = await response.json();
      if (data.valid) {
        setTableId(data.tableId);
        setTableNumber(data.tableNumber);
        setSessionId(data.sessionId);
        setIsBillRequested(data.status === 'bill_requested');
        setIsOrderLocked(data.status === 'bill_requested');
        setSessionClosed(false);
        // Save token to localStorage for persistence
        localStorage.setItem(`table_token_${tId}`, token);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error validating table token:", err);
      return false;
    }
  };

  // Re-fetch orders/status when the route path changes
  useEffect(() => {
    fetchLiveOrders();
    fetchTableStatus();
  }, [location.pathname, tableId, sessionId]);

  // Initial Fetch & Realtime Socket.io Subscription
  useEffect(() => {
    const pathMatch = location.pathname.match(/\/restaurant\/([^/]+)/);
    const restaurantId = pathMatch ? pathMatch[1] : localStorage.getItem('restaurant_id') || 'r_001';
    socket.io.opts.query = { restaurantId };
    
    if (!socket.connected) {
      socket.connect();
    } else {
      socket.disconnect().connect();
    }

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Socket.io connected');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket.io disconnected');
    });

    // Realtime listeners
    const handleUpdate = () => {
      fetchLiveOrders();
      fetchTableStatus();
    };

    socket.on('order_placed', handleUpdate);
    socket.on('order_status_updated', handleUpdate);
    socket.on('help_request_updated', handleUpdate);
    socket.on('comment_updated', handleUpdate);
    socket.on('tables_updated', handleUpdate);

    socket.on('session_closed', (data) => {
      if (data.sessionId === sessionId) {
        setSessionClosed(true);
        setIsOrderLocked(true);
        setIsBillRequested(false);
        setItems([]);
        setBatches([]);
        // Remove token from localStorage as the session is completed
        if (tableId) {
          localStorage.removeItem(`table_token_${tableId}`);
        }
      }
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('order_placed', handleUpdate);
      socket.off('order_status_updated', handleUpdate);
      socket.off('help_request_updated', handleUpdate);
      socket.off('comment_updated', handleUpdate);
      socket.off('tables_updated', handleUpdate);
      socket.off('session_closed');
    };
  }, [sessionId, tableId]);

  const fetchLiveOrders = async () => {
    try {
      const isStaffPath = location.pathname.match(/kitchen|counter/);
      let url = 'http://localhost:8080/api/orders';
      const headers = isStaffPath ? getAuthHeaders() : { 'Content-Type': 'application/json' };

      if (!isStaffPath && sessionId) {
        url = `http://localhost:8080/api/orders?sessionId=${sessionId}`;
      } else if (!isStaffPath && !sessionId) {
        // Guest route but no active session loaded yet
        return;
      }

      const response = await fetch(url, { headers });
      if (!response.ok) return;
      const rawOrders = await response.json();

      if (!rawOrders || rawOrders.length === 0) {
        setBatches([]);
        return;
      }

      // Group raw flat order rows into 'Batches' for the UI
      const grouped = rawOrders.reduce((acc: any, row: any) => {
        const orderId = row.orderId;
        if (!acc[orderId]) {
          acc[orderId] = {
            id: orderId,
            batchNumber: Object.keys(acc).length + 1,
            status: row.orderStatus,
            timestamp: new Date(row.createdAt),
            items: [],
            tableId: row.tableId,
            comments: row.sessionComment || null
          };
        }
        acc[orderId].items.push({
          itemId: row.itemId,
          menuItemId: row.menuItemId,
          name: row.itemName,
          price: row.itemPrice,
          qty: row.qty,
          notes: row.notes || '',
          status: row.itemStatus
        });
        return acc;
      }, {} as Record<string, any>);

      // Sort batches: oldest first for kitchen, newest first for guest
      const sortedBatches = Object.values(grouped) as OrderBatch[];
      if (isStaffPath) {
        sortedBatches.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      } else {
        sortedBatches.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      }

      setBatches(sortedBatches);
    } catch (error) {
      console.error("Error fetching live orders:", error);
    }
  };

  const fetchTableStatus = async () => {
    if (!tableId) return;
    try {
      const response = await fetch('http://localhost:8080/api/tables');
      if (response.ok) {
        const tablesList = await response.json();
        const currentTable = tablesList.find((t: any) => t.id === tableId);
        if (currentTable) {
          setIsBillRequested(currentTable.status === 'bill_requested');
          setIsOrderLocked(currentTable.status === 'bill_requested');
          if (currentTable.status === 'empty') {
            setSessionId(null);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching table status:", error);
    }
  };

  const addToCart = (item: Omit<CartItem, 'guestName'>) => {
    if (isOrderLocked) return;
    setItems((prev) => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i);
      return [...prev, { ...item, guestName: 'You' }];
    });
  };

  const removeFromCart = (id: string) => {
    if (isOrderLocked) return;
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, qty: number) => {
    if (isOrderLocked) return;
    if (qty < 1) return removeFromCart(id);
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  };

  const updateNotes = (id: string, notes: string) => {
    if (isOrderLocked) return;
    setItems(prev => prev.map(i => i.id === id ? { ...i, notes } : i));
  };

  // Submit cart items to the Node.js backend
  const submitCart = async () => {
    if (items.length === 0 || isOrderLocked || !sessionId || !tableId) return;
    
    const payloads = items.map(idx => {
       const cleanId = idx.id.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
       return {
         menuItemId: cleanId,
         qty: idx.quantity,
         notes: idx.notes || null
       };
    });

    setItems([]); // instantly clear cart for local UX
    
    try {
      const response = await fetch('http://localhost:8080/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId,
          tableId,
          items: payloads
        })
      });
      if (response.ok) {
        await fetchLiveOrders();
      }
    } catch (error) {
      console.error("Error submitting cart:", error);
    }
  };

  // Update status of a specific order item (called by Kitchen Dashboard)
  const updateItemStatus = async (itemId: number, status: 'pending' | 'preparing' | 'ready' | 'served') => {
    try {
      await fetch(`http://localhost:8080/api/order-items/${itemId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
      });
    } catch (error) {
      console.error("Error updating item status:", error);
    }
  };

  // Send a comment/feedback note to the Manager
  const sendComment = async (comment: string) => {
    if (!sessionId) return;
    try {
      await fetch(`http://localhost:8080/api/sessions/${sessionId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comment })
      });
    } catch (error) {
      console.error("Error sending comment:", error);
    }
  };

  // Request final bill and lock ordering
  const requestBill = async () => {
    if (!tableId) return;
    setIsBillRequested(true);
    setIsOrderLocked(true);
    try {
      await fetch('http://localhost:8080/api/help', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tableId,
          type: 'bill_request'
        })
      });
    } catch (error) {
      console.error("Error requesting bill:", error);
    }
  };

  // Clear current table session (used locally to reset guest UX)
  const clearTableSession = () => {
    setItems([]);
    setTableId(null);
    setTableNumber(null);
    setSessionId(null);
    setIsBillRequested(false);
    setIsOrderLocked(false);
    setSessionClosed(false);
    setBatches([]);
  };

  const cartTotal = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      items, 
      batches, 
      isBillRequested, 
      isOrderLocked, 
      isConnected, 
      tableId, 
      tableNumber, 
      sessionId, 
      sessionClosed, 
      validateTable, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      updateNotes, 
      submitCart, 
      updateItemStatus, 
      sendComment, 
      requestBill, 
      clearTableSession, 
      cartTotal, 
      cartCount,
      fetchLiveOrders
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
