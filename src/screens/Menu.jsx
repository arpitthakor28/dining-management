import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle, RefreshCw, BellRing, ShoppingBag, ShoppingCart, ClipboardList, Receipt, X, CheckCircle2, Utensils, ArrowRight } from 'lucide-react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { menuData } from '../data/menuData';
import { useCart } from '../context/CartContext';
export default function Menu() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const getTableId = () => window.location.pathname.match(/\/table\/([^\/]+)/)?.[1] || 'T-12';
    const tableId = getTableId();
    const tableNumber = tableId.replace('T-', '');
    const { items: cartItems, batches, addToCart, updateQuantity, updateNotes, removeFromCart, submitCart, sendComment, requestBill, cartCount, cartTotal, isOrderLocked, isBillRequested, validateTable, sessionId, sessionClosed, clearTableSession } = useCart();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState(menuData.categories[0]?.id || '');
    const [isValidating, setIsValidating] = useState(true);
    const [isValid, setIsValid] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [generalComment, setGeneralComment] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const confirmBill = () => {
        setShowConfirm(false);
        requestBill();
    };
    // Map active tab based on route pathname
    const getActiveTab = () => {
        if (location.pathname.endsWith('/status') || location.pathname.endsWith('/orders')) {
            return 'orders';
        }
        if (location.pathname.endsWith('/bill')) {
            return 'bill';
        }
        return 'menu';
    };
    const activeTab = getActiveTab();
    const handleTabChange = (tabName) => {
        if (tabName === 'menu')
            navigate(`/table/${tableId}/menu${window.location.search}`);
        else if (tabName === 'orders')
            navigate(`/table/${tableId}/status${window.location.search}`);
        else if (tabName === 'bill')
            navigate(`/table/${tableId}/bill${window.location.search}`);
    };
    useEffect(() => {
        const token = searchParams.get('token');
        const savedToken = localStorage.getItem(`table_token_${tableId}`);
        const tokenToUse = token || savedToken;
        if (tokenToUse) {
            validateTable(tableId, tokenToUse).then((valid) => {
                setIsValid(valid);
                setIsValidating(false);
            });
        }
        else {
            setIsValid(false);
            setIsValidating(false);
        }
    }, [tableId, searchParams]);
    const [dbMenuItems, setDbMenuItems] = useState([]);
    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/menu');
                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data) && data.length > 0) {
                        setDbMenuItems(data);
                    }
                }
            }
            catch (err) {
                console.error("Error loading live menu:", err);
            }
        };
        fetchMenu();
    }, []);
    // Filter menu items by search query, mapping from database if available
    const getGroupedMenu = () => {
        if (dbMenuItems.length === 0) {
            return menuData.categories.map(category => {
                return {
                    ...category,
                    items: category.items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
                };
            }).filter(group => group.items.length > 0);
        }
        return menuData.categories.map(category => {
            const itemsForCategory = dbMenuItems.filter(dbItem => {
                const dbCat = dbItem.category?.toLowerCase() || '';
                const localCatId = category.id.toLowerCase();
                const localCatName = category.name.toLowerCase();
                return dbCat === localCatId ||
                    dbCat === localCatName ||
                    dbCat.replace(/_/g, ' ') === localCatId.replace(/_/g, ' ') ||
                    dbCat.replace(/_/g, ' ') === localCatName.replace(/_/g, ' ') ||
                    dbCat.replace(/\s+/g, '') === localCatId.replace(/_/g, '') ||
                    dbCat.replace(/\s+/g, '') === localCatName.replace(/\s+/g, '');
            });
            const mappedItems = itemsForCategory.map(dbItem => ({
                name: dbItem.name,
                price: dbItem.price
            }));
            return {
                ...category,
                items: mappedItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
            };
        }).filter(group => group.items.length > 0);
    };
    const groupedMenu = getGroupedMenu();
    const scrollToCategory = (id) => {
        setActiveCategory(id);
        const el = document.getElementById(`category-${id}`);
        if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 120;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };
    useEffect(() => {
        if (activeTab !== 'menu')
            return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const catId = entry.target.id.replace('category-', '');
                    setActiveCategory(catId);
                }
            });
        }, { rootMargin: '-120px 0px -60% 0px' });
        menuData.categories.forEach((cat) => {
            const el = document.getElementById(`category-${cat.id}`);
            if (el)
                observer.observe(el);
        });
        return () => observer.disconnect();
    }, [activeTab, dbMenuItems]);
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
            console.error(err);
            alert('Connection error');
        }
    };
    const handlePlaceOrder = async () => {
        if (cartItems.length === 0 || isOrderLocked)
            return;
        if (generalComment.trim()) {
            await sendComment(generalComment);
        }
        await submitCart();
        setIsCartOpen(false);
        setGeneralComment('');
        alert('Order placed successfully! Kitchen has been notified.');
        handleTabChange('orders');
    };
    const handleMouseMove = (e) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    };
    // If validating table session
    if (isValidating) {
        return (<div className="light-green-wrapper flex flex-col items-center justify-center p-6 min-h-screen text-slate-800">
        <RefreshCw className="animate-spin text-[#16a34a] mb-4" size={32}/>
        <p className="text-gray-550 font-bold text-sm">Verifying table session...</p>
      </div>);
    }
    // If table access is invalid
    if (!isValid) {
        return (<div className="light-green-wrapper flex flex-col items-center justify-center p-6 text-center min-h-screen text-slate-800">
        <div className="bg-white rounded-3xl border border-gray-200 p-8 max-w-sm shadow-lg flex flex-col items-center">
          <AlertTriangle className="text-orange-500 mb-4" size={48}/>
          <h2 className="text-xl font-extrabold text-slate-800 mb-2">Access Denied</h2>
          <p className="text-gray-550 text-sm mb-6 leading-relaxed font-semibold">
            Please scan the QR code located on your table to access the digital menu.
          </p>
          <div className="text-xs text-gray-400 font-bold bg-slate-50 border border-gray-100 p-3 rounded-xl w-full">
            DineFlow Digital Dining System
          </div>
        </div>
      </div>);
    }
    // If session is settled and closed
    if (sessionClosed) {
        return (<div className="light-green-wrapper flex flex-col items-center justify-center p-6 text-center min-h-screen text-slate-800">
        <div className="bg-white rounded-3xl border border-gray-200 p-8 max-w-sm shadow-lg flex flex-col items-center">
          <div className="rounded-full flex items-center justify-center mb-6 text-[#16a34a]" style={{
                width: '80px',
                height: '80px',
                background: 'rgba(22, 163, 94, 0.1)',
                border: '1px solid rgba(22, 163, 94, 0.25)',
                boxShadow: '0 0 20px rgba(22, 163, 94, 0.1)'
            }}>
            <CheckCircle2 size={48}/>
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Thank You!</h2>
          <p className="text-sm text-[#16a34a] font-bold mb-4">Payment Confirmed</p>
          <p className="text-gray-550 text-sm mb-6 leading-relaxed font-semibold">
            Your bill has been paid and your table session is now closed. We hope you enjoyed your dining experience!
          </p>
          <button onClick={() => {
                clearTableSession();
                window.location.href = '/';
            }} className="w-full guest-btn-add text-white font-bold py-3.5 rounded-xl text-sm shadow-md active:scale-95 transition-all">
            Exit Dining System
          </button>
        </div>
      </div>);
    }
    // Calculate bill totals from placed orders only
    const allOrderedItems = batches.flatMap(b => b.items);
    const subtotal = allOrderedItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const cgst = subtotal * 0.025;
    const sgst = subtotal * 0.025;
    const total = subtotal + cgst + sgst;
    return (<div className="light-green-wrapper pb-28 pt-16 relative bg-[#f4f7f5] text-slate-800 min-h-screen">
      
      {/* 1. PERSISTENT HEADER TOP BAR (Light Theme) */}
      <header className="fixed top-0 left-0 w-full bg-white border-b border-gray-200/80 py-3.5 px-4 md:px-6 z-40 shadow-sm">
        <div className="max-w-[1440px] mx-auto w-full flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-xl">🍽️</span>
            <div>
              <h1 className="guest-brand-logo text-lg tracking-tight font-black">DineFlow</h1>
              <p className="text-[10px] text-gray-550 font-bold uppercase">The Spice Route</p>
            </div>
          </div>
          
          {/* Desktop Header Navigation Tabs */}
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => handleTabChange('menu')} className={`guest-tab-btn text-sm uppercase tracking-wider font-extrabold transition-all ${activeTab === 'menu' ? 'active' : ''}`}>
              Menu
            </button>
            <button onClick={() => handleTabChange('orders')} className={`guest-tab-btn text-sm uppercase tracking-wider font-extrabold transition-all ${activeTab === 'orders' ? 'active' : ''}`}>
              Track Order
            </button>
            <button onClick={() => handleTabChange('bill')} className={`guest-tab-btn text-sm uppercase tracking-wider font-extrabold transition-all ${activeTab === 'bill' ? 'active' : ''}`}>
              Summary Bill
            </button>
          </div>

          <span className="bg-[#16a34a] text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md">
            Table {tableNumber}
          </span>
        </div>
      </header>

      {/* Main Responsive Grid Container */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 mt-4">
        
        {/* Lock Banner if Bill is Requested */}
        {isOrderLocked && (<div className="mb-6 bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-xl flex items-center gap-3 shadow-sm text-xs font-bold z-10 relative">
            <AlertTriangle size={18} className="text-orange-500 flex-shrink-0 animate-bounce"/>
            <span>Bill requested — ordering is locked. Ask staff to add items.</span>
          </div>)}

        {/* 3-Column Layout Wrapper */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6 items-start">
          
          {/* ===================================== */}
          {/* COLUMN 1: CATEGORIES SIDEBAR (Desktop) */}
          {/* ===================================== */}
          {activeTab === 'menu' && (<div className="hidden md:block md:col-span-1 space-y-6 sticky top-24">
              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                <span className="block text-[10px] font-black uppercase text-gray-400 tracking-wider mb-4 px-2">Categories</span>
                <nav className="space-y-1">
                  {menuData.categories.map(cat => (<button key={cat.id} onClick={() => scrollToCategory(cat.id)} className="guest-sidebar-item font-bold text-sm">
                      <span className="text-lg">{cat.emoji}</span>
                      <span>{cat.name}</span>
                    </button>))}
                </nav>
              </div>

              {/* Chef's Special Promotion Card */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-100/50 border border-green-200/50 p-5 rounded-2xl shadow-sm text-center">
                <span className="inline-block bg-green-200/60 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase mb-2">Chef's Special</span>
                <h4 className="font-extrabold text-sm text-slate-800">Truffle Pappardelle</h4>
                <p className="text-[11px] text-gray-500 mt-1">Sautéed wild mushrooms, black truffle paste, parmesan cream.</p>
                <div className="text-[#16a34a] font-extrabold text-xs mt-3 flex items-center justify-center gap-1 cursor-pointer">
                  Order Now <ArrowRight size={12}/>
                </div>
              </div>
            </div>)}

          {/* ===================================== */}
          {/* COLUMN 2: MAIN DYNAMIC CONTENT AREA   */}
          {/* ===================================== */}
          <div className={`col-span-1 ${activeTab === 'menu'
            ? 'md:col-span-3 lg:col-span-3' // middle column
            : 'md:col-span-4 lg:col-span-5 max-w-[900px] mx-auto w-full' // full width for track/bill on desktop
        }`}>
            
            {/* Tab A: MENU CATALOG VIEW */}
            {activeTab === 'menu' && (<div className="animate-in fade-in duration-200 space-y-6">
                         {/* Mobile Category Scrollbar (Hidden on Desktop) */}
                {!searchQuery && (<div className="flex md:hidden overflow-x-auto gap-2 pb-2 mb-4 scrollbar-hide -mx-4 px-4 sticky top-[68px] z-30 bg-[#f4f7f5]/90 backdrop-blur-sm py-2">
                    {menuData.categories.map(cat => (<button key={cat.id} onClick={() => scrollToCategory(cat.id)} className="whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold bg-white border border-gray-200 text-gray-700 active:bg-green-50 active:text-[#16a34a] active:border-green-300 flex items-center gap-1 shadow-sm transition-all">
                        <span>{cat.emoji}</span> {cat.name}
                      </button>))}
                  </div>)}

                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-4 top-3.5 text-gray-400" size={20}/>
                  <input type="text" placeholder="Search delicious dishes..." className="guest-input-search w-full rounded-xl py-3.5 pl-12 pr-4 text-sm font-semibold shadow-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
                </div>

                {/* Category Sections */}
                <div className="space-y-8">
                  {groupedMenu.length > 0 ? (groupedMenu.map((category) => (<div id={`category-${category.id}`} key={category.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        
                        {/* Category Title Header */}
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
                          <div>
                            <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                              <span className="text-xl">{category.emoji}</span> {category.name}
                            </h3>
                            <p className="text-[11px] text-gray-500 font-semibold mt-0.5">Carefully prepared premium selections</p>
                          </div>
                        </div>

                        {/* Dish List Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                          {category.items.map((item) => {
                    const cleanId = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
                    const cartItem = cartItems.find(i => i.id === cleanId);
                    const isAdded = !!cartItem;
                    return (<div key={item.name} className="p-5 flex gap-4 bg-white transition-colors hover:bg-slate-50/30">
                                {/* circular emoji graphic avatar */}
                                <div className="w-14 h-14 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center text-2xl flex-shrink-0 shadow-inner">
                                  {category.emoji}
                                </div>

                                <div className="flex-1 min-w-0 flex flex-col justify-between">
                                  <div>
                                    <div className="flex justify-between items-start gap-2">
                                      <h4 className="font-extrabold text-slate-800 text-sm leading-snug truncate">{item.name}</h4>
                                      <span className="guest-price-badge flex-shrink-0">₹{item.price}</span>
                                    </div>
                                    <p className="text-[11px] text-gray-550 mt-1 leading-relaxed line-clamp-2">Authentic traditional spice recipe prepared with fresh organic ingredients.</p>
                                  </div>

                                  <div className="flex justify-between items-center mt-4">
                                    {/* Dietary indicators */}
                                    <div className="flex gap-1.5">
                                      <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase">Fresh</span>
                                      <span className="text-[9px] font-bold bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded uppercase">Vegetarian</span>
                                    </div>

                                    {/* Stepper / Add button */}
                                    <div className="w-[88px] flex-shrink-0">
                                      {!isAdded ? (<button onClick={() => addToCart({ id: cleanId, name: item.name, price: item.price, quantity: 1, notes: '' })} disabled={isOrderLocked} className="w-full py-1.5 rounded-lg text-xs font-bold guest-btn-add">
                                          ADD
                                        </button>) : (<div className="guest-stepper w-full">
                                          <button onClick={() => updateQuantity(cleanId, cartItem.quantity - 1)} disabled={isOrderLocked} className="guest-stepper-btn font-black text-base">-</button>
                                          <span className="guest-stepper-val font-black">{cartItem.quantity}</span>
                                          <button onClick={() => updateQuantity(cleanId, cartItem.quantity + 1)} disabled={isOrderLocked} className="guest-stepper-btn font-black text-base">+</button>
                                        </div>)}
                                    </div>
                                  </div>

                                </div>
                              </div>);
                })}
                        </div>

                      </div>))) : (<div className="text-center py-12 text-gray-500 bg-white rounded-2xl border border-gray-200 shadow-sm">
                      <p className="font-bold text-sm text-slate-800">No dishes found matching your search.</p>
                    </div>)}
                </div>

              </div>)}

            {/* Tab B: MY ORDERS VIEW (TRACKING) */}
            {activeTab === 'orders' && (<div className="animate-in fade-in duration-200 space-y-6">
                <h2 className="font-extrabold text-slate-800 text-lg mb-4">Placed Order Tracking ({batches.length})</h2>
                
                {batches.length === 0 ? (<div className="text-center py-20 bg-white border border-gray-200 rounded-2xl shadow-sm">
                    <ClipboardList size={48} className="mx-auto mb-4 text-[#16a34a] opacity-20"/>
                    <p className="font-bold text-slate-800">No orders placed in this session yet</p>
                    <p className="text-xs mt-1.5 px-6 text-gray-500 leading-relaxed font-semibold">
                      Dishes in your cart must be sent to the kitchen to begin cooking.
                    </p>
                    <button onClick={() => handleTabChange('menu')} className="mt-6 guest-btn-add px-5 py-2.5 rounded-xl text-xs font-bold">
                      Browse Menu
                    </button>
                  </div>) : (<div className="space-y-6">
                    {batches.map((batch) => (<div key={batch.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
                        
                        <div className={`absolute top-0 right-0 ${batch.status === 'served' ? 'bg-gray-400' :
                        batch.status === 'ready' ? 'bg-[#16a34a]' :
                            batch.status === 'preparing' ? 'bg-orange-500' : 'bg-blue-500'} text-white font-black text-[9px] px-3 py-1 rounded-bl-xl uppercase tracking-wide`}>
                          {batch.status}
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-[10px] text-gray-400 font-mono">KOT #{batch.id}</p>
                          <h3 className="font-extrabold text-sm text-slate-800">Round {batch.batchNumber}</h3>
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            Placed at {new Date(batch.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        
                        <ul className="text-xs space-y-3 mb-2 text-slate-700 font-semibold border-t border-gray-100 pt-3">
                          {batch.items.map((item, idx) => (<li key={idx}>
                              <div className="flex justify-between items-start">
                                <span className="w-2/3 leading-tight">{item.qty}x {item.name}</span>
                                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${item.status === 'served' ? 'bg-gray-100 text-gray-500 border border-gray-200' :
                            item.status === 'ready' ? 'bg-green-50 text-green-700 border border-green-200' :
                                item.status === 'preparing' ? 'bg-orange-50 text-orange-700 border border-orange-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                                  {item.status}
                                </span>
                              </div>
                              {item.notes && (<span style={{
                                display: 'block',
                                marginTop: '6px',
                                padding: '6px 8px',
                                borderRadius: '6px',
                                backgroundColor: '#fef2f2',
                                border: '1px solid #fecaca',
                                color: '#b91c1c',
                                fontSize: '11px',
                                fontWeight: 'bold'
                            }}>
                                  Instruction Note: "{item.notes}"
                                </span>)}
                            </li>))}
                        </ul>
                        
                        {batch.comments && (<div style={{
                            marginTop: '12px',
                            padding: '8px 10px',
                            borderRadius: '8px',
                            backgroundColor: '#fffbeb',
                            border: '1px solid #fef3c7',
                            color: '#d97706',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            lineHeight: '1.4'
                        }}>
                            ⚠️ Order Note: "{batch.comments}"
                          </div>)}
                        
                        {/* Progress bar */}
                        {batch.status === 'preparing' && (<div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-4">
                            <div className="bg-orange-500 h-full w-2/3 rounded-full animate-pulse"></div>
                          </div>)}
                      </div>))}
                  </div>)}
              </div>)}

            {/* Tab C: BILL VIEW */}
            {activeTab === 'bill' && (<div className="animate-in fade-in duration-200 space-y-6">
                <div className="text-center mb-6">
                  <Receipt className="mx-auto text-[#16a34a] mb-2" size={32}/>
                  <h2 className="text-xl font-bold text-slate-800">Summary Invoice</h2>
                  <p className="text-xs text-gray-500 font-semibold">Final check-out settlement totals</p>
                </div>

                {isBillRequested && (<div className="mb-6 bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-center gap-3 shadow-sm animate-in fade-in zoom-in">
                    <CheckCircle2 size={24} className="text-[#16a34a] flex-shrink-0"/>
                    <div>
                      <p className="font-bold text-xs">Bill requested successfully!</p>
                      <p className="text-[10px] text-green-700/80 mt-0.5 font-semibold">Please wait at your table. A waiter will arrive shortly for payment processing.</p>
                    </div>
                  </div>)}

                {/* Aggregate Items grouped by round */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm font-mono text-xs mb-6">
                  <div className="p-4 border-b border-gray-100 bg-slate-50/50 font-bold flex justify-between uppercase text-[10px] tracking-wider text-gray-500">
                    <span>Rounds summary</span>
                    <span className="w-16 text-right">Price</span>
                  </div>
                  
                  <div className="p-4 space-y-4 pb-6 border-b border-gray-200 border-dashed min-h-[100px] text-slate-700">
                    {batches.length === 0 ? (<p className="text-gray-400 text-center font-sans py-8">No orders placed in this session.</p>) : (batches.map((batch) => (<div key={batch.id} className="space-y-1.5">
                          <div className="font-sans font-bold text-slate-500 text-[10px] uppercase border-b border-slate-100 pb-1">Round {batch.batchNumber}</div>
                          {batch.items.map((item, idx) => (<div key={idx} className="flex justify-between items-start text-xs text-slate-650">
                              <div className="w-3/4">
                                <span className="font-semibold text-slate-800">{item.name}</span>
                                <div className="text-gray-400 text-[10px]">{item.qty} x ₹{item.price}</div>
                              </div>
                              <div className="w-1/4 text-right font-bold text-slate-800">₹{item.price * item.qty}</div>
                            </div>))}
                        </div>)))}
                  </div>
                  
                  {/* Totals */}
                  <div className="p-4 bg-slate-50/30 space-y-2 text-slate-650">
                    <div className="flex justify-between font-semibold">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>CGST (2.5%)</span>
                      <span>₹{cgst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>SGST (2.5%)</span>
                      <span>₹{sgst.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between text-base font-black text-slate-800 mt-4 pt-4 border-t border-gray-200">
                      <span>Grand Total</span>
                      <span className="text-[#16a34a]">₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button className={`w-full font-black py-4 text-base rounded-xl transition-all ${isBillRequested || subtotal === 0
                ? 'bg-slate-100 text-gray-400 border border-slate-200 cursor-not-allowed'
                : 'guest-btn-add text-white active:scale-95'}`} onClick={() => setShowConfirm(true)} disabled={isBillRequested || subtotal === 0}>
                  {isBillRequested ? 'Bill Requested' : 'Request Final Bill'}
                </button>
              </div>)}

          </div>

          {/* ===================================== */}
          {/* COLUMN 3: PERSISTENT ORDER CART (Desktop) */}
          {/* ===================================== */}
          {activeTab === 'menu' && (<div className="hidden lg:block lg:col-span-1 sticky top-24">
              <div className="guest-cart-panel p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-150 pb-3 mb-2">
                  <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                    <ShoppingBag size={18} className="text-[#16a34a]"/> Your Order
                  </h3>
                  <span className="bg-[#16a34a] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{cartCount}</span>
                </div>

                {cartItems.length === 0 ? (<div className="text-center py-10 text-gray-400 text-xs">
                    <ShoppingBag size={32} className="mx-auto mb-2 opacity-20"/>
                    <p className="font-bold">Your cart is empty</p>
                    <p className="text-[10px] mt-1 font-semibold">Select items from the catalog.</p>
                  </div>) : (<div className="space-y-4 max-h-[40vh] overflow-y-auto pr-1 scrollbar-glass">
                    {cartItems.map((item) => (<div key={item.id} className="p-3 border border-gray-100 rounded-xl bg-slate-50/50">
                        <div className="flex justify-between items-start gap-1">
                          <div className="min-w-0">
                            <h4 className="font-extrabold text-xs text-slate-800 truncate">{item.name}</h4>
                            <p className="text-[10px] font-black text-green-600 mt-0.5">₹{item.price}</p>
                          </div>
                          
                          <div className="guest-stepper h-[24px]">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="guest-stepper-btn px-1.5">-</button>
                            <span className="guest-stepper-val text-[10px] px-1">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="guest-stepper-btn px-1.5">+</button>
                          </div>
                        </div>

                        <input type="text" placeholder="Special instructions..." value={item.notes} onChange={(e) => updateNotes(item.id, e.target.value)} className="guest-input-search w-full text-[10px] rounded-lg p-2 mt-2 font-semibold"/>
                      </div>))}
                  </div>)}

                {cartItems.length > 0 && (<div className="border-t border-gray-200/80 pt-4 space-y-4">
                    <div>
                      <label className="block text-[9px] font-black uppercase text-gray-400 tracking-wider mb-2">Order-level comment</label>
                      <textarea placeholder="Instructions for the kitchen..." value={generalComment} onChange={(e) => setGeneralComment(e.target.value)} rows={2} className="guest-input-search w-full rounded-lg p-2 text-[10px] font-semibold resize-none"/>
                    </div>

                    <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-3">
                      <span className="font-semibold text-gray-505">Subtotal</span>
                      <span className="text-base font-black text-slate-800">₹{cartTotal}</span>
                    </div>
                    
                    <button onClick={handlePlaceOrder} className="w-full guest-btn-add text-white font-bold py-3 text-xs rounded-xl transition-all active:scale-95">
                      Place Order
                    </button>
                  </div>)}
              </div>
            </div>)}

        </div>

      </div>

      {/* ===================================== */}
      {/* 3. PERSISTENT MOBILE FLOATING ACTIONS */}
      {/* ===================================== */}
      <div className="fixed bottom-[96px] md:bottom-6 right-6 md:right-8 flex flex-col-reverse gap-4 pointer-events-none z-40">
        {/* Cart Action FAB (Persistent on all screens) */}
        {activeTab === 'menu' && (<button onClick={() => setIsCartOpen(true)} className="pointer-events-auto w-16 h-16 btn-premium-green rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-all border-4 border-[#f4f7f5] cart-fab-glow relative" title="View Cart">
            <ShoppingCart size={28}/>
            {cartCount > 0 && <span className="badge-pulsing" style={{ borderColor: '#f4f7f5' }}>{cartCount}</span>}
          </button>)}

        {/* Call Staff Action (Stacked above Cart FAB dynamically via flex-col-reverse) */}
        <button onClick={handleCallStaff} className="pointer-events-auto w-16 h-16 btn-premium-amber rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-all border-4 border-[#f4f7f5] animate-pulse" title="Call Staff">
          <BellRing size={28}/>
        </button>
      </div>

      {/* ===================================== */}
      {/* 5. SLIDE-UP CART MODAL (Mobile Overlay) */}
      {/* ===================================== */}
      {isCartOpen && (<div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center animate-in fade-in duration-200">
          
          <div className="absolute inset-0" onClick={() => setIsCartOpen(false)}></div>
          
          <div className="bg-white border-t border-gray-200 rounded-t-3xl w-full max-w-[480px] p-6 max-h-[85vh] overflow-y-auto z-10 shadow-[0_-8px_32px_rgba(0,0,0,0.15)] flex flex-col relative animate-in slide-in-from-bottom-24 duration-300">
            
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-150">
              <div>
                <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                  <ShoppingBag size={18} className="text-[#16a34a]"/> Review Selected Items
                </h3>
                <p className="text-[10px] text-gray-500 font-semibold">Table {tableNumber} • Local unsubmitted cart</p>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-gray-500">
                <X size={20}/>
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto scrollbar-glass mb-6">
              {cartItems.map((item) => (<div key={item.id} className="p-4 border border-gray-100 rounded-xl bg-slate-50/50">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-800">{item.name}</h4>
                      <p className="text-xs font-black text-green-600 mt-0.5">₹{item.price}</p>
                    </div>
                    
                    <div className="guest-stepper h-[30px] px-1">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="guest-stepper-btn">-</button>
                      <span className="guest-stepper-val w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="guest-stepper-btn">+</button>
                    </div>
                  </div>

                  <input type="text" placeholder="Special requests (e.g. no onions, make it spicy)..." value={item.notes} onChange={(e) => updateNotes(item.id, e.target.value)} className="guest-input-search w-full text-xs rounded-lg p-2.5 mt-3 font-semibold"/>
                </div>))}
            </div>

            <div className="bg-slate-50 border border-gray-100 rounded-xl p-4 mb-6">
              <label className="block text-[10px] font-black uppercase text-gray-550 tracking-wider mb-2">Order-level comment (optional)</label>
              <textarea placeholder="e.g. Bring extra plates, serve desserts at the end..." value={generalComment} onChange={(e) => setGeneralComment(e.target.value)} rows={2} className="guest-input-search w-full rounded-lg p-2.5 text-xs font-semibold resize-none"/>
            </div>

            <div className="border-t border-gray-200/80 pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-500 text-sm">Subtotal</span>
                <span className="text-xl font-black text-[#16a34a]">₹{cartTotal}</span>
              </div>
              
              <button onClick={handlePlaceOrder} className="w-full guest-btn-add text-white font-bold py-4 text-sm rounded-xl transition-all active:scale-95">
                Place Order (Send to Kitchen)
              </button>
            </div>

          </div>
        </div>)}

      {/* ===================================== */}
      {/* 6. CONFIRM BILL MODAL POPUP           */}
      {/* ===================================== */}
      {showConfirm && (<div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm border border-gray-250 shadow-2xl z-10 relative text-slate-800">
            <h3 className="font-black text-lg mb-2 flex items-center gap-1.5 text-slate-850">
              <AlertTriangle className="text-orange-500" size={24}/> Request Bill?
            </h3>
            <p className="text-gray-550 mb-6 text-xs leading-relaxed font-semibold">
              Once you submit this request, your session ordering will be locked. Waiters will print your invoice receipts for final checkout payment.
            </p>
            <div className="flex gap-3">
              <button className="flex-1 py-2.5 border border-gray-300 rounded-xl font-bold text-gray-650 hover:bg-slate-50 transition-colors text-xs" onClick={() => setShowConfirm(false)}>
                Cancel
              </button>
              <button className="flex-1 py-2.5 guest-btn-add text-white rounded-xl font-bold transition-all text-xs" onClick={confirmBill}>
                Confirm Request
              </button>
            </div>
          </div>
        </div>)}

      {/* ===================================== */}
      {/* 7. BOTTOM NAVIGATION BAR (Mobile Only) */}
      {/* ===================================== */}
      <nav className="fixed md:hidden bottom-0 left-0 w-full bg-white border-t border-gray-200/80 px-6 py-3 flex justify-between items-center z-40 shadow-md">
        
        <button onClick={() => handleTabChange('menu')} className={`flex flex-col items-center gap-1 bg-transparent p-1.5 transition-all ${activeTab === 'menu' ? 'text-[#16a34a] scale-105 font-bold' : 'text-gray-400 hover:text-gray-550'}`}>
          <Utensils size={20} className={activeTab === 'menu' ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}/>
          <span className="text-[10px] tracking-wider uppercase font-extrabold">Menu</span>
        </button>

        <button onClick={() => handleTabChange('orders')} className={`flex flex-col items-center gap-1 bg-transparent p-1.5 transition-all ${activeTab === 'orders' ? 'text-[#16a34a] scale-105 font-bold' : 'text-gray-400 hover:text-gray-550'}`}>
          <ClipboardList size={20} className={activeTab === 'orders' ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}/>
          <span className="text-[10px] tracking-wider uppercase font-extrabold">My Order</span>
        </button>

        <button onClick={() => handleTabChange('bill')} className={`flex flex-col items-center gap-1 bg-transparent p-1.5 transition-all ${activeTab === 'bill' ? 'text-[#16a34a] scale-105 font-bold' : 'text-gray-400 hover:text-gray-550'}`}>
          <Receipt size={20} className={activeTab === 'bill' ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}/>
          <span className="text-[10px] tracking-wider uppercase font-extrabold">Bill</span>
        </button>
      </nav>

    </div>);
}
