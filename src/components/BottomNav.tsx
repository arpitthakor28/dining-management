import React from 'react';
import { Home, ClipboardList, Receipt, HelpCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const getTableIdFromUrl = (): string => {
    const match = window.location.pathname.match(/\/table\/([^\/]+)/);
    return match ? match[1] : 'T-12';
  };

  const tableId = getTableIdFromUrl();
  const navItems = [
    { path: `/table/${tableId}/menu`, icon: <Home size={24} />, label: 'Menu' },
    { path: `/table/${tableId}/status`, icon: <ClipboardList size={24} />, label: 'Orders' },
    { path: `/table/${tableId}/bill`, icon: <Receipt size={24} />, label: 'Bill' },
    { path: `/table/${tableId}/help`, icon: <HelpCircle size={24} />, label: 'Help' },
  ];

  return (
    <div className="fixed bottom-0 w-full max-w-[480px] bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center z-50">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button 
            key={item.label}
            className={`flex flex-col items-center gap-1 bg-transparent p-1 ${isActive ? 'text-primary' : 'text-gray-400'}`}
            onClick={() => navigate(item.path)}
          >
            {item.icon}
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
