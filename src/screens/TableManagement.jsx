import React from 'react';
import { Users, Plus, QrCode } from 'lucide-react';
import { Link } from 'react-router-dom';
export default function TableManagement() {
    return (<div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Table Management</h1>
            <p className="text-muted text-sm">Floor plan and occupancy status</p>
          </div>
          <div className="flex gap-4">
             <Link to="/kitchen" className="text-primary hover:underline font-medium">Kitchen</Link>
             <Link to="/counter" className="text-primary hover:underline font-medium">Counter</Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 flex justify-between items-center">
           <div className="flex gap-6">
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span> Free</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-500"></span> Occupied</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Bill Requested</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-gray-300"></span> Disabled</div>
           </div>
           
           <button className="btn-primary py-2 px-4 flex gap-2 items-center text-sm w-auto"><Plus size={16}/> Add Table</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          
          {/* Table Active */}
          <div className="card border-t-4 border-t-orange-500 flex flex-col items-center p-6 text-center hover:shadow-md transition cursor-pointer">
            <h2 className="text-2xl font-bold mb-2">T-12</h2>
            <div className="flex items-center gap-1 text-orange-600 bg-orange-50 px-3 py-1 rounded-full text-xs font-semibold mb-3">
              <Users size={14}/> 3 Guests
            </div>
            <p className="text-xs text-muted mb-4">₹582.76</p>
            <div className="flex gap-2 w-full mt-auto">
              <button className="btn-secondary w-full py-1 text-xs">Manage</button>
            </div>
          </div>
          
           {/* Table Free */}
           <div className="card border-t-4 border-t-green-500 flex flex-col items-center p-6 text-center hover:shadow-md transition cursor-pointer">
            <h2 className="text-2xl font-bold mb-2">T-14</h2>
            <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-semibold mb-3">
              Free
            </div>
            <p className="text-xs text-muted mb-4 opacity-0">Empty</p>
            <div className="flex gap-2 w-full mt-auto">
              <button className="btn-outline w-full py-1 text-xs flex justify-center items-center gap-1 border-gray-300 text-gray-700"><QrCode size={12}/> Print QR</button>
            </div>
          </div>
          
           {/* Table Free */}
           <div className="card border-t-4 border-t-green-500 flex flex-col items-center p-6 text-center hover:shadow-md transition cursor-pointer">
            <h2 className="text-2xl font-bold mb-2">T-15</h2>
            <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-semibold mb-3">
              Free
            </div>
            <p className="text-xs text-muted mb-4 opacity-0">Empty</p>
            <div className="flex gap-2 w-full mt-auto">
              <button className="btn-outline w-full py-1 text-xs flex justify-center items-center gap-1 border-gray-300 text-gray-700"><QrCode size={12}/> Print QR</button>
            </div>
          </div>
          
           {/* Table Disabled */}
           <div className="card border-t-4 border-t-gray-300 bg-gray-50 opacity-75 flex flex-col items-center p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-500 mb-2">T-16</h2>
            <div className="flex items-center gap-1 text-gray-500 bg-gray-200 px-3 py-1 rounded-full text-xs font-semibold mb-3">
              Clean / Disabled
            </div>
            <p className="text-xs text-muted mb-4 opacity-0">Empty</p>
            <div className="flex gap-2 w-full mt-auto">
              <button className="btn-secondary w-full py-1 text-xs">Enable</button>
            </div>
          </div>

        </div>
      </div>
    </div>);
}
