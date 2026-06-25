import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
export default function QRJoin() {
    const navigate = useNavigate();
    const { restaurantId, tableId } = useParams();
    const activeRestaurantId = restaurantId || 'r_001';
    const activeTableId = tableId || 'token_t1';
    const [tableNumber, setTableNumber] = useState('');

    useEffect(() => {
        const fetchTableDetails = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/tables/validate?tableId=${activeTableId}&token=${activeTableId}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.valid) {
                        setTableNumber(data.tableNumber);
                    }
                }
            } catch (err) {
                console.error("Error fetching table details in QRJoin:", err);
            }
        };
        fetchTableDetails();
    }, [activeTableId]);

    const handleMouseMove = (e) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    };
    return (<div className="dark-theme-wrapper flex flex-col items-center justify-center p-6 text-center">
      <div className="ambient-glow-bubble-1"></div>
      <div className="ambient-glow-bubble-2"></div>
      
      <div className="mb-12 mt-12 z-10">
        <div className="rounded-full flex items-center justify-center mx-auto mb-4" style={{
            width: '80px',
            height: '80px',
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.25)',
            boxShadow: '0 0 20px rgba(34, 197, 94, 0.2)'
        }}>
          <span className="text-3xl">🍽️</span>
        </div>
        <h1 className="text-3xl font-black mb-2 text-glow" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #a7f3d0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          The Spice Route
        </h1>
        <h2 className="text-xl font-bold text-gray-400">Table {tableNumber}</h2>
      </div>
      
      <div className="glass-card w-full max-w-[400px] mb-8 flex flex-col items-center p-8 border border-white/10" onMouseMove={handleMouseMove}>
        <div className="flex items-center gap-2 mb-4 text-green-400 z-10 font-bold">
          <Users size={24} className="animate-pulse"/>
          <span className="text-lg">Group Session Connected</span>
        </div>
        
        <p className="text-gray-400 text-sm mb-6 leading-relaxed font-semibold z-10">
          Join the shared table session to browse the menu, build your cart, and place orders together.
        </p>
        
        <button className="btn-premium-green w-full font-black py-4 rounded-xl transition-all uppercase text-xs tracking-wider z-10" onClick={() => navigate(`/restaurant/${activeRestaurantId}/table/${activeTableId}/menu${window.location.search}`)}>
          Join Session
        </button>
      </div>
      
      <div className="mt-auto pt-8 z-10">
        <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Powered by DineFlow</p>
      </div>
    </div>);
}
