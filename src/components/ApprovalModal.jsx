import React from 'react';
import { AlertTriangle, User } from 'lucide-react';

export default function ApprovalModal({ onApprove, onDecline }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="bg-green-50 p-6 flex flex-col items-center text-center border-b border-green-100">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-primary mb-3">
            <AlertTriangle size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 leading-tight mb-1">Bill Request Approval</h2>
          <p className="text-sm text-muted">Guest 1 has requested the final bill.</p>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg mb-6 border border-gray-200">
            <User className="text-gray-400" size={20} />
            <span className="text-sm font-medium text-gray-700">Waiting for 1 more approval (Guest 2)</span>
          </div>

          <p className="text-sm text-center text-gray-600 border-l-2 border-primary pl-3 italic mb-6">
            "Once approved, Table 12 ordering will be locked and sent to counter."
          </p>

          <div className="flex gap-3">
            <button 
              onClick={onDecline}
              className="flex-1 btn-secondary text-gray-700 active:bg-gray-100"
            >
              Decline
            </button>
            <button 
              onClick={onApprove}
              className="flex-1 btn-primary"
            >
              Approve
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
