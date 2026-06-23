import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Utensils, ChefHat, Wallet, Radio, Cloud, CloudOff, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Home() {
    const { isConnected } = useCart();
    const [latency, setLatency] = useState(null);

    // Measure latency to backend for reliable diagnostic reporting
    useEffect(() => {
        const measureLatency = async () => {
            const start = performance.now();
            try {
                const response = await fetch('http://localhost:8080/api/menu');
                if (response.ok) {
                    setLatency(Math.round(performance.now() - start));
                }
            }
            catch (err) {
                setLatency(null);
            }
        };
        measureLatency();
        const interval = setInterval(measureLatency, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="home-layout">
            <style>{`
                .home-layout {
                    display: flex;
                    min-height: 100vh;
                    background-color: #0b0f0c; /* Olive-tinted dark background */
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
                    margin-bottom: 32px;
                }
                .brand-title {
                    font-size: 22px;
                    font-weight: 800;
                    color: var(--accent);
                    letter-spacing: -0.025em;
                }
                .brand-subtitle {
                    font-size: 11px;
                    color: var(--muted);
                    font-weight: 600;
                    text-transform: uppercase;
                    margin-top: 2px;
                }
                .sidebar-menu {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    flex: 1;
                }
                .sidebar-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    border-radius: 8px;
                    color: var(--muted);
                    font-size: 14px;
                    font-weight: 600;
                    text-decoration: none;
                    transition: all 0.15s ease;
                }
                .sidebar-item:hover {
                    color: var(--accent);
                    background-color: rgba(63, 185, 80, 0.05);
                }
                .sidebar-item.active {
                    color: var(--accent);
                    background-color: rgba(63, 185, 80, 0.08);
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
                    overflow-y: auto;
                }
                .main-topbar {
                    height: 56px;
                    border-bottom: 1px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 40px;
                    background-color: #090c0a;
                }
                .topbar-nav {
                    display: flex;
                    gap: 24px;
                }
                .topbar-link {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--muted);
                    text-decoration: none;
                    transition: color 0.15s;
                }
                .topbar-link:hover {
                    color: var(--accent);
                }
                .topbar-status {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    color: var(--accent);
                    font-weight: 600;
                }
                .portal-content {
                    flex: 1;
                    max-width: 960px;
                    margin: 0 auto;
                    width: 100%;
                    padding: 64px 40px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }
                .portal-heading-section {
                    text-align: center;
                    margin-bottom: 48px;
                }
                .portal-main-title {
                    font-size: 32px;
                    font-weight: 700;
                    color: var(--text);
                    margin-bottom: 12px;
                }
                .portal-main-desc {
                    font-size: 14px;
                    color: var(--muted);
                    max-width: 600px;
                    margin: 0 auto;
                    line-height: 1.5;
                }
                .console-cards-container {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                    margin-bottom: 48px;
                }
                .banner-card {
                    display: flex;
                    background-color: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                    transition: all 0.15s ease;
                }
                .banner-card:hover {
                    transform: translateY(-2px);
                    border-color: var(--accent);
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
                }
                .banner-visual {
                    width: 40%;
                    background: linear-gradient(135deg, rgba(63, 185, 80, 0.12), rgba(88, 166, 255, 0.06));
                    border-right: 1px solid var(--border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }
                .banner-visual::before {
                    content: '🍽️';
                    font-size: 64px;
                    opacity: 0.8;
                    animation: float 4s ease-in-out infinite;
                }
                .banner-info {
                    width: 60%;
                    padding: 32px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }
                .badge-foh {
                    align-self: flex-start;
                    font-size: 10px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: var(--accent);
                    background-color: rgba(63, 185, 80, 0.12);
                    border: 1px solid rgba(63, 185, 80, 0.3);
                    padding: 4px 8px;
                    border-radius: 4px;
                    margin-bottom: 12px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .console-grid {
                    display: grid;
                    grid-template-cols: repeat(2, minmax(0, 1fr));
                    gap: 24px;
                }
                .console-card {
                    background-color: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-lg);
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    min-height: 200px;
                    transition: all 0.15s ease;
                }
                .console-card:hover {
                    transform: translateY(-2px);
                    border-color: var(--accent);
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
                }
                .card-header-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 16px;
                }
                .console-badge {
                    font-size: 10px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    padding: 4px 8px;
                    border-radius: 4px;
                }
                .console-badge.kitchen {
                    color: var(--accent);
                    background-color: rgba(63, 185, 80, 0.12);
                    border: 1px solid rgba(63, 185, 80, 0.3);
                }
                .console-badge.cashier {
                    color: var(--accent2);
                    background-color: rgba(88, 166, 255, 0.12);
                    border: 1px solid rgba(88, 166, 255, 0.3);
                }
                .card-link {
                    font-size: 13px;
                    font-weight: 700;
                    color: var(--accent);
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    margin-top: 20px;
                    transition: color 0.15s;
                }
                .card-link:hover {
                    color: var(--accent-hover);
                }
                .portal-main-footer {
                    display: flex;
                    justify-content: space-between;
                    font-size: 12px;
                    color: var(--muted);
                    border-top: 1px solid var(--border);
                    padding-top: 24px;
                }
                .footer-links {
                    display: flex;
                    gap: 16px;
                }
                .footer-links a {
                    color: var(--muted);
                    text-decoration: none;
                }
                .footer-links a:hover {
                    color: var(--text);
                    text-decoration: underline;
                }
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0px); }
                }
                @media (max-width: 768px) {
                    .console-grid {
                        grid-template-cols: minmax(0, 1fr);
                    }
                    .banner-card {
                        flex-direction: column;
                    }
                    .banner-visual {
                        width: 100%;
                        height: 160px;
                        border-right: none;
                        border-bottom: 1px solid var(--border);
                    }
                    .banner-info {
                        width: 100%;
                    }
                    .home-layout {
                        flex-direction: column;
                    }
                    .sidebar {
                        width: 100%;
                        height: auto;
                        border-right: none;
                        border-bottom: 1px solid var(--border);
                    }
                }
            `}</style>

            {/* Left Sidebar */}
            <aside className="sidebar">
                <div>
                    <div className="sidebar-brand">
                        <h2 className="brand-title">DineFlow</h2>
                        <p className="brand-subtitle">Management System</p>
                    </div>
                    <nav className="sidebar-menu">
                        <Link to="/menu" className="sidebar-item">
                            <Utensils size={18} />
                            <span>Guest Menu</span>
                        </Link>
                        <Link to="/kitchen" className="sidebar-item">
                            <ChefHat size={18} />
                            <span>Kitchen Dashboard</span>
                        </Link>
                        <Link to="/counter" className="sidebar-item">
                            <Wallet size={18} />
                            <span>Cashier Console</span>
                        </Link>
                    </nav>
                </div>
                <div className="sidebar-footer">
                    {isConnected ? (
                        <>
                            <Cloud size={16} className="text-green-500" />
                            <span>Status: Online</span>
                        </>
                    ) : (
                        <>
                            <CloudOff size={16} className="text-red-500" />
                            <span>Status: Offline</span>
                        </>
                    )}
                </div>
            </aside>

            {/* Right Main Content Panel */}
            <main className="main-panel">
                <header className="main-topbar">
                    <nav className="topbar-nav">
                        <Link to="/menu" className="topbar-link">Guest Menu</Link>
                        <Link to="/kitchen" className="topbar-link">Kitchen Dashboard</Link>
                        <Link to="/counter" className="topbar-link">Cashier Console</Link>
                    </nav>
                    <div className="topbar-status">
                        <Cloud size={16} className="text-green-500" />
                        <span style={{ marginLeft: '4px' }}>Online</span>
                    </div>
                </header>

                <div className="portal-content">
                    <div className="portal-heading-section">
                        <h1 className="portal-main-title">Select Your Console</h1>
                        <p className="portal-main-desc">
                            Welcome to the central hub of your establishment. Choose a specialized dashboard to manage guest orders, oversee the kitchen, or process payments.
                        </p>
                    </div>

                    <div className="console-cards-container">
                        {/* Guest Menu Wide Banner Card */}
                        <Link to="/menu" className="banner-card">
                            <div className="banner-visual"></div>
                            <div className="banner-info">
                                <div className="badge-foh">
                                    <Utensils size={12} />
                                    <span>Front of House</span>
                                </div>
                                <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>Guest Menu</h2>
                                <p className="text-sm mb-4" style={{ color: 'var(--muted)', lineHeight: '1.5' }}>
                                    Interactive digital ordering experience for patrons. High-resolution imagery, allergen filters, and table-side checkout integration.
                                </p>
                                <span className="card-link">
                                    Launch Menu <ArrowRight size={14} />
                                </span>
                            </div>
                        </Link>

                        {/* Kitchen Dashboard & Cashier Console Grid */}
                        <div className="console-grid">
                            <Link to="/kitchen" className="console-card">
                                <div className="card-header-row">
                                    <div className="card-icon-container" style={{ color: 'var(--accent)' }}>
                                        <ChefHat size={24} />
                                    </div>
                                    <span className="console-badge kitchen">12 Active Orders</span>
                                </div>
                                <div>
                                    <h2 className="text-base font-bold mb-2" style={{ color: 'var(--text)' }}>Kitchen Dashboard</h2>
                                    <p className="text-xs" style={{ color: 'var(--muted)', lineHeight: '1.5' }}>
                                        Real-time KDS to streamline culinary operations. View tickets, manage station timers, and update stock availability instantly.
                                    </p>
                                    <span className="card-link">
                                        Open Kitchen <ArrowRight size={14} />
                                    </span>
                                </div>
                            </Link>

                            <Link to="/counter" className="console-card">
                                <div className="card-header-row">
                                    <div className="card-icon-container" style={{ color: 'var(--accent2)' }}>
                                        <Wallet size={24} />
                                    </div>
                                    <span className="console-badge cashier">Register: Shift Open</span>
                                </div>
                                <div>
                                    <h2 className="text-base font-bold mb-2" style={{ color: 'var(--text)' }}>Cashier Console</h2>
                                    <p className="text-xs" style={{ color: 'var(--muted)', lineHeight: '1.5' }}>
                                        Unified point-of-sale terminal. Manage split bills, process loyalty rewards, and review end-of-day financial summaries.
                                    </p>
                                    <span className="card-link">
                                        Launch POS <ArrowRight size={14} />
                                    </span>
                                </div>
                            </Link>
                        </div>
                    </div>

                    <footer className="portal-main-footer">
                        <span>&copy; 2026 DineFlow Systems &bull; Version 2.4.1</span>
                        <div className="footer-links">
                            <a href="#security">Security</a>
                            <a href="#support">Support</a>
                            <a href="#docs">Documentation</a>
                        </div>
                    </footer>
                </div>
            </main>
        </div>
    );
}
