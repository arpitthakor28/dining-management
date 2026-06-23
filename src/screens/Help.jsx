import React from 'react';
import { ShoppingBag, Flame, CheckCircle2, QrCode, BellRing } from 'lucide-react';
import BottomNav from '../components/BottomNav';
export default function Help() {
    const getTableId = () => window.location.pathname.match(/\/table\/([^\/]+)/)?.[1] || 'T-12';
    const tableId = getTableId();
    const tableNumber = tableId.replace('T-', '');
    const handleCallStaff = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/help', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tableId, type: 'staff_call' })
            });
            if (response.ok) {
                alert(`Staff called for Table ${tableNumber}! A waiter will be with you shortly.`);
            }
            else {
                alert('Could not call staff. Please call a waiter in person.');
            }
        }
        catch (err) {
            console.error("Error calling staff:", err);
            alert('Network error. Please call a waiter in person.');
        }
    };
    return (<div className="pb-36 pt-6 px-5 bg-white min-h-screen">
      
      <div className="text-center mb-6">
        <QrCode className="mx-auto text-primary mb-3" size={48}/>
        <h1 className="text-2xl font-black text-gray-800">Dining Assistant</h1>
        <p className="text-gray-500 mt-2 font-medium">Table {tableNumber}</p>
      </div>

      {/* Call Staff Action Box */}
      <div className="bg-green-50 rounded-2xl border border-green-100 p-5 mb-8 text-center shadow-sm">
        <div className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md active:scale-95 transition-all">
          <BellRing size={26} className="animate-wiggle"/>
        </div>
        <h3 className="font-bold text-gray-850 mb-1 text-base">Need Assistance?</h3>
        <p className="text-xs text-gray-500 mb-4 max-w-xs mx-auto">
          Tap the button below to call a waiter to your table for water, extra cutlery, or general queries.
        </p>
        <button onClick={handleCallStaff} className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-6 rounded-lg text-sm transition-all shadow-md active:scale-95">
          Call Waiter
        </button>
      </div>

      <h3 className="font-bold text-gray-800 text-sm mb-6 uppercase tracking-wider text-center">How to use DineFlow</h3>

      <div className="space-y-8 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-green-200 before:to-transparent">

        {/* Step 1 */}
        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active text-left">
          <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white bg-green-100 text-primary shadow-sm flex-shrink-0 relative z-10 font-bold text-xl">
             1
          </div>
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] ml-[1.5rem] md:ml-0 md:group-even:mr-[2.5rem] md:group-even:text-right">
             <div className="bg-gray-50 p-5 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-2 md:justify-end md:group-odd:justify-start">
                   <ShoppingBag size={20} className="text-primary"/>
                   <h3 className="font-bold text-lg text-gray-800">Add to Cart</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                   Browse our full smart-menu. Click <b>'Add'</b> to drop dishes into your cart. You can increase quantities and add <b>Cooking Instructions</b> in the cart!
                </p>
             </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active text-left">
          <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white bg-orange-100 text-orange-500 shadow-sm flex-shrink-0 relative z-10 font-bold text-xl">
             2
          </div>
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] ml-[1.5rem] md:ml-0 md:group-even:mr-[2.5rem] pl-4 md:pl-0 md:group-even:pr-4 md:group-even:text-right">
             <div className="bg-gray-50 p-5 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-2 md:justify-end md:group-odd:justify-start">
                   <Flame size={20} className="text-orange-500"/>
                   <h3 className="font-bold text-lg text-gray-800">Submit to Kitchen</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                   Go to your Cart via the bottom bar and tap <b>'Submit Order Batch'</b>. This immediately alerts the kitchen to start cooking! You will be securely navigated to the Live Tracker.
                </p>
             </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active text-left">
          <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white bg-blue-100 text-blue-500 shadow-sm flex-shrink-0 relative z-10 font-bold text-xl">
             3
          </div>
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] ml-[1.5rem] md:ml-0 md:group-even:mr-[2.5rem] md:group-even:text-right">
             <div className="bg-blue-50 p-5 rounded-2xl shadow-md border border-blue-100 relative overflow-hidden">
                <CheckCircle2 size={100} className="absolute -right-8 -bottom-8 text-blue-200/50"/>
                <div className="flex items-center gap-3 mb-2 md:justify-end md:group-odd:justify-start relative z-10">
                   <CheckCircle2 size={20} className="text-blue-500"/>
                   <h3 className="font-bold text-lg text-blue-900">Request Bill</h3>
                </div>
                <p className="text-sm text-blue-800 leading-relaxed relative z-10">
                   Once you are ready to pay, navigate to the <b>Bill Tab</b> and tap <b>Request Final Bill</b>. The counter will instantly be pinged to process your session payment!
                </p>
             </div>
          </div>
        </div>

      </div>

      <BottomNav />
    </div>);
}
