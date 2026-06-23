import React, { useEffect, useState } from 'react';
import { ChefHat, Clock, Check, Play, CheckCircle2, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
export default function KitchenDashboard() {
    const navigate = useNavigate();
    const { batches, updateItemStatus, fetchLiveOrders } = useCart();
    const [now, setNow] = useState(new Date());
    // Refetch every 3 seconds to keep clock updated
    useEffect(() => {
        const interval = setInterval(() => {
            setNow(new Date());
        }, 5000);
        return () => clearInterval(interval);
    }, []);
    // Filter out batches where ALL items are served
    const activeBatches = batches.filter(batch => batch.items.some(item => item.status !== 'served'));
    const getMinutesAgo = (timestamp) => {
        const diffMs = now.getTime() - timestamp.getTime();
        return Math.floor(diffMs / 60000);
    };
    const handleLogout = () => {
        localStorage.removeItem('staff_auth');
        localStorage.removeItem('staff_role');
        localStorage.removeItem('token');
        localStorage.removeItem('restaurant_id');
        navigate('/login');
    };
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
        <div className="flex justify-between items-center mb-8 bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="bg-primary/25 border border-primary/30 p-3 rounded-xl text-green-400">
              <ChefHat size={28}/>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Kitchen KOT Queue</h1>
              <p className="text-gray-400 text-sm">Real-time order pipeline</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <button onClick={handleLogout} className="flex items-center gap-1.5 px-4 py-2 btn-premium-danger text-sm rounded-lg transition">
               <LogOut size={16}/> Logout
             </button>
          </div>
        </div>

        {/* Live Queue Grid */}
        <h2 className="font-bold text-gray-300 mb-6 flex justify-between items-center">
          <span>Active Tickets ({activeBatches.length})</span>
          <span className="text-xs font-bold bg-primary/20 text-green-400 border border-green-500/35 px-3 py-1.5 rounded-full uppercase tracking-wider">Oldest Tickets First</span>
        </h2>
        
        {activeBatches.length === 0 ? (<div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl shadow-lg text-gray-400">
            <ChefHat size={64} className="mx-auto mb-4 opacity-20 text-green-400 animate-bounce"/>
            <p className="font-bold text-lg text-white">No active orders in the queue</p>
            <p className="text-sm text-gray-500">New guest orders will appear here automatically.</p>
          </div>) : (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {activeBatches.map((batch) => {
                const minutesAgo = getMinutesAgo(batch.timestamp);
                const isUrgent = minutesAgo >= 10; // Highlight if waiting 10+ mins
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
                            
                            {/* Current Status Badge */}
                            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${item.status === 'served' ? 'bg-white/10 text-gray-400' :
                            item.status === 'ready' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                                item.status === 'preparing' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'}`}>
                              {item.status}
                            </span>
                          </div>

                          {/* Status Controls */}
                          {item.status !== 'served' && (<div className="flex gap-1.5 mt-1">
                              {item.status === 'pending' && (<button onClick={() => updateItemStatus(item.itemId, 'preparing')} className="flex-1 btn-premium-blue py-1.5 px-2 text-xs rounded-lg transition-all flex items-center justify-center gap-1 active:scale-95">
                                  <Play size={12}/> Prepare
                                </button>)}
                              {item.status === 'preparing' && (<button onClick={() => updateItemStatus(item.itemId, 'ready')} className="flex-1 btn-premium-orange py-1.5 px-2 text-xs rounded-lg transition-all flex items-center justify-center gap-1 active:scale-95">
                                  <Check size={12}/> Ready
                                </button>)}
                              {item.status === 'ready' && (<button onClick={() => updateItemStatus(item.itemId, 'served')} className="flex-1 btn-premium-green py-1.5 px-2 text-xs rounded-lg transition-all flex items-center justify-center gap-1 active:scale-95">
                                  <CheckCircle2 size={12}/> Serve
                                </button>)}
                            </div>)}
                        </div>))}
                    </div>

                    {/* Order Level Comment in the Middle/Bottom of Card */}
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
      </div>
    </div>);
}
