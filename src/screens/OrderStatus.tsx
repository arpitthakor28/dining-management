import React, { useState } from 'react';
import { Clock, CheckCircle2, Flame, ArrowLeft, UtensilsCrossed, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useCart } from '../context/CartContext';

export default function OrderStatus() {
  const navigate = useNavigate();
  const { batches, sendComment } = useCart();
  const getTableId = () => window.location.pathname.match(/\/table\/([^\/]+)/)?.[1] || 'T-12';
  const tableId = getTableId();
  const tableNumber = tableId.replace('T-', '');

  const [commentText, setCommentText] = useState('');

  const handleSendComment = async () => {
    if (!commentText.trim()) return;
    await sendComment(commentText);
    alert('Note sent to manager!');
    setCommentText('');
  };

  return (
    <div className="pb-36 pt-4 px-4 bg-gray-50 h-full relative" style={{ minHeight: '100vh' }}>
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
        <button onClick={() => navigate(-1)} className="p-1 rounded bg-gray-100 text-gray-600">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-lg font-bold">Order Live Status</h2>
          <p className="text-xs text-muted">Table {tableNumber} • {batches.length} Active {batches.length === 1 ? 'Batch' : 'Batches'}</p>
        </div>
      </div>

      <div className="space-y-4">
        {batches.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <UtensilsCrossed size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="font-bold text-gray-500">No active orders</p>
            <p className="text-sm mt-1">Submit a batch from your cart to start cooking!</p>
            <button onClick={() => navigate(`/table/${tableId}/menu`)} className="mt-4 px-4 py-2 border border-primary text-primary rounded-lg font-bold">Menu</button>
          </div>
        ) : (
          batches.map((batch) => (
            <div key={batch.id} className={`card border-l-4 ${
              batch.status === 'served' ? 'border-l-gray-400' :
              batch.status === 'ready' ? 'border-l-green-500' :
              batch.status === 'preparing' ? 'border-l-orange-500' : 'border-l-blue-500'
            } p-4 shadow-sm relative overflow-hidden bg-white`}>
              
              <div className={`absolute top-0 right-0 ${
                batch.status === 'served' ? 'bg-gray-400' :
                batch.status === 'ready' ? 'bg-green-500' :
                batch.status === 'preparing' ? 'bg-orange-500' : 'bg-blue-500'
              } text-white font-bold text-xs px-3 py-1 rounded-bl-lg flex items-center gap-1 uppercase`}>
                {batch.status}
              </div>
              
              <div className="mb-3">
                <p className="text-xs text-gray-500 font-mono">KOT #{batch.id}</p>
                <h3 className="font-bold text-lg text-gray-800">Batch {batch.batchNumber}</h3>
                <p className="text-xs text-gray-500">
                  Ordered at {batch.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              
              <ul className="text-[13px] space-y-3 mb-4 text-gray-700 font-medium">
                {batch.items.map((item, idx) => (
                  <li key={idx} className="border-b border-gray-50 pb-2">
                    <div className="flex justify-between items-start">
                      <span className="w-3/4 leading-tight">{item.qty}x {item.name}</span>
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                        item.status === 'served' ? 'bg-gray-100 text-gray-500' :
                        item.status === 'ready' ? 'bg-green-100 text-green-700' :
                        item.status === 'preparing' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    {item.notes && <span className="text-[10px] text-red-500 block mt-1">Note: {item.notes}</span>}
                  </li>
                ))}
              </ul>
              
              {/* Progress bar */}
              {batch.status === 'preparing' && (
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-orange-500 h-full w-2/3 rounded-full animate-pulse transition-all"></div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Suggestion Comments Box */}
      {batches.length > 0 && (
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="font-bold text-gray-800 text-sm mb-1.5">Note/Suggestion for Manager</h3>
          <p className="text-xs text-gray-400 mb-3">Send comments or special calls (e.g. "Bring extra napkins") to the cashier.</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type message here..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-lg py-2 px-3.5 outline-none focus:border-primary text-sm font-medium"
            />
            <button
              onClick={handleSendComment}
              className="bg-primary hover:bg-primary-dark text-white font-bold p-2.5 rounded-lg transition-all flex items-center justify-center shadow-md active:scale-95"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
