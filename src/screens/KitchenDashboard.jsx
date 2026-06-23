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
    return (<div className="min-h-screen bg-[#0d1117] text-[#e6edf3]" style={{ overflowX: 'hidden' }}>
      
      {/* Fixed 56px Topbar */}
      <header className="topbar">
        <div className="flex items-center gap-2">
          <ChefHat size={18} className="text-[#3fb950]"/>
          <span className="font-semibold text-[13px] tracking-wide" style={{ color: 'var(--text)' }}>DineFlow Kitchen</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="nav-tab active">KOT Queue</button>
        </div>

        <div className="flex items-center gap-4">
          <span className="status-badge preparing">Live Sync Active</span>
          <button onClick={handleLogout} className="btn-ghost" style={{ padding: '5px 10px', fontSize: '11px' }}>
            Logout
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="content-area page-wrapper">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-heading font-semibold">Active KOT Tickets ({activeBatches.length})</h2>
          <span className="section-label">Oldest Tickets First</span>
        </div>

        {activeBatches.length === 0 ? (<div className="text-center py-20 bg-[#161b22] border border-[#30363d] rounded-xl text-[#8b949e]">
            <ChefHat size={48} className="mx-auto mb-4 text-[#3fb950] opacity-40 animate-pulse"/>
            <h3 className="font-semibold text-lg text-white mb-1">No active tickets</h3>
            <p className="text-xs text-muted">New guest orders will appear here automatically.</p>
          </div>) : (<div className="grid" style={{ gridTemplateCols: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', alignItems: 'start' }}>
            {activeBatches.map((batch) => {
                const minutesAgo = getMinutesAgo(batch.timestamp);
                const isUrgent = minutesAgo >= 10;
                return (<div key={batch.id} className={`card-premium ${isUrgent ? 'kot-urgent-card' : ''}`} style={{ padding: '20px', height: 'fit-content', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  
                  {/* KOT Header */}
                  <div className="flex justify-between items-start pb-2 border-b border-[#30363d]">
                    <div>
                      <h3 className="text-card-title">Table {batch.tableId ? batch.tableId.replace('T-', '') : 'Unknown'}</h3>
                      <span className="text-meta font-mono" style={{ textTransform: 'uppercase' }}>KOT #{batch.id}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="text-meta flex items-center gap-1">
                        <Clock size={12}/> {minutesAgo}m ago
                      </span>
                      {isUrgent && <span className="status-badge urgent">URGENT</span>}
                    </div>
                  </div>

                  {/* KOT Items */}
                  <div className="flex-grow flex flex-col gap-2">
                    {batch.items.map((item, idx) => (<div key={idx} className="py-2 flex flex-col gap-1.5 border-b border-[#30363d] last:border-0">
                        <div className="flex justify-between items-start">
                          <span className="text-cell font-semibold">
                            {item.qty}x {item.name}
                          </span>
                          <span className={`status-badge ${item.status}`}>
                            {item.status}
                          </span>
                        </div>

                        {item.notes && (<div style={{
                                color: 'var(--danger)',
                                fontSize: '11px',
                                padding: '4px 6px',
                                background: 'rgba(248,81,73,0.06)',
                                borderRadius: '4px',
                                border: '1px solid rgba(248,81,73,0.15)',
                                fontWeight: '500'
                            }}>
                            Note: {item.notes}
                          </div>)}

                        {/* Status Controls */}
                        {item.status !== 'served' && (<div className="flex gap-1.5 mt-1">
                            {item.status === 'pending' && (<button onClick={() => updateItemStatus(item.itemId, 'preparing')} className="btn-primary" style={{ flex: 1, padding: '5px 10px', fontSize: '11px' }}>
                                Prepare
                              </button>)}
                            {item.status === 'preparing' && (<button onClick={() => updateItemStatus(item.itemId, 'ready')} className="btn-primary" style={{ flex: 1, padding: '5px 10px', fontSize: '11px', backgroundColor: 'var(--accent2)' }}>
                                Ready
                              </button>)}
                            {item.status === 'ready' && (<button onClick={() => updateItemStatus(item.itemId, 'served')} className="btn-primary" style={{ flex: 1, padding: '5px 10px', fontSize: '11px' }}>
                                Serve
                              </button>)}
                          </div>)}
                      </div>))}
                  </div>

                  {/* Order comments */}
                  {batch.comments && (<div style={{
                            padding: '8px 10px',
                            background: 'rgba(210,153,34,0.06)',
                            border: '1px solid rgba(210,153,34,0.15)',
                            borderRadius: '6px',
                            color: 'var(--warn)',
                            fontSize: '11px',
                            fontWeight: '500'
                        }}>
                      Comment: "{batch.comments}"
                    </div>)}

                </div>);
            })}
          </div>)}
      </main>
    </div>);
}
