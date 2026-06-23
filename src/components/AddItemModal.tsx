import React, { useState } from 'react';
import { Minus, Plus, X } from 'lucide-react';
import type { MenuItem } from '../data/menuData';

interface Props {
  item: MenuItem;
  onClose: () => void;
  onAdd: (quantity: number, notes: string) => void;
}

export default function AddItemModal({ item, onClose, onAdd }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md sm:rounded-xl rounded-t-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10">
        
        <div className="p-4 border-b flex justify-between items-center bg-green-50 border-green-100">
          <h3 className="font-bold text-lg text-green-900 pr-4">{item.name}</h3>
          <button onClick={onClose} className="p-1.5 bg-white border border-green-200 rounded-full text-green-700 shadow-sm active:bg-green-100"><X size={18} /></button>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <span className="font-medium text-gray-700">Item Price</span>
            <span className="font-bold text-xl text-gray-900">₹{item.price}</span>
          </div>

          <div className="flex items-center justify-between mb-8">
            <span className="font-semibold text-gray-800 text-lg">Select Quantity</span>
            <div className="flex items-center gap-4 bg-white shadow-sm border rounded-xl px-2 py-1 border-gray-200">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 text-primary active:bg-green-50 rounded-lg">
                <Minus size={22} />
              </button>
              <span className="font-bold w-6 text-center text-xl">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="p-2 text-primary active:bg-green-50 rounded-lg">
                <Plus size={22} />
              </button>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-800 mb-2">Cooking Instructions (Optional)</label>
            <textarea 
              className="w-full border shadow-inner border-gray-200 bg-gray-50 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary focus:border-primary focus:bg-white outline-none transition-all resize-none"
              rows={3}
              placeholder="e.g. Make it extra spicy, less oil, no onion/garlic..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <button 
            onClick={() => onAdd(quantity, notes)}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-md active:scale-95 transition-all flex justify-between items-center px-6"
          >
            <span>Add to Order</span>
            <span>Total: ₹{item.price * quantity}</span>
          </button>
        </div>
        
      </div>
    </div>
  );
}
