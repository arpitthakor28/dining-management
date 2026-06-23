import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Utensils, ChefHat, Wallet, Radio, Database, Activity, Server, CheckCircle, HelpCircle, QrCode } from 'lucide-react';
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
    const handleMouseMove = (e) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    };
    return (<div className="home-portal-wrapper">
      <style>{`
        .home-portal-wrapper {
          min-height: 100vh;
          background-color: var(--bg);
          color: var(--text);
          padding: 64px 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          position: relative;
          overflow-x: hidden;
        }

        .ambient-glow-1 {
          position: absolute;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(63, 185, 80, 0.03) 0%, transparent 70%);
          top: -200px;
          left: -100px;
          z-index: 0;
          pointer-events: none;
        }
        .ambient-glow-2 {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(88, 166, 255, 0.02) 0%, transparent 70%);
          bottom: -200px;
          right: -100px;
          z-index: 0;
          pointer-events: none;
        }

        .portal-container {
          max-width: 900px;
          width: 100%;
          z-index: 1;
          display: grid;
          grid-template-cols: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        @media (max-width: 768px) {
          .portal-container {
            grid-template-cols: minmax(0, 1fr);
            padding: 40px 0;
          }
        }

        .portal-header {
          grid-column: span 2;
          text-align: center;
          margin-bottom: 12px;
        }

        @media (max-width: 768px) {
          .portal-header {
            grid-column: span 1;
          }
        }

        .portal-logo-glow {
          display: inline-flex;
          padding: 12px;
          border-radius: 20px;
          background: rgba(63, 185, 80, 0.08);
          border: 1px solid rgba(63, 185, 80, 0.2);
          box-shadow: 0 0 20px rgba(63, 185, 80, 0.1);
          margin-bottom: 20px;
          color: var(--accent);
        }

        .portal-title {
          font-size: 28px;
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 12px;
        }

        .portal-subtitle {
          font-size: 14px;
          color: var(--muted);
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.5;
        }

        .roles-grid {
          grid-column: span 2;
          display: grid;
          grid-template-cols: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        @media (max-width: 768px) {
          .roles-grid {
            grid-column: span 1;
            grid-template-cols: minmax(0, 1fr);
          }
        }

        .reflective-card {
          position: relative;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 24px;
          text-decoration: none;
          color: inherit;
          transition: all 0.15s ease;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .reflective-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(
            350px circle at var(--mouse-x, 0) var(--mouse-y, 0),
            rgba(88, 166, 255, 0.06),
            transparent 80%
          );
          z-index: 0;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .reflective-card:hover {
          transform: translateY(-2px);
          border-color: var(--accent2);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
        }

        .reflective-card:hover::before {
          opacity: 1;
        }

        .card-icon-container {
          width: 40px;
          height: 40px;
          border-radius: var(--radius);
          background: var(--surface2);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
          color: var(--muted);
          z-index: 1;
        }

        .reflective-card:hover .card-icon-container {
          background: rgba(88, 166, 255, 0.1);
          border-color: rgba(88, 166, 255, 0.2);
          color: var(--accent2);
        }

        .card-info {
          z-index: 1;
        }

        .card-title {
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 6px;
          color: var(--text);
        }

        .card-desc {
          font-size: 13px;
          color: var(--muted);
          line-height: 1.5;
        }

        .diagnostics-panel {
          grid-column: span 2;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 20px 24px;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        @media (max-width: 768px) {
          .diagnostics-panel {
            grid-column: span 1;
            flex-direction: column;
            align-items: flex-start;
          }
        }

        .health-status {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .pulse-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          position: relative;
        }

        .pulse-dot.online {
          background-color: var(--accent);
          box-shadow: 0 0 10px var(--accent);
        }

        .pulse-dot.online::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid var(--accent);
          animation: pulse 1.8s infinite;
          opacity: 0.8;
        }

        .pulse-dot.offline {
          background-color: var(--danger);
          box-shadow: 0 0 10px var(--danger);
        }

        .pulse-dot.offline::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid var(--danger);
          animation: pulse 1.8s infinite;
          opacity: 0.8;
        }

        .health-text {
          font-size: 14px;
          font-weight: 500;
          color: var(--text);
        }

        .diagnostic-stats {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--muted);
        }

        .stat-icon {
          color: var(--muted);
        }

        .stat-label {
          color: var(--muted);
          font-weight: 500;
        }

        .portal-footer {
          grid-column: span 2;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: var(--muted);
          padding-top: 16px;
          border-top: 1px solid var(--border);
        }

        @media (max-width: 768px) {
          .portal-footer {
            grid-column: span 1;
            flex-direction: column;
            gap: 12px;
            align-items: center;
          }
        }

        @keyframes pulse {
          0% {
            transform: scale(0.8);
            opacity: 0.8;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>

      <div className="ambient-glow-1"></div>
      <div className="ambient-glow-2"></div>

      <div className="portal-container">
        
        {/* Header */}
        <div className="portal-header">
          <div className="portal-logo-glow">
            <Radio size={28} className="animate-pulse"/>
          </div>
          <h1 className="portal-title">DineFlow Ordering System</h1>
          <p className="portal-subtitle">
            Synchronized restaurant dispatch, kitchen KOT execution, and billing dashboard. 
            Powered by a real-time Node.js Express server.
          </p>
        </div>

        {/* Diagnostic Panel */}
        <div className="diagnostics-panel">
          <div className="health-status">
            <div className={`pulse-dot ${isConnected ? 'online' : 'offline'}`}></div>
            <div>
              <span className="health-text">
                {isConnected ? 'Node.js Sync Server Online' : 'Connecting to Server...'}
              </span>
              <span className="block text-meta">
                {isConnected ? 'Socket.io link established' : 'Retrying WebSocket...'}
              </span>
            </div>
          </div>
          
          <div className="diagnostic-stats">
            <div className="stat-item">
              <Activity size={14} className="stat-icon"/>
              <span className="stat-label">Latency:</span>
              <span className="font-mono text-green-400">{latency !== null ? `${latency}ms` : '--'}</span>
            </div>
            
            <div className="stat-item">
              <Database size={14} className="stat-icon"/>
              <span className="stat-label">Database:</span>
              <span className="font-mono text-green-400">SQLite (dineflow.db)</span>
            </div>

            <div className="stat-item">
              <Server size={14} className="stat-icon"/>
              <span className="stat-label">Engine:</span>
              <span className="font-mono text-emerald-400">Express + Socket.io</span>
            </div>
          </div>
        </div>

        {/* Roles Grid */}
        <div className="roles-grid">
          
          {/* Guest Menu Card */}
          <Link to="/menu" className="reflective-card" onMouseMove={handleMouseMove}>
            <div className="card-icon-container">
              <Utensils size={20}/>
            </div>
            <div className="card-info">
              <h2 className="card-title">Guest Digital Menu</h2>
              <p className="card-desc">
                Browse delicacies, customize orders, and submit tickets directly from Table 12.
              </p>
            </div>
            <div className="mt-auto flex justify-between items-center text-meta pt-4 border-t border-white/5">
              <span style={{ color: 'var(--accent2)' }}>Enter Guest Dining</span>
              <span style={{ color: 'var(--accent2)' }}>Table T-12 →</span>
            </div>
          </Link>

          {/* Kitchen Card */}
          <Link to="/kitchen" className="reflective-card" onMouseMove={handleMouseMove}>
            <div className="card-icon-container">
              <ChefHat size={20}/>
            </div>
            <div className="card-info">
              <h2 className="card-title">Kitchen KOT Queue</h2>
              <p className="card-desc">
                Real-time dashboard for chefs to review and prepare incoming dishes.
              </p>
            </div>
            <div className="mt-auto flex justify-between items-center text-meta pt-4 border-t border-white/5">
              <span style={{ color: 'var(--accent2)' }}>Open KOT Dashboard</span>
              <span style={{ color: 'var(--accent2)' }}>Staff Login →</span>
            </div>
          </Link>

          {/* Counter Card */}
          <Link to="/counter" className="reflective-card" onMouseMove={handleMouseMove}>
            <div className="card-icon-container">
              <Wallet size={20}/>
            </div>
            <div className="card-info">
              <h2 className="card-title">Counter Billing</h2>
              <p className="card-desc">
                Monitor active tables, handle bill requests, print PDFs, and settle tables.
              </p>
            </div>
            <div className="mt-auto flex justify-between items-center text-meta pt-4 border-t border-white/5">
              <span style={{ color: 'var(--accent2)' }}>Open Cashier Screen</span>
              <span style={{ color: 'var(--accent2)' }}>Manager Login →</span>
            </div>
          </Link>

          {/* QR & Table Config Card */}
          <Link to="/admin/qr" className="reflective-card" onMouseMove={handleMouseMove}>
            <div className="card-icon-container">
              <QrCode size={20}/>
            </div>
            <div className="card-info">
              <h2 className="card-title">Table Simulator & QR</h2>
              <p className="card-desc">
                Configure table counts, retrieve table tokens, and print QR codes.
              </p>
            </div>
            <div className="mt-auto flex justify-between items-center text-meta pt-4 border-t border-white/5">
              <span style={{ color: 'var(--accent2)' }}>Manage Tables</span>
              <span style={{ color: 'var(--accent2)' }}>Manager Login →</span>
            </div>
          </Link>

        </div>

        {/* Footer Support Info */}
        <div className="portal-footer">
          <span className="flex items-center gap-1">
            <CheckCircle size={12} className="text-green-500"/>
            Reliable Live-Sync Network Layer active
          </span>
          <Link to="/help" className="hover:underline flex items-center gap-1" style={{ color: 'var(--muted)' }}>
            <HelpCircle size={12}/>
            DineFlow Support
          </Link>
        </div>

      </div>
    </div>);
}
