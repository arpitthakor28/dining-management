import React, { useEffect, useState } from 'react';
import { ChefHat, Clock, Check, Play, CheckCircle2, LogOut, Bell, ChevronDown, Printer } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function KitchenDashboard() {
    const navigate = useNavigate();
    const { batches, updateItemStatus, cancelOrderBatch } = useCart();
    const [now, setNow] = useState(new Date());
    const [filterTab, setFilterTab] = useState('all'); // 'all' | 'pending' | 'ready' | 'past'
    const [prepDurations, setPrepDurations] = useState([]);

    // Update current time to compute KOT ages
    useEffect(() => {
        const interval = setInterval(() => {
            setNow(new Date());
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const getMinutesAgo = (timestamp) => {
        const diffMs = now.getTime() - new Date(timestamp).getTime();
        return Math.floor(diffMs / 60000);
    };

    // Filter batches based on sidebar selection
    const activeBatches = batches.filter(batch => {
        if (filterTab === 'all') {
            return batch.items.some(item => item.status !== 'served');
        }
        if (filterTab === 'pending') {
            return batch.items.some(item => item.status === 'pending' || item.status === 'preparing');
        }
        if (filterTab === 'ready') {
            return batch.items.some(item => item.status === 'ready');
        }
        if (filterTab === 'past') {
            return batch.items.every(item => item.status === 'served') && getMinutesAgo(batch.timestamp) <= 120;
        }
        return true;
    });

    const handleLogout = () => {
        localStorage.removeItem('staff_auth');
        localStorage.removeItem('staff_role');
        localStorage.removeItem('token');
        localStorage.removeItem('restaurant_id');
        navigate('/login');
    };

    // Card-level batch updates
    const handleBatchAction = async (batch, targetStatus) => {
        let itemsToUpdate = [];
        if (targetStatus === 'preparing') {
            itemsToUpdate = batch.items.filter(i => i.status === 'pending');
        } else if (targetStatus === 'ready') {
            itemsToUpdate = batch.items.filter(i => i.status === 'preparing');
        } else if (targetStatus === 'served') {
            itemsToUpdate = batch.items.filter(i => i.status === 'ready');
        }

        try {
            await Promise.all(itemsToUpdate.map(item => 
                updateItemStatus(item.itemId, targetStatus)
            ));
            if (targetStatus === 'ready') {
                itemsToUpdate.forEach(() => {
                    const durationMs = Date.now() - new Date(batch.timestamp).getTime();
                    const durationMins = durationMs / 60000;
                    setPrepDurations(prev => [...prev, durationMins]);
                });
            }
        } catch (err) {
            console.error('Failed to update batch:', err);
        }
    };

    const handleCancelBatch = async (orderId) => {
        if (!window.confirm("Are you sure you want to cancel this order batch? This will notify the guest.")) {
            return;
        }
        await cancelOrderBatch(orderId);
    };

    // Calculate metrics
    const allItemsPrepared = batches.flatMap(b => b.items).filter(i => i.status === 'ready' || i.status === 'served').length;
    
    const avgPrepTime = prepDurations.length > 0
        ? (prepDurations.reduce((sum, d) => sum + d, 0) / prepDurations.length).toFixed(1)
        : "0.0";

    const efficientItems = prepDurations.filter(d => d <= 15).length;
    const efficiency = prepDurations.length > 0
        ? Math.round((efficientItems / prepDurations.length) * 100)
        : 0;

    return (
        <div className="kitchen-layout">
            <style>{`
                .kitchen-layout {
                    display: flex;
                    min-height: 100vh;
                    background-color: #0b0f0c;
                    color: var(--text);
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                }
                .sidebar {
                    width: 260px;
                    border-right: 1px solid var(--border);
                    background-color: #090c0a;
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }
                .sidebar-brand {
                    margin-bottom: 24px;
                }
                .brand-title {
                    font-size: 20px;
                    font-weight: 800;
                    color: var(--accent);
                    letter-spacing: -0.025em;
                }
                .brand-subtitle {
                    font-size: 11px;
                    color: var(--muted);
                    font-weight: 600;
                    text-transform: uppercase;
                }
                .sidebar-menu {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    flex: 1;
                }
                .sidebar-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 14px;
                    border-radius: 8px;
                    color: var(--muted);
                    font-size: 13px;
                    font-weight: 600;
                    text-decoration: none;
                    background: transparent;
                    border: none;
                    text-align: left;
                    width: 100%;
                    cursor: pointer;
                    transition: all 0.15s ease;
                }
                .sidebar-item:hover {
                    color: var(--text);
                    background-color: rgba(255, 255, 255, 0.03);
                }
                .sidebar-item.active {
                    color: #fff;
                    background-color: var(--accent2);
                }
                .sidebar-footer {
                    border-top: 1px solid var(--border);
                    padding-top: 16px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    color: var(--muted);
                }
                .main-panel {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    overflow: hidden;
                }
                .main-topbar {
                    height: 56px;
                    border-bottom: 1px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 32px;
                    background-color: #090c0a;
                    flex-shrink: 0;
                }
                .topbar-nav {
                    display: flex;
                    gap: 24px;
                    align-items: center;
                }
                .topbar-logo {
                    font-size: 16px;
                    font-weight: 800;
                    color: var(--accent);
                    margin-right: 12px;
                }
                .topbar-link {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--muted);
                    text-decoration: none;
                    transition: color 0.15s;
                }
                .topbar-link.active {
                    color: var(--accent);
                    border-bottom: 2px solid var(--accent);
                    padding: 17px 0;
                }
                .topbar-actions {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                .topbar-status {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    color: var(--accent);
                    font-weight: 600;
                }
                .bell-btn {
                    background: transparent;
                    border: none;
                    color: var(--muted);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .bell-btn:hover {
                    color: var(--text);
                }
                .kitchen-content {
                    flex: 1;
                    padding: 32px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }
                .content-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .header-title-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .header-badge {
                    font-size: 11px;
                    font-weight: 700;
                    background-color: rgba(63, 185, 80, 0.15);
                    color: var(--accent);
                    border: 1px solid rgba(63, 185, 80, 0.3);
                    padding: 2px 8px;
                    border-radius: 20px;
                    text-transform: uppercase;
                }
                .header-actions {
                    display: flex;
                    gap: 12px;
                }
                .btn-dropdown {
                    background-color: var(--surface);
                    border: 1px solid var(--border);
                    color: var(--text);
                    padding: 8px 16px;
                    font-size: 13px;
                    font-weight: 600;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .btn-green-action {
                    background-color: var(--accent);
                    color: #0b0f0c;
                    padding: 8px 16px;
                    font-size: 13px;
                    font-weight: 700;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                }
                .kot-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 16px;
                    align-items: start;
                }
                .kot-card {
                    background-color: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg);
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    position: relative;
                }
                .kot-card.urgent {
                    border-color: var(--danger);
                }
                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }
                .card-table-title {
                    font-size: 16px;
                    font-weight: 700;
                    color: var(--accent);
                }
                .card-time {
                    font-size: 12px;
                    color: var(--muted);
                    font-weight: 500;
                }
                .card-badge-urgent {
                    background-color: rgba(248, 81, 73, 0.15);
                    border: 1px solid rgba(248, 81, 73, 0.35);
                    color: var(--danger);
                    font-size: 10px;
                    font-weight: 700;
                    padding: 2px 6px;
                    border-radius: 4px;
                }
                .item-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text);
                }
                .item-category-badge {
                    font-size: 10px;
                    color: var(--muted);
                    background-color: var(--surface2);
                    border: 1px solid var(--border);
                    padding: 2px 6px;
                    border-radius: 4px;
                }
                .notes-box {
                    padding: 8px 12px;
                    background-color: rgba(248, 81, 73, 0.04);
                    border: 1px solid rgba(248, 81, 73, 0.15);
                    border-radius: 6px;
                    color: var(--danger);
                    font-size: 11px;
                    font-weight: 500;
                    margin-top: 4px;
                }
                .comments-box {
                    padding: 8px 12px;
                    background-color: rgba(210, 153, 34, 0.04);
                    border: 1px solid rgba(210, 153, 34, 0.15);
                    border-radius: 6px;
                    color: var(--warn);
                    font-size: 11px;
                    font-weight: 500;
                    margin-top: 4px;
                }
                .card-actions {
                    display: flex;
                    gap: 8px;
                    margin-top: 8px;
                }
                .btn-card-gray {
                    flex: 1;
                    background-color: var(--surface2);
                    border: 1px solid var(--border);
                    color: var(--text);
                    padding: 8px;
                    font-size: 12px;
                    font-weight: 600;
                    border-radius: 6px;
                    cursor: pointer;
                }
                .btn-card-green {
                    flex: 1;
                    background-color: var(--accent);
                    color: #0b0f0c;
                    border: none;
                    padding: 8px;
                    font-size: 12px;
                    font-weight: 700;
                    border-radius: 6px;
                    cursor: pointer;
                }
                .performance-panel {
                    background-color: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg);
                    padding: 24px;
                    margin-top: auto;
                }
                .performance-header {
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    color: var(--muted);
                    letter-spacing: 0.05em;
                    margin-bottom: 16px;
                }
                .performance-stats {
                    display: grid;
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                    gap: 16px;
                    margin-bottom: 16px;
                }
                .performance-stat-card h4 {
                    font-size: 11px;
                    color: var(--muted);
                    margin-bottom: 4px;
                }
                .performance-stat-card p {
                    font-size: 20px;
                    font-weight: 700;
                    color: var(--text);
                }
                .progress-bar-container {
                    height: 6px;
                    background-color: var(--surface2);
                    border-radius: 3px;
                    overflow: hidden;
                }
                .progress-bar-fill {
                    height: 100%;
                    background-color: var(--accent);
                    border-radius: 3px;
                }
                @media (max-width: 768px) {
                    .kitchen-layout {
                        flex-direction: column;
                    }
                    .sidebar {
                        width: 100%;
                        height: auto;
                        border-right: none;
                        border-bottom: 1px solid var(--border);
                    }
                    .performance-stats {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                    }
                }
            `}</style>

            {/* Left Sidebar */}
            <aside className="sidebar">
                <div>
                    <div className="sidebar-brand">
                        <h2 className="brand-title" style={{ color: 'var(--accent)' }}>Live Queue</h2>
                        <p className="brand-subtitle">Active Batches: {activeBatches.length}</p>
                    </div>
                    <nav className="sidebar-menu">
                        <button onClick={() => setFilterTab('all')} className={`sidebar-item ${filterTab === 'all' ? 'active' : ''}`}>
                            <span>All Orders</span>
                            <span className="badge-count">{batches.filter(b => b.items.some(i => i.status !== 'served')).length}</span>
                        </button>
                        <button onClick={() => setFilterTab('pending')} className={`sidebar-item ${filterTab === 'pending' ? 'active' : ''}`}>
                            <span>Pending Preparation</span>
                        </button>
                        <button onClick={() => setFilterTab('ready')} className={`sidebar-item ${filterTab === 'ready' ? 'active' : ''}`}>
                            <span>Ready for Pickup</span>
                        </button>
                        <button onClick={() => setFilterTab('past')} className={`sidebar-item ${filterTab === 'past' ? 'active' : ''}`}>
                            <span>Past 2 Hours</span>
                        </button>
                    </nav>
                </div>
                <div className="sidebar-footer">
                    <CheckCircle2 size={16} className="text-green-500" />
                    <span>Status: Online</span>
                </div>
            </aside>

            {/* Right Main Content Panel */}
            <main className="main-panel">
                <header className="main-topbar">
                    <div className="topbar-nav">
                        <span className="topbar-logo">DineFlow</span>
                        <Link to="/kitchen" className="topbar-link active">Kitchen Dashboard</Link>
                        {localStorage.getItem('staff_role') === 'manager' && (
                            <Link to="/counter" className="topbar-link">Cashier Console</Link>
                        )}
                    </div>
                    <div className="topbar-actions">
                        <div className="topbar-status">
                            <CheckCircle2 size={14} />
                            <span>Online</span>
                        </div>
                        <button className="bell-btn">
                            <Bell size={18} />
                        </button>
                        <button onClick={handleLogout} className="bell-btn" title="Logout">
                            <LogOut size={18} />
                        </button>
                    </div>
                </header>

                <div className="kitchen-content">
                    <div className="content-header">
                        <div className="header-title-row">
                            <h1 className="text-lg font-bold">KOT Queue</h1>
                            <span className="header-badge">{activeBatches.length} Orders</span>
                        </div>
                        <div className="header-actions">
                            <button className="btn-dropdown">
                                <span>All Sections</span>
                                <ChevronDown size={14} />
                            </button>
                        </div>
                    </div>

                    {activeBatches.length === 0 ? (
                        <div className="text-center py-20" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', color: 'var(--muted)' }}>
                            <ChefHat size={48} className="mx-auto mb-4 opacity-20 animate-pulse" style={{ color: 'var(--accent)' }} />
                            <h3 className="font-semibold text-lg mb-1" style={{ color: 'var(--text)' }}>No active KOT tickets</h3>
                            <p className="text-xs">New guest orders will appear here automatically.</p>
                        </div>
                    ) : (
                        <div className="kot-grid">
                            {activeBatches.map((batch) => {
                                const minutesAgo = getMinutesAgo(batch.timestamp);
                                const isUrgent = minutesAgo >= 10;

                                // Determine batch status and action text
                                const hasPending = batch.items.some(i => i.status === 'pending');
                                const hasPreparing = batch.items.some(i => i.status === 'preparing');
                                const hasReady = batch.items.some(i => i.status === 'ready');

                                return (
                                    <div key={batch.id} className="kot-card">
                                        <div className="card-header">
                                            <div>
                                                <h3 className="card-table-title">Table {batch.tableId ? batch.tableId.replace('T-', '') : 'Unknown'}</h3>
                                                <span className="text-[10px] font-mono" style={{ color: 'var(--muted)' }}>KOT #{batch.id.substring(0, 6)}</span>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="card-time">{minutesAgo > 0 ? `${minutesAgo}m ago` : 'Just Now'}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2 flex-grow">
                                            {batch.items.map((item, idx) => (
                                                <div key={idx} className="flex flex-col gap-1 py-1" style={{ borderBottom: idx < batch.items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                                    <div className="item-row">
                                                        <span>{item.qty}x {item.name}</span>
                                                        <span className="item-category-badge">{item.category || 'Main'}</span>
                                                    </div>
                                                    {item.notes && (
                                                        <div className="notes-box">
                                                            {item.notes}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {batch.comments && (
                                            <div className="comments-box">
                                                ⚠️ Note: "{batch.comments}"
                                            </div>
                                        )}

                                        <div className="card-actions">
                                            <button className="btn-card-gray" style={{ color: 'var(--danger)', borderColor: 'rgba(248,81,73,0.3)' }} onClick={() => handleCancelBatch(batch.id)}>Cancel</button>
                                            
                                            {hasPending && (
                                                <button className="btn-card-green" onClick={() => handleBatchAction(batch, 'preparing')}>Start</button>
                                            )}
                                            {!hasPending && hasPreparing && (
                                                <button className="btn-card-green" onClick={() => handleBatchAction(batch, 'ready')}>Ready</button>
                                            )}
                                            {!hasPending && !hasPreparing && hasReady && (
                                                <button className="btn-card-green" onClick={() => handleBatchAction(batch, 'served')}>Serve</button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Bottom Performance Panel */}
                    <div className="performance-panel">
                        <div className="performance-header">Kitchen Performance</div>
                        <div className="performance-stats">
                            <div className="performance-stat-card">
                                <h4>Avg Prep Time</h4>
                                <p>{avgPrepTime}m</p>
                            </div>
                            <div className="performance-stat-card">
                                <h4>Items Prepared</h4>
                                <p>{allItemsPrepared}</p>
                            </div>
                            <div className="performance-stat-card">
                                <h4>Efficiency</h4>
                                <p>{efficiency}%</p>
                            </div>
                        </div>
                        <div className="progress-bar-container">
                            <div className="progress-bar-fill" style={{ width: `${efficiency}%` }}></div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
