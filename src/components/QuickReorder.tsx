import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { menuData } from '../data/menuData';
import type { MenuItem } from '../data/menuData';

interface Props {
  onSelect: (item: MenuItem) => void;
}

export default function QuickReorder({ onSelect }: Props) {
  const [showRotiOptions, setShowRotiOptions] = useState(false);
  const [showPapadOptions, setShowPapadOptions] = useState(false);
  
  const rotiItems = menuData.categories.find(c => c.id === 'tandoor')?.items || [];
  
  const papadItems = menuData.categories
    .flatMap(c => c.items)
    .filter(i => i.name.toLowerCase().includes('papad'));

  const getMenuItem = (nameSearch: string) => {
    const beverages = menuData.categories.find(c => c.id === 'beverages')?.items || [];
    return beverages.find(i => i.name.toLowerCase().includes(nameSearch.toLowerCase()));
  };

  return (
    <>
      <div className="mb-6 bg-green-50 p-4 rounded-xl border border-green-100 mx-4">
        <h3 className="font-bold text-sm mb-3 text-green-900">Quick Add-ons</h3>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
          <button 
            onClick={() => setShowRotiOptions(true)}
            className="flex-shrink-0 flex items-center gap-1 bg-white border border-primary text-primary px-4 py-2 rounded-lg font-medium text-sm shadow-sm active:bg-green-100 transition-colors"
          >
            <Plus size={16} /> Add Roti
          </button>
          
          <button 
            onClick={() => {
              const item = getMenuItem('buttermilk');
              if (item) onSelect(item);
            }}
            className="flex-shrink-0 flex items-center gap-1 bg-white border border-primary text-primary px-4 py-2 rounded-lg font-medium text-sm shadow-sm active:bg-green-100 transition-colors"
          >
            <Plus size={16} /> Buttermilk
          </button>
          
          <button 
            onClick={() => setShowPapadOptions(true)}
            className="flex-shrink-0 flex items-center gap-1 bg-white border border-primary text-primary px-4 py-2 rounded-lg font-medium text-sm shadow-sm active:bg-green-100 transition-colors"
          >
            <Plus size={16} /> Papad
          </button>
        </div>
      </div>

      {showRotiOptions && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-xl overflow-hidden animate-in slide-in-from-bottom-10 max-h-[70vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-green-100 flex justify-between items-center bg-green-50">
              <h3 className="font-bold text-lg text-green-900">Select Roti</h3>
              <button onClick={() => setShowRotiOptions(false)} className="p-1.5 bg-white border border-green-200 rounded-full text-green-700 active:bg-green-100"><X size={18} /></button>
            </div>
            <div className="overflow-y-auto p-2">
              {rotiItems.map(item => (
                <button 
                  key={item.name}
                  onClick={() => {
                    setShowRotiOptions(false);
                    onSelect(item);
                  }}
                  className="w-full text-left p-4 border-b border-gray-100 flex justify-between items-center active:bg-green-50 hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-800">{item.name}</span>
                  <span className="text-primary font-bold">₹{item.price}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showPapadOptions && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-xl overflow-hidden animate-in slide-in-from-bottom-10 max-h-[70vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-green-100 flex justify-between items-center bg-green-50">
              <h3 className="font-bold text-lg text-green-900">Select Papad</h3>
              <button onClick={() => setShowPapadOptions(false)} className="p-1.5 bg-white border border-green-200 rounded-full text-green-700 active:bg-green-100"><X size={18} /></button>
            </div>
            <div className="overflow-y-auto p-2">
              {papadItems.map(item => (
                <button 
                  key={item.name}
                  onClick={() => {
                    setShowPapadOptions(false);
                    onSelect(item);
                  }}
                  className="w-full text-left p-4 border-b border-gray-100 flex justify-between items-center active:bg-green-50 hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-800">{item.name}</span>
                  <span className="text-primary font-bold">₹{item.price}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
