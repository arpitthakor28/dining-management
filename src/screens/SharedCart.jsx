import React, { useState } from 'react';
import { ArrowLeft, User, Plus, Minus, Trash2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QuickReorder from '../components/QuickReorder';
import AddItemModal from '../components/AddItemModal';
import { useCart } from '../context/CartContext';
export default function SharedCart() {
    const navigate = useNavigate();
    const { items, updateQuantity, removeFromCart, cartTotal, addToCart, submitCart, isOrderLocked } = useCart();
    const getTableId = () => window.location.pathname.match(/\/table\/([^\/]+)/)?.[1] || 'T-12';
    const tableId = getTableId();
    const tableNumber = tableId.replace('T-', '');
    const [quickAddItem, setQuickAddItem] = useState(null);
    return (<div className="pb-32 pt-4 px-4 bg-gray-50 h-full relative" style={{ minHeight: '100vh' }}>
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 bg-white p-3 rounded-lg shadow-sm border border-gray-200">
        <button onClick={() => navigate(-1)} className="p-1 rounded bg-gray-100 text-gray-600">
          <ArrowLeft size={20}/>
        </button>
        <div>
          <h2 className="text-lg font-bold">Shared Table Cart</h2>
          <p className="text-xs text-muted">Table {tableNumber} • Active Session</p>
        </div>
      </div>

      {/* Bill Locked banner */}
      {isOrderLocked && (<div className="mb-4 bg-orange-50 border border-orange-200 text-orange-850 p-3.5 rounded-xl flex items-center gap-2 shadow-sm text-xs font-bold">
          <AlertTriangle size={18} className="text-orange-500 flex-shrink-0"/>
          <span>Ordering is locked. A bill has already been requested.</span>
        </div>)}

      {/* Cart Items */}
      <div className="space-y-4 mb-4">
        {items.length === 0 ? (<div className="text-center py-10 text-gray-400 bg-white rounded-xl shadow-sm border border-gray-200">
             <p className="font-bold text-gray-500 mb-2">Cart is empty</p>
             <p className="text-sm">Scan the menu to add delicious items!</p>
           </div>) : (items.map(item => (<div key={item.id} className="card p-4 shadow-sm border-l-4 border-l-green-500 bg-white">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-gray-800 text-[15px]">{item.name}</h3>
                  <p className="text-primary font-bold text-[14px]">₹{item.price}</p>
                </div>
                <div className="flex items-center gap-1 bg-green-100 text-green-800 text-[10px] uppercase font-bold px-2 py-1 rounded-full whitespace-nowrap">
                  <User size={12}/>
                  <span>{item.guestName}</span>
                </div>
              </div>
              
              {item.notes && (<div className="bg-gray-50 border border-gray-200 p-2 rounded-lg mb-3">
                    <p className="text-xs text-gray-600 flex items-start gap-1">
                      <span className="font-bold">Notes:</span> 
                      {item.notes}
                    </p>
                </div>)}
              
              <div className="flex justify-between items-center mt-4">
                <button onClick={() => !isOrderLocked && removeFromCart(item.id)} disabled={isOrderLocked} className={`text-xs flex items-center gap-1 font-bold py-1 px-2 rounded -ml-2 ${isOrderLocked ? 'text-gray-300 cursor-not-allowed' : 'text-red-500 active:bg-red-50'}`}>
                  <Trash2 size={14}/> Remove
                </button>
                <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-md px-2 py-1 shadow-sm">
                  <button onClick={() => !isOrderLocked && updateQuantity(item.id, item.quantity - 1)} disabled={isOrderLocked} className="p-1 active:bg-gray-100 rounded text-gray-600 disabled:opacity-55">
                    <Minus size={16}/>
                  </button>
                  <span className="font-bold w-4 text-center text-sm">{item.quantity}</span>
                  <button onClick={() => !isOrderLocked && updateQuantity(item.id, item.quantity + 1)} disabled={isOrderLocked} className="p-1 active:bg-gray-100 rounded text-primary disabled:opacity-55">
                    <Plus size={16}/>
                  </button>
                </div>
              </div>
            </div>)))}

      </div>

      {!isOrderLocked && (<div className="mx-4 mt-6">
          <QuickReorder onSelect={(item) => setQuickAddItem(item)}/>
        </div>)}

      {/* Quick Add Modal */}
      {quickAddItem && (<AddItemModal item={quickAddItem} onClose={() => setQuickAddItem(null)} onAdd={(qty, notes) => {
                const cleanId = quickAddItem.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
                addToCart({ id: cleanId, name: quickAddItem.name, price: quickAddItem.price, quantity: qty, notes });
                setQuickAddItem(null);
            }}/>)}

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 w-full max-w-[480px] bg-white border-t border-gray-200 p-4 pb-6 left-1/2 transform -translate-x-1/2 rounded-t-xl z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between mb-4">
          <span className="text-text-main font-semibold">Subtotal</span>
          <span className="text-xl font-bold">₹{cartTotal}</span>
        </div>
        <button className={`w-full font-bold py-3 text-lg rounded-xl shadow-md ${cartTotal > 0 && !isOrderLocked
            ? 'bg-primary text-white hover:bg-primary-dark active:scale-95 transition-all'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`} onClick={async () => {
            if (cartTotal > 0 && !isOrderLocked) {
                await submitCart();
                navigate(`/table/${tableId}/status`);
            }
        }} disabled={cartTotal === 0 || isOrderLocked}>
          Submit Order Batch
        </button>
      </div>
      
    </div>);
}
