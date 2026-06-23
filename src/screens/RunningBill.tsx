import React, { useState } from 'react';
import { Receipt, CheckCircle2, AlertTriangle, Smile } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { useCart } from '../context/CartContext';

export default function RunningBill() {
  const [showConfirm, setShowConfirm] = useState(false);
  const { 
    batches, 
    isBillRequested, 
    requestBill,
    sessionClosed,
    clearTableSession
  } = useCart();

  const getTableId = () => window.location.pathname.match(/\/table\/([^\/]+)/)?.[1] || 'T-12';
  const tableId = getTableId();
  const tableNumber = tableId.replace('T-', '');

  const handleRequestBill = () => {
    setShowConfirm(true);
  };
  
  const confirmBill = () => {
    setShowConfirm(false);
    requestBill();
  };

  // Compile all items from all active batches in the session
  const allOrderedItems = batches.flatMap(b => b.items);
  
  const subtotal = allOrderedItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const cgst = subtotal * 0.025; // 2.5%
  const sgst = subtotal * 0.025; // 2.5%
  const total = subtotal + cgst + sgst;

  // Render check-out screen if session is confirmed & closed
  if (sessionClosed) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm border border-green-100 flex flex-col items-center animate-in fade-in zoom-in-95">
          <div className="w-20 h-20 bg-green-150 rounded-full flex items-center justify-center mb-6 text-primary">
            <CheckCircle2 size={56} />
          </div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">Thank You!</h2>
          <p className="text-sm text-green-700 font-bold mb-4">Payment Confirmed</p>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            Your bill has been paid and your table session is now closed. We hope you enjoyed your dining experience!
          </p>
          <button
            onClick={() => {
              clearTableSession();
              window.location.href = '/';
            }}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2.5 rounded-lg text-sm shadow-md active:scale-95 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-4 px-4 bg-gray-50 h-full relative" style={{ minHeight: '100vh' }}>
      
      <div className="text-center mb-6">
        <Receipt className="mx-auto text-primary mb-2" size={32} />
        <h2 className="text-2xl font-bold">Running Bill</h2>
        <p className="text-sm text-gray-500">Table {tableNumber}</p>
      </div>

      {isBillRequested && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg flex items-center gap-3 shadow-sm animate-in fade-in zoom-in slide-in-from-top-2">
          <CheckCircle2 size={24} className="text-primary flex-shrink-0" />
          <div>
            <p className="font-bold">Bill Requested!</p>
            <p className="text-xs">Your waiter has been notified. You can pay at the counter or wait at your table.</p>
          </div>
        </div>
      )}

      {/* Bill Items */}
      <div className="card p-0 overflow-hidden shadow-sm border border-gray-200 mb-6 font-mono text-sm bg-white">
        <div className="p-4 border-b border-gray-100 bg-gray-50 font-bold flex justify-between uppercase">
          <span>Item</span>
          <span className="w-16 text-right">Price</span>
        </div>
        
        <div className="p-4 space-y-3 pb-6 border-b border-gray-100 border-dashed min-h-[100px]">
          {allOrderedItems.length === 0 ? (
            <p className="text-gray-400 text-center font-sans">No items ordered yet.</p>
          ) : (
            allOrderedItems.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start">
                <div className="w-3/4">
                  <span className="font-semibold">{item.name}</span>
                  <div className="text-gray-500 text-xs">{item.qty} x ₹{item.price}</div>
                </div>
                <div className="w-1/4 text-right">₹{item.price * item.qty}</div>
              </div>
            ))
          )}
        </div>
        
        {/* Totals */}
        <div className="p-4 bg-gray-50 space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>CGST (2.5%)</span>
            <span>₹{cgst.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>SGST (2.5%)</span>
            <span>₹{sgst.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between text-xl font-bold text-gray-900 mt-4 pt-4 border-t border-gray-200">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <button 
        className={`w-full font-bold py-3 text-lg rounded-xl shadow-md ${isBillRequested || subtotal === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary-dark active:scale-95 transition-all'}`}
        onClick={handleRequestBill}
        disabled={isBillRequested || subtotal === 0}
      >
        {isBillRequested ? 'Bill Requested' : 'Request Final Bill'}
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-lg mb-2">Request Bill?</h3>
            <p className="text-gray-600 mb-6 text-sm">Once requested, you will not be able to order more items for this table session.</p>
            <div className="flex gap-3">
              <button className="flex-1 py-2.5 border border-gray-300 rounded-lg font-bold text-gray-700 active:bg-gray-100 transition-colors" onClick={() => setShowConfirm(false)}>Cancel</button>
              <button className="flex-1 py-2.5 bg-primary text-white rounded-lg font-bold shadow-md active:scale-95 transition-all" onClick={confirmBill}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
