import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ShieldAlert } from 'lucide-react';
export default function Login() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [mode, setMode] = useState('login');
    const [restaurantName, setRestaurantName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const rawRedirect = searchParams.get('redirect') || '/home';
    const redirect = rawRedirect.includes('/login') ? '/home' : decodeURIComponent(rawRedirect);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!email.trim() || !password) {
            setError('Please fill in all fields.');
            return;
        }
        try {
            const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
            const body = mode === 'login'
                ? { email: email.trim(), password }
                : { restaurantName: restaurantName.trim(), email: email.trim(), password };
            const response = await fetch(`http://localhost:8080${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
            const data = await response.json();
            if (!response.ok) {
                setError(data.error || 'Authentication failed. Please check details.');
                return;
            }
            localStorage.setItem('token', data.token);
            localStorage.setItem('restaurant_id', data.restaurantId);
            localStorage.setItem('staff_role', data.role);
            localStorage.setItem('staff_auth', 'true');
            const targetRedirect = data.role === 'kitchen' ? '/kitchen' : (redirect || '/home');
            navigate(targetRedirect);
        }
        catch (err) {
            console.error(err);
            setError('Connection error. Is the backend server running?');
        }
    };
    const handleMouseMove = (e) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    };
    return (<div className="login-portal-wrapper">
      <style>{`
        .login-portal-wrapper {
          min-height: 100vh;
          background: radial-gradient(circle at 50% 0%, #152219 0%, #0d120e 100%);
          color: #f1f5f2;
          padding: 40px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          position: relative;
          overflow: hidden;
        }

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

        .reflective-login-card {
          position: relative;
          background: rgba(20, 30, 24, 0.65);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 28px;
          padding: 40px;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
          overflow: hidden;
          z-index: 1;
          transition: border-color 0.4s ease, box-shadow 0.4s ease;
        }

        .reflective-login-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(
            400px circle at var(--mouse-x, 0) var(--mouse-y, 0),
            rgba(34, 197, 94, 0.15),
            transparent 80%
          );
          z-index: 0;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.5s ease;
        }

        .reflective-login-card:hover {
          border-color: rgba(34, 197, 94, 0.4);
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6), 
                      0 0 2px rgba(34, 197, 94, 0.3) inset;
        }

        .reflective-login-card:hover::before {
          opacity: 1;
        }

        .card-content {
          position: relative;
          z-index: 1;
        }

        .lock-icon-container {
          width: 56px;
          height: 56px;
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.2);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px auto;
          color: #22c55e;
        }

        .card-title {
          font-size: 24px;
          font-weight: 800;
          margin-bottom: 6px;
          text-align: center;
          color: #f1f5f2;
        }

        .card-subtitle {
          color: #8b949e;
          font-size: 14px;
          margin-bottom: 24px;
          font-weight: 600;
          text-align: center;
        }

        .mode-selector-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 24px;
        }

        .role-btn {
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.02);
          transition: all 0.3s ease;
          padding: 12px 16px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          cursor: pointer;
          color: #8b949e;
        }

        .role-btn.active {
          background: linear-gradient(135deg, #22c55e 0%, #15803d 100%);
          border-color: rgba(34, 197, 94, 0.4);
          color: white !important;
          box-shadow: 0 4px 12px rgba(34, 197, 94, 0.35);
        }

        .role-btn:not(.active):hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.15);
          color: #f1f5f2;
        }

        .error-container {
          margin-bottom: 16px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.25);
          color: #fca5a5;
          font-size: 12px;
          font-weight: 600;
          padding: 14px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          text-align: left;
        }

        .input-label {
          display: block;
          text-align: left;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          color: #8b949e;
          letter-spacing: 0.05em;
        }

        .input-glow {
          width: 100%;
          background: rgba(255, 255, 255, 0.03) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          color: #f1f5f2 !important;
          border-radius: 12px;
          padding: 14px 16px;
          outline: none;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.25s ease;
          box-sizing: border-box;
        }

        .input-glow:focus {
          border-color: #22c55e !important;
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.15) !important;
        }

        .font-mono {
          font-family: monospace !important;
        }

        .submit-btn {
          width: 100%;
          background: linear-gradient(135deg, #22c55e 0%, #15803d 100%) !important;
          color: #ffffff !important;
          border: 1px solid rgba(34, 197, 94, 0.4) !important;
          box-shadow: 0 4px 14px 0 rgba(34, 197, 94, 0.3), 
                      0 0 1px 1px rgba(255, 255, 255, 0.2) inset !important;
          font-weight: 800;
          padding: 14px;
          border-radius: 12px;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          text-transform: uppercase;
          font-size: 12px;
          letter-spacing: 0.05em;
          margin-top: 10px;
          cursor: pointer;
          display: block;
        }

        .submit-btn:hover {
          transform: translateY(-2px);
          background: linear-gradient(135deg, #4ade80 0%, #16a34a 100%) !important;
          box-shadow: 0 6px 20px 0 rgba(34, 197, 94, 0.45), 
                      0 0 1px 1px rgba(255, 255, 255, 0.3) inset !important;
        }

        .submit-btn:active {
          transform: translateY(1px) scale(0.97);
          box-shadow: 0 2px 8px 0 rgba(34, 197, 94, 0.2) !important;
        }

        .footer-text {
          text-align: center;
          font-size: 10px;
          color: #5c646d;
          margin-top: 32px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        @media (max-width: 480px) {
          .reflective-login-card {
            padding: 24px;
            border-radius: 20px;
          }
        }
      `}</style>

      <div className="ambient-glow-1"></div>

      <div className="reflective-login-card" onMouseMove={handleMouseMove}>
        <div className="card-content">
          <div className="lock-icon-container">
            <Lock size={26}/>
          </div>
          
          <h2 className="card-title">DineFlow Portal</h2>
          <p className="card-subtitle">
            {mode === 'login' ? 'Enter credentials to authorize console access.' : 'Register a new restaurant tenant session.'}
          </p>

          <div className="mode-selector-grid">
            <button type="button" onClick={() => { setMode('login'); setError(''); }} className={`role-btn ${mode === 'login' ? 'active' : ''}`}>
              Sign In
            </button>
            <button type="button" onClick={() => { setMode('signup'); setError(''); }} className={`role-btn ${mode === 'signup' ? 'active' : ''}`}>
              Register
            </button>
          </div>

          {error && (<div className="error-container">
              <ShieldAlert size={16} style={{ color: '#ef4444', flexShrink: 0 }}/>
              <span>{error}</span>
            </div>)}

          <form onSubmit={handleSubmit} className="login-form">
            {mode === 'signup' && (<div className="form-group">
                <label className="input-label">Restaurant Name</label>
                <input type="text" placeholder="e.g. Ocean Grill" value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} className="input-glow" required/>
              </div>)}

            <div className="form-group">
              <label className="input-label">Email Address</label>
              <input type="email" placeholder="e.g. manager@test.com" value={email} onChange={(e) => setEmail(e.target.value)} className="input-glow" required/>
            </div>

            <div className="form-group">
              <label className="input-label">Password</label>
              <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="input-glow font-mono" required/>
            </div>

            <button type="submit" className="submit-btn">
              {mode === 'login' ? 'Access Dashboard' : 'Create Restaurant'}
            </button>
          </form>
        </div>
      </div>
      
      <p className="footer-text">Powered by DineFlow</p>
    </div>);
}
