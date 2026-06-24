import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './screens/Home';
import QRJoin from './screens/QRJoin';
import Menu from './screens/Menu';
import SharedCart from './screens/SharedCart';
import OrderStatus from './screens/OrderStatus';
import RunningBill from './screens/RunningBill';
import KitchenDashboard from './screens/KitchenDashboard';
import CounterBilling from './screens/CounterBilling';
import Help from './screens/Help';
import Login from './screens/Login';
import QRGenerator from './screens/QRGenerator';
import StaffGuard from './components/StaffGuard';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <CartProvider>
        <div className="app-container" style={{ maxWidth: '100%', width: '100%' }}>
          <Routes>
            {/* Public Auth Route */}
            <Route path="/login" element={<Login />} />

            {/* Public Guest Scoped Routes */}
            <Route path="/restaurant/:restaurantId/table/:tableId/join" element={<QRJoin />} />
            <Route path="/restaurant/:restaurantId/table/:tableId/menu" element={<Menu />} />
            <Route path="/restaurant/:restaurantId/table/:tableId/cart" element={<Navigate to="../menu" replace />} />
            <Route path="/restaurant/:restaurantId/table/:tableId/status" element={<Menu />} />
            <Route path="/restaurant/:restaurantId/table/:tableId/orders" element={<Menu />} />
            <Route path="/restaurant/:restaurantId/table/:tableId/bill" element={<Menu />} />
            <Route path="/restaurant/:restaurantId/table/:tableId/help" element={<Menu />} />

            {/* Legacy Guest Redirects (mapped to default restaurant r_001) */}
            <Route path="/table/:tableId/join" element={<Navigate to="/restaurant/r_001/table/:tableId/join" replace />} />
            <Route path="/table/:tableId/menu" element={<Navigate to="/restaurant/r_001/table/:tableId/menu" replace />} />
            <Route path="/table/:tableId/cart" element={<Navigate to="/restaurant/r_001/table/:tableId/menu" replace />} />
            <Route path="/table/:tableId/status" element={<Navigate to="/restaurant/r_001/table/:tableId/menu" replace />} />
            <Route path="/table/:tableId/orders" element={<Navigate to="/restaurant/r_001/table/:tableId/menu" replace />} />
            <Route path="/table/:tableId/bill" element={<Navigate to="/restaurant/r_001/table/:tableId/menu" replace />} />
            <Route path="/table/:tableId/help" element={<Navigate to="/restaurant/r_001/table/:tableId/menu" replace />} />

            <Route path="/menu" element={<Navigate to="/restaurant/r_001/table/T-1/menu?token=token_t1" replace />} />
            <Route path="/cart" element={<Navigate to="/restaurant/r_001/table/T-1/menu?token=token_t1" replace />} />
            <Route path="/status" element={<Navigate to="/restaurant/r_001/table/T-1/menu?token=token_t1" replace />} />
            <Route path="/orders" element={<Navigate to="/restaurant/r_001/table/T-1/menu?token=token_t1" replace />} />
            <Route path="/bill" element={<Navigate to="/restaurant/r_001/table/T-1/menu?token=token_t1" replace />} />
            <Route path="/help" element={<Navigate to="/restaurant/r_001/table/T-1/menu?token=token_t1" replace />} />

            {/* Protected Staff Routes (Auth & Role-scoped via StaffGuard) */}
            <Route 
              path="/" 
              element={
                <StaffGuard>
                  <Home />
                </StaffGuard>
              } 
            />
            <Route 
              path="/kitchen" 
              element={
                <StaffGuard requiredRole="kitchen">
                  <KitchenDashboard />
                </StaffGuard>
              } 
            />
            <Route 
              path="/counter" 
              element={
                <StaffGuard requiredRole="manager">
                  <CounterBilling />
                </StaffGuard>
              } 
            />
            <Route 
              path="/admin/qr" 
              element={
                <StaffGuard requiredRole="manager">
                  <QRGenerator />
                </StaffGuard>
              } 
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </CartProvider>
    </Router>
  );
}

export default App;
