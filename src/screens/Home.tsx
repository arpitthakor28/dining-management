import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Utensils, 
  ChefHat, 
  Wallet, 
  Radio, 
  Database, 
  Activity, 
  Server, 
  CheckCircle,
  HelpCircle,
  QrCode
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Home() {
  const { isConnected } = useCart();
  const [latency, setLatency] = useState<number | null>(null);

  // Measure latency to backend for reliable diagnostic reporting
  useEffect(() => {
    const measureLatency = async () => {
      const start = performance.now();
      try {
        const response = await fetch('http://localhost:8080/api/menu');
        if (response.ok) {
          setLatency(Math.round(performance.now() - start));
        }
      } catch (err) {
        setLatency(null);
      }
    };

    measureLatency();
    const interval = setInterval(measureLatency, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div className="home-portal-wrapper">
      <style>{`
        .home-portal-wrapper {
          min-height: 100vh;
          background: radial-gradient(circle at 50% 0%, #152219 0%, #0d120e 100%);
          color: #f1f5f2;
          padding: 40px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'Outfit', sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* Ambient glowing circles */
        .ambient-glow-1 {
          position: absolute;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(34, 197, 94, 0.08) 0%, transparent 70%);
          top: -200px;
          left: -100px;
          z-index: 0;
          pointer-events: none;
        }
        .ambient-glow-2 {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(34, 197, 94, 0.05) 0%, transparent 70%);
          bottom: -200px;
          right: -100px;
          z-index: 0;
          pointer-events: none;
        }

        .portal-container {
          max-width: 960px;
          width: 100%;
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .portal-header {
          text-align: center;
          margin-bottom: 12px;
        }

        .portal-logo-glow {
          display: inline-flex;
          padding: 12px;
          border-radius: 20px;
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.25);
          box-shadow: 0 0 20px rgba(34, 197, 94, 0.2);
          margin-bottom: 20px;
          color: #22c55e;
        }

        .portal-title {
          font-size: 2.75rem;
          font-weight: 800;
          letter-spacing: -1.5px;
          background: linear-gradient(135deg, #ffffff 0%, #a7f3d0 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 12px;
        }

        .portal-subtitle {
          font-size: 1.1rem;
          color: #94a3b8;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        /* Glassmorphic Card system with reflective hover */
        .roles-grid {
          display: grid;
          grid-template-cols: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
        }

        .reflective-card {
          position: relative;
          background: rgba(20, 30, 24, 0.6);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 28px;
          text-decoration: none;
          color: inherit;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), 
                      border-color 0.4s ease, 
                      box-shadow 0.4s ease;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        /* Radial light glare reflection on hover */
        .reflective-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(
            350px circle at var(--mouse-x, 0) var(--mouse-y, 0),
            rgba(34, 197, 94, 0.12),
            transparent 80%
          );
          z-index: 0;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.5s ease;
        }

        .reflective-card:hover {
          transform: translateY(-8px);
          border-color: rgba(34, 197, 94, 0.4);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4), 
                      0 0 2px rgba(34, 197, 94, 0.3) inset;
        }

        .reflective-card:hover::before {
          opacity: 1;
        }

        .card-icon-container {
          width: 50px;
          height: 50px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.3s, border-color 0.3s, transform 0.3s;
          color: #94a3b8;
          z-index: 1;
        }

        .reflective-card:hover .card-icon-container {
          background: rgba(34, 197, 94, 0.1);
          border-color: rgba(34, 197, 94, 0.2);
          color: #22c55e;
          transform: scale(1.05);
        }

        .card-info {
          z-index: 1;
        }

        .card-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 6px;
          color: #f8fafc;
        }

        .card-desc {
          font-size: 0.88rem;
          color: #94a3b8;
          line-height: 1.5;
        }

        /* Reliable Status panel */
        .diagnostics-panel {
          background: rgba(15, 23, 18, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          padding: 20px 24px;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
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
          background-color: #22c55e;
          box-shadow: 0 0 10px #22c55e;
        }

        .pulse-dot.online::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid #22c55e;
          animation: pulse 1.8s infinite;
          opacity: 0.8;
        }

        .pulse-dot.offline {
          background-color: #ef4444;
          box-shadow: 0 0 10px #ef4444;
        }

        .pulse-dot.offline::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid #ef4444;
          animation: pulse 1.8s infinite;
          opacity: 0.8;
        }

        .health-text {
          font-size: 0.9rem;
          font-weight: 600;
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
          font-size: 0.85rem;
          color: #64748b;
        }

        .stat-icon {
          color: #475569;
        }

        .stat-label {
          color: #94a3b8;
          font-weight: 500;
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

        @media (max-width: 768px) {
          .portal-title {
            font-size: 2.2rem;
          }
          .diagnostics-panel {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="ambient-glow-1"></div>
      <div className="ambient-glow-2"></div>

      <div className="portal-container">
        
        {/* Header */}
        <div className="portal-header">
          <div className="portal-logo-glow">
            <Radio size={32} className="animate-pulse" />
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
              <span className="block text-xs text-gray-500 font-mono">
                {isConnected ? 'Socket.io link established' : 'Retrying WebSocket...'}
              </span>
            </div>
          </div>
          
          <div className="diagnostic-stats">
            <div className="stat-item">
              <Activity size={16} className="stat-icon" />
              <span className="stat-label">Latency:</span>
              <span className="font-mono text-green-400">{latency !== null ? `${latency}ms` : '--'}</span>
            </div>
            
            <div className="stat-item">
              <Database size={16} className="stat-icon" />
              <span className="stat-label">Database:</span>
              <span className="font-mono text-green-400">SQLite (dineflow.db)</span>
            </div>

            <div className="stat-item">
              <Server size={16} className="stat-icon" />
              <span className="stat-label">Engine:</span>
              <span className="font-mono text-emerald-400">Express + Socket.io</span>
            </div>
          </div>
        </div>

        {/* Roles Grid */}
        <div className="roles-grid">
          
          {/* Guest Menu Card */}
          <Link 
            to="/menu" 
            className="reflective-card"
            onMouseMove={handleMouseMove}
          >
            <div className="card-icon-container">
              <Utensils size={24} />
            </div>
            <div className="card-info">
              <h2 className="card-title">Guest Digital Menu</h2>
              <p className="card-desc">
                Browse delicacies, customize orders, and submit tickets directly from Table 12.
              </p>
            </div>
            <div className="mt-auto flex justify-between items-center text-xs font-semibold text-green-400 pt-4 border-t border-white/5">
              <span>Enter Guest Dining</span>
              <span>Table T-12 →</span>
            </div>
          </Link>

          {/* Kitchen Card */}
          <Link 
            to="/kitchen" 
            className="reflective-card"
            onMouseMove={handleMouseMove}
          >
            <div className="card-icon-container">
              <ChefHat size={24} />
            </div>
            <div className="card-info">
              <h2 className="card-title">Kitchen KOT Queue</h2>
              <p className="card-desc">
                Real-time dashboard for chefs to review and prepare incoming dishes.
              </p>
            </div>
            <div className="mt-auto flex justify-between items-center text-xs font-semibold text-green-400 pt-4 border-t border-white/5">
              <span>Open KOT Dashboard</span>
              <span>Staff Login →</span>
            </div>
          </Link>

          {/* Counter Card */}
          <Link 
            to="/counter" 
            className="reflective-card"
            onMouseMove={handleMouseMove}
          >
            <div className="card-icon-container">
              <Wallet size={24} />
            </div>
            <div className="card-info">
              <h2 className="card-title">Counter Billing</h2>
              <p className="card-desc">
                Monitor active tables, handle bill requests, print PDFs, and settle tables.
              </p>
            </div>
            <div className="mt-auto flex justify-between items-center text-xs font-semibold text-green-400 pt-4 border-t border-white/5">
              <span>Open Cashier Screen</span>
              <span>Manager Login →</span>
            </div>
          </Link>

          {/* QR & Table Config Card */}
          <Link 
            to="/admin/qr" 
            className="reflective-card"
            onMouseMove={handleMouseMove}
          >
            <div className="card-icon-container">
              <QrCode size={24} />
            </div>
            <div className="card-info">
              <h2 className="card-title">Table Simulator & QR</h2>
              <p className="card-desc">
                Configure table counts, retrieve table tokens, and print QR codes.
              </p>
            </div>
            <div className="mt-auto flex justify-between items-center text-xs font-semibold text-green-400 pt-4 border-t border-white/5">
              <span>Manage Tables</span>
              <span>Manager Login →</span>
            </div>
          </Link>

        </div>

        {/* Footer Support Info */}
        <div className="flex justify-between items-center text-xs text-gray-500 pt-6 border-t border-white/5">
          <span className="flex items-center gap-1">
            <CheckCircle size={12} className="text-green-500" />
            Reliable Live-Sync Network Layer active
          </span>
          <Link to="/help" className="hover:text-green-400 flex items-center gap-1 text-gray-500">
            <HelpCircle size={12} />
            DineFlow Support
          </Link>
        </div>

      </div>
    </div>
  );
}
