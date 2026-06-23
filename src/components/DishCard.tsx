import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface DishCardProps {
  name: string;
  price: number;
  image: string;
  hasHalfFull?: boolean;
}

export default function DishCard({ name, price, image, hasHalfFull }: DishCardProps) {
  const [quantity, setQuantity] = useState(0);
  const [size, setSize] = useState<'half' | 'full'>('full');
  
  const displayPrice = size === 'half' ? price * 0.6 : price;

  return (
    <div className="card w-full flex flex-row gap-4 mb-4">
      <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden relative border border-gray-100 shadow-sm">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover" 
          loading="lazy"
        />
      </div>
      
      <div className="flex flex-col flex-grow justify-between py-1">
        <div>
          <h3 className="font-semibold text-lg leading-tight">{name}</h3>
          <p className="text-primary font-bold mt-1">₹{displayPrice}</p>
        </div>
        
        {hasHalfFull && (
          <div className="flex gap-2 mt-2">
            <button 
              className={`text-xs px-2 py-1 rounded border ${size === 'half' ? 'bg-primary text-white border-primary' : 'bg-transparent text-muted border-gray-300'}`}
              onClick={() => setSize('half')}
            >
              Half
            </button>
            <button 
              className={`text-xs px-2 py-1 rounded border ${size === 'full' ? 'bg-primary text-white border-primary' : 'bg-transparent text-muted border-gray-300'}`}
              onClick={() => setSize('full')}
            >
              Full
            </button>
          </div>
        )}
        
        <div className="flex justify-end mt-2">
          {quantity === 0 ? (
            <button 
              className="btn-outline text-sm px-6 py-1"
              onClick={() => setQuantity(1)}
            >
              ADD
            </button>
          ) : (
            <div className="flex items-center gap-3 bg-orange-50 border border-primary rounded-md px-2 py-1 text-primary">
              <button onClick={() => setQuantity(q => Math.max(0, q - 1))} className="p-1">
                <Minus size={16} />
              </button>
              <span className="font-semibold w-4 text-center">{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)} className="p-1">
                <Plus size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
