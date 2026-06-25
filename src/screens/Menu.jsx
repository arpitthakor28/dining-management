import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle, RefreshCw, BellRing, ShoppingBag, ShoppingCart, X, CheckCircle2, ClipboardList, Receipt } from 'lucide-react';
import { useNavigate, useLocation, useSearchParams, useParams } from 'react-router-dom';
import { menuData } from '../data/menuData';
import { useCart } from '../context/CartContext';
export default function Menu() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { restaurantId = 'r_001', tableId: routeTableId } = useParams();
    const getTableId = () => routeTableId || window.location.pathname.match(/\/table\/([^\/]+)/)?.[1] || 'T-12';
    const tableId = getTableId();
    const tableNumber = tableId.replace('T-', '');
    const { items: cartItems, batches, addToCart, updateQuantity, updateNotes, removeFromCart, submitCart, sendComment, requestBill, cartCount, cartTotal, isOrderLocked, isBillRequested, validateTable, sessionId, sessionClosed, clearTableSession } = useCart();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState(menuData.categories[0]?.id || '');
    const [isValidating, setIsValidating] = useState(true);
    const [isValid, setIsValid] = useState(false);
    const [validationError, setValidationError] = useState(null);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [generalComment, setGeneralComment] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const [vegOnly, setVegOnly] = useState(false);
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
        const search = window.location.search;
        if (tabName === 'menu')
            navigate(`/restaurant/${restaurantId}/table/${tableId}/menu${search}`);
        else if (tabName === 'orders')
            navigate(`/restaurant/${restaurantId}/table/${tableId}/status${search}`);
        else if (tabName === 'bill')
            navigate(`/restaurant/${restaurantId}/table/${tableId}/bill${search}`);
    };
    useEffect(() => {
        const token = searchParams.get('token');
        const savedToken = localStorage.getItem(`table_token_${tableId}`);
        const tokenToUse = token || savedToken;
        if (tokenToUse) {
            validateTable(tableId, tokenToUse).then((res) => {
                if (res && res.valid) {
                    setIsValid(true);
                    setValidationError(null);
                } else {
                    setIsValid(false);
                    setValidationError(res ? res.error : 'invalid');
                }
                setIsValidating(false);
            });
        }
        else {
            setIsValid(false);
            setValidationError('invalid');
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
    // Filter menu items by active category or search query, and vegOnly if active
    const getGroupedMenu = () => {
        let categoriesToProcess = menuData.categories;

        // If no search query, filter list to display only the active category
        if (!searchQuery.trim()) {
            categoriesToProcess = menuData.categories.filter(cat => cat.id === activeCategory);
        }

        if (dbMenuItems.length === 0) {
            return categoriesToProcess.map(category => {
                let items = category.items;
                // Search filter
                if (searchQuery.trim()) {
                    items = items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
                }
                return {
                    ...category,
                    items
                };
            }).filter(group => group.items.length > 0);
        }

        return categoriesToProcess.map(category => {
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
            
            let filteredItems = mappedItems;
            if (searchQuery.trim()) {
                filteredItems = filteredItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
            }

            return {
                ...category,
                items: filteredItems
            };
        }).filter(group => group.items.length > 0);
    };
    const groupedMenu = getGroupedMenu();

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
        return (<div className="min-h-screen bg-[#0d1117] text-[#e6edf3] flex flex-col items-center justify-center p-6 text-center">
        <RefreshCw className="animate-spin text-[#3fb950] mb-4" size={32}/>
        <p className="font-bold text-sm text-[var(--muted)]">Verifying table session...</p>
      </div>);
    }
    // If table is occupied by another device
    if (!isValid && validationError === 'occupied') {
        return (<div className="min-h-screen bg-[#0d1117] text-[#e6edf3] flex flex-col items-center justify-center p-6 text-center">
        <div className="ambient-glow-bubble-1"></div>
        <div className="ambient-glow-bubble-2"></div>
        
        <div className="glass-card max-w-md flex flex-col items-center p-8 border border-white/10 z-10" onMouseMove={handleMouseMove}>
          <div className="rounded-full flex items-center justify-center mb-6 text-orange-500" style={{
                width: '80px',
                height: '80px',
                background: 'rgba(249, 115, 22, 0.1)',
                border: '1px solid rgba(249, 115, 22, 0.25)',
                boxShadow: '0 0 20px rgba(249, 115, 22, 0.15)'
            }}>
            <AlertTriangle size={40}/>
          </div>
          <h2 className="text-2xl font-black mb-2 text-glow" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fed7aa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Table Already in Use
          </h2>
          <p className="text-[10px] text-orange-400 font-bold uppercase tracking-wider mb-4">Access Restricted</p>
          <p className="text-sm mb-6 leading-relaxed text-[var(--muted)] font-semibold">
            This table (Table {tableNumber}) is already connected to another device. To ensure order accuracy and session security, DineFlow allows only one device to be connected to a table at a time.
          </p>
          <div className="text-xs font-bold bg-[var(--surface2)] border border-[var(--border)] p-3 rounded-xl w-full text-[var(--muted)]">
            If this is a mistake, please ask restaurant staff to reset this table session from the dashboard.
          </div>
        </div>
      </div>);
    }
    // If table access is invalid
    if (!isValid) {
        return (<div className="min-h-screen bg-[#0d1117] text-[#e6edf3] flex flex-col items-center justify-center p-6 text-center">
        <div className="card max-w-sm flex flex-col items-center">
          <AlertTriangle className="text-orange-500 mb-4" size={48}/>
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-sm mb-6 leading-relaxed text-[var(--muted)]">
            Please scan the QR code located on your table to access the digital menu.
          </p>
          <div className="text-xs font-bold bg-[var(--surface2)] border border-[var(--border)] p-3 rounded-xl w-full text-[var(--muted)]">
            DineFlow Digital Dining System
          </div>
        </div>
      </div>);
    }
    // If session is settled and closed
    if (sessionClosed) {
        return (<div className="min-h-screen bg-[#0d1117] text-[#e6edf3] flex flex-col items-center justify-center p-6 text-center">
        <div className="card max-w-sm flex flex-col items-center">
          <div className="rounded-full flex items-center justify-center mb-6 text-[#3fb950]" style={{
                width: '80px',
                height: '80px',
                background: 'rgba(63, 185, 80, 0.1)',
                border: '1px solid rgba(63, 185, 80, 0.25)',
                boxShadow: '0 0 20px rgba(63, 185, 80, 0.1)'
            }}>
            <CheckCircle2 size={48}/>
          </div>
          <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
          <p className="text-sm text-[#3fb950] font-bold mb-4">Payment Confirmed</p>
          <p className="text-sm mb-6 leading-relaxed text-[var(--muted)]">
            Your bill has been paid and your table session is now closed. We hope you enjoyed your dining experience!
          </p>
          <button onClick={() => {
                clearTableSession();
                window.location.href = '/login';
            }} className="w-full btn-primary rounded-xl text-sm shadow-md transition-all">
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
    return (<div className="min-h-screen bg-[#0d1117] text-[#e6edf3] relative">
      
      {/* Fixed 56px Topbar */}
      <header className="topbar">
        <div className="flex items-center gap-2">
          <span className="text-lg">🍽️</span>
          <span className="font-semibold text-[13px] tracking-wide" style={{ color: 'var(--text)' }}>DineFlow</span>
        </div>
        
        {/* Navigation tabs */}
        <div className="flex items-center gap-2">
          <button onClick={() => handleTabChange('menu')} className={`nav-tab ${activeTab === 'menu' ? 'active' : ''}`}>
            Menu
          </button>
          <button onClick={() => handleTabChange('orders')} className={`nav-tab ${activeTab === 'orders' ? 'active' : ''}`}>
            Track Order
          </button>
          <button onClick={() => handleTabChange('bill')} className={`nav-tab ${activeTab === 'bill' ? 'active' : ''}`}>
            Summary Bill
          </button>
        </div>

        <div className="flex items-center gap-4">
          <span className="status-badge ready">Table {tableNumber}</span>
        </div>
      </header>

      {/* Main Responsive Grid Container */}
      <main className="content-area page-wrapper">
        
        {/* Lock Banner if Bill is Requested */}
        {isOrderLocked && (<div className="mb-6 bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-xl flex items-center gap-3 shadow-sm text-xs font-bold z-10 relative">
            <AlertTriangle size={18} className="text-orange-500 flex-shrink-0 animate-bounce"/>
            <span>Bill requested — ordering is locked. Ask staff to add items.</span>
          </div>)}

        {/* Centered Main Content Area */}
        <div className="max-w-[800px] mx-auto w-full px-4 sm:px-6">
            
            {/* Tab A: MENU CATALOG VIEW */}
            {activeTab === 'menu' && (<div className="animate-in fade-in duration-200 space-y-6">
                 {/* Search & Filter Header */}
                 <div className="flex flex-col sm:flex-row gap-3">
                   <div className="relative flex-1">
                     <Search className="absolute left-4 top-3.5 text-gray-400" size={20}/>
                     <input 
                       type="text" 
                       placeholder="Search delicious dishes..." 
                       className="guest-input-search w-full rounded-xl py-3.5 pl-12 pr-4 text-sm font-semibold shadow-sm" 
                       value={searchQuery} 
                       onChange={(e) => setSearchQuery(e.target.value)}
                     />
                   </div>
                   <div className="flex items-center">
                     <button
                       onClick={() => setVegOnly(!vegOnly)}
                       className={`guest-filter-pill ${vegOnly ? 'active' : ''}`}
                     >
                       <span className="veg-indicator" style={{ borderRadius: '2px', border: '1px solid #3fb950', width: '10px', height: '10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '1px' }}>
                         <span className="veg-circle" style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#3fb950' }} />
                       </span>
                       <span>Veg Only</span>
                     </button>
                   </div>
                 </div>

                 {/* Category Slider */}
                 <div className="guest-category-slider">
                   {menuData.categories.map(cat => (
                     <button
                       key={cat.id}
                       onClick={() => setActiveCategory(cat.id)}
                       className={`guest-category-pill ${activeCategory === cat.id ? 'active' : ''}`}
                     >
                       {cat.name}
                     </button>
                   ))}
                 </div>

                 {/* Category Sections */}
                 <div className="space-y-6">
                   {groupedMenu.length > 0 ? (
                     groupedMenu.map((category) => (
                       <div id={`category-${category.id}`} key={category.id} className="space-y-3">
                         <div className="pt-2 pb-1 text-left">
                           <h3 className="font-extrabold text-xs uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                             {category.name}
                           </h3>
                         </div>

                         <div className="guest-menu-list">
                           {category.items.map((item) => {
                             const cleanId = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
                             const cartItem = cartItems.find(i => i.id === cleanId);
                             const isAdded = !!cartItem;
                             return (
                               <div key={item.name} className="guest-menu-row">
                                 <div className="guest-menu-info">
                                   <div className="guest-item-title">
                                     <span className="veg-indicator">
                                       <span className="veg-circle" />
                                     </span>
                                     <span>{item.name}</span>
                                   </div>
                                   <p className="guest-item-desc">
                                     Authentic traditional recipe prepared with fresh organic ingredients.
                                   </p>
                                   <div className="guest-item-meta">
                                     <span className="font-bold text-xs" style={{ color: 'var(--accent)' }}>
                                       ${item.price}
                                     </span>
                                   </div>
                                 </div>

                                 {/* Stepper / Add button */}
                                 <div className="w-[88px] flex-shrink-0">
                                   {!isAdded ? (
                                     <button 
                                       onClick={() => addToCart({ id: cleanId, name: item.name, price: item.price, quantity: 1, notes: '' })} 
                                       disabled={isOrderLocked} 
                                       className="w-full py-1.5 rounded-lg text-xs font-bold guest-btn-add"
                                     >
                                       ADD
                                     </button>
                                   ) : (
                                     <div className="guest-stepper w-full">
                                       <button 
                                         onClick={() => updateQuantity(cleanId, cartItem.quantity - 1)} 
                                         disabled={isOrderLocked} 
                                         className="guest-stepper-btn font-black text-base"
                                       >
                                         -
                                       </button>
                                       <span 
                                          className="guest-stepper-val font-black cursor-pointer"
                                          onClick={() => setIsCartOpen(true)}
                                          title="View cart"
                                        >{cartItem.quantity}</span>
                                       <button 
                                         onClick={() => updateQuantity(cleanId, cartItem.quantity + 1)} 
                                         disabled={isOrderLocked} 
                                         className="guest-stepper-btn font-black text-base"
                                       >
                                         +
                                       </button>
                                     </div>
                                   )}
                                 </div>
                               </div>
                             );
                           })}
                         </div>
                       </div>
                     ))
                   ) : (
                     <div className="text-center py-12 card">
                       <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>
                         No dishes found matching your search.
                       </p>
                     </div>
                   )}
                 </div>

              </div>)}

            {/* Tab B: MY ORDERS VIEW (TRACKING) */}
            {activeTab === 'orders' && (<div className="animate-in fade-in duration-200 space-y-6">
                <h2 className="font-extrabold text-lg mb-4" style={{ color: 'var(--text)' }}>Placed Order Tracking ({batches.length})</h2>
                
                {batches.length === 0 ? (<div className="text-center py-20 shadow-sm" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
                    <ClipboardList size={48} className="mx-auto mb-4 opacity-20" style={{ color: 'var(--accent)' }}/>
                    <p className="font-bold" style={{ color: 'var(--text)' }}>No orders placed in this session yet</p>
                    <p className="text-xs mt-1.5 px-6 leading-relaxed font-semibold" style={{ color: 'var(--muted)' }}>
                      Dishes in your cart must be sent to the kitchen to begin cooking.
                    </p>
                    <button onClick={() => handleTabChange('menu')} className="mt-6 guest-btn-add px-5 py-2.5 rounded-xl text-xs font-bold">
                      Browse Menu
                    </button>
                  </div>) : (<div className="space-y-6">
                    {batches.map((batch) => (<div key={batch.id} className="p-5 shadow-sm relative overflow-hidden" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
                        
                        <div className={`absolute top-0 right-0 ${batch.status === 'served' ? 'bg-gray-500' :
                        batch.status === 'ready' ? 'bg-[#3fb950]' :
                            batch.status === 'preparing' ? 'bg-orange-500' : 'bg-blue-500'} text-white font-black text-[9px] px-3 py-1 rounded-bl-xl uppercase tracking-wide`}>
                          {batch.status}
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-[10px] font-mono" style={{ color: 'var(--muted)' }}>KOT #{batch.id}</p>
                          <h3 className="font-extrabold text-sm" style={{ color: 'var(--text)' }}>Round {batch.batchNumber}</h3>
                          <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>
                            Placed at {new Date(batch.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        
                        <ul className="text-xs space-y-3 mb-2 font-semibold pt-3" style={{ color: 'var(--text)', borderTop: '1px solid var(--border)' }}>
                          {batch.items.map((item, idx) => (<li key={idx}>
                              <div className="flex justify-between items-start">
                                <span className="w-2/3 leading-tight">{item.qty}x {item.name}</span>
                                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase border" style={
                                  item.status === 'served' ? { backgroundColor: 'rgba(139, 148, 158, 0.12)', color: 'var(--muted)', borderColor: 'rgba(139, 148, 158, 0.3)' } :
                                  item.status === 'ready' ? { backgroundColor: 'rgba(63, 185, 80, 0.12)', color: 'var(--accent)', borderColor: 'rgba(63, 185, 80, 0.3)' } :
                                  item.status === 'preparing' ? { backgroundColor: 'rgba(210, 153, 34, 0.12)', color: 'var(--warn)', borderColor: 'rgba(210, 153, 34, 0.3)' } :
                                  { backgroundColor: 'rgba(88, 166, 255, 0.12)', color: 'var(--accent2)', borderColor: 'rgba(88, 166, 255, 0.3)' }
                                }>
                                  {item.status}
                                </span>
                              </div>
                              {item.notes && (<span style={{
                                display: 'block',
                                marginTop: '6px',
                                padding: '6px 8px',
                                borderRadius: '6px',
                                backgroundColor: 'rgba(248, 81, 73, 0.12)',
                                border: '1px solid rgba(248, 81, 73, 0.3)',
                                color: 'var(--danger)',
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
                            backgroundColor: 'rgba(210, 153, 34, 0.12)',
                            border: '1px solid rgba(210, 153, 34, 0.3)',
                            color: 'var(--warn)',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            lineHeight: '1.4'
                        }}>
                            ⚠️ Order Note: "{batch.comments}"
                          </div>)}
                        
                        {/* Progress bar */}
                        {batch.status === 'preparing' && (<div className="w-full h-1.5 rounded-full overflow-hidden mt-4" style={{ backgroundColor: 'var(--border)' }}>
                            <div className="bg-orange-500 h-full w-2/3 rounded-full animate-pulse"></div>
                          </div>)}
                      </div>))}
                  </div>)}
              </div>)}
 
            {/* Tab C: BILL VIEW */}
            {activeTab === 'bill' && (<div className="animate-in fade-in duration-200 space-y-6">
                <div className="text-center mb-6">
                  <Receipt className="mx-auto mb-2" size={32} style={{ color: 'var(--accent)' }}/>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Summary Invoice</h2>
                  <p className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>Final check-out settlement totals</p>
                </div>
 
                {isBillRequested && (<div className="mb-6 rounded-xl flex items-center gap-3 shadow-sm animate-in fade-in zoom-in p-4" style={{ backgroundColor: 'rgba(63, 185, 80, 0.12)', border: '1px solid rgba(63, 185, 80, 0.3)', color: 'var(--accent)' }}>
                    <CheckCircle2 size={24} className="flex-shrink-0" style={{ color: 'var(--accent)' }}/>
                    <div>
                      <p className="font-bold text-xs">Bill requested successfully!</p>
                      <p className="text-[10px] mt-0.5 font-semibold" style={{ color: 'var(--accent)' }}>Please wait at your table. A waiter will arrive shortly for payment processing.</p>
                    </div>
                  </div>)}
 
                {/* Aggregate Items grouped by round */}
                <div className="overflow-hidden shadow-sm font-mono text-xs mb-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
                  <div className="p-4 font-bold flex justify-between uppercase text-[10px] tracking-wider" style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface2)', color: 'var(--muted)' }}>
                    <span>Rounds summary</span>
                    <span className="w-16 text-right">Price</span>
                  </div>
                  
                  <div className="p-4 space-y-4 pb-6 min-h-[100px]" style={{ borderBottom: '1px dashed var(--border)' }}>
                    {batches.length === 0 ? (<p className="text-center font-sans py-8" style={{ color: 'var(--muted)' }}>No orders placed in this session.</p>) : (batches.map((batch) => (<div key={batch.id} className="space-y-1.5">
                          <div className="font-sans font-bold text-[10px] uppercase pb-1" style={{ borderBottom: '1px solid var(--border)', color: 'var(--muted)' }}>Round {batch.batchNumber}</div>
                          {batch.items.map((item, idx) => (<div key={idx} className="flex justify-between items-start text-xs" style={{ color: 'var(--text)' }}>
                              <div className="w-3/4">
                                <span className="font-semibold" style={{ color: 'var(--text)' }}>{item.name}</span>
                                <div className="text-[10px]" style={{ color: 'var(--muted)' }}>{item.qty} x ${item.price}</div>
                              </div>
                              <div className="w-1/4 text-right font-bold" style={{ color: 'var(--text)' }}>${(item.price * item.qty).toFixed(2)}</div>
                            </div>))}
                        </div>)))}
                  </div>
                   {/* Totals */}
                  <div className="p-4 space-y-2" style={{ backgroundColor: 'var(--surface2)' }}>
                    <div className="flex justify-between font-semibold" style={{ color: 'var(--text)' }}>
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between" style={{ color: 'var(--muted)' }}>
                      <span>CGST (2.5%)</span>
                      <span>${cgst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between" style={{ color: 'var(--muted)' }}>
                      <span>SGST (2.5%)</span>
                      <span>${sgst.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between text-base font-black mt-4 pt-4" style={{ borderTop: '1px solid var(--border)', color: 'var(--text)' }}>
                      <span>Grand Total</span>
                      <span style={{ color: 'var(--accent)' }}>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button className={`w-full font-black py-4 text-base rounded-xl transition-all ${isBillRequested || subtotal === 0
                ? 'btn-ghost'
                : 'btn-primary'}`} style={{ cursor: isBillRequested || subtotal === 0 ? 'not-allowed' : 'pointer' }} onClick={() => setShowConfirm(true)} disabled={isBillRequested || subtotal === 0}>
                  {isBillRequested ? 'Bill Requested' : 'Request Final Bill'}
                </button>
            </div>)}
        </div>

      </main>

      {/* ===================================== */}
      {/* 3. PERSISTENT MOBILE FLOATING ACTIONS */}
      {/* ===================================== */}
      <div className="guest-floating-container">
        {/* Cart FAB */}
        {activeTab === 'menu' && (
          <button 
            onClick={() => setIsCartOpen(true)} 
            className="guest-fab guest-fab-cart" 
            title="View Cart"
          >
            <ShoppingCart size={20}/>
            {cartCount > 0 && <span className="badge-pulsing">{cartCount}</span>}
          </button>
        )}
        {/* Call Staff FAB */}
        <button 
          onClick={handleCallStaff} 
          className="guest-fab guest-fab-staff" 
          title="Call Staff"
        >
          <BellRing size={20}/>
        </button>
      </div>

      {/* ===================================== */}
      {/* 5. SLIDE-UP CART MODAL (Mobile Overlay) */}
      {/* ===================================== */}
      {isCartOpen && (
        <div className="guest-modal-overlay">
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onClick={() => setIsCartOpen(false)}></div>
          <div className="guest-modal-content">
            
            {/* Header */}
            <div className="flex justify-between items-center p-5 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <div>
                <h3 className="font-extrabold text-base flex items-center gap-2" style={{ color: 'var(--text)' }}>
                  <ShoppingBag size={18} style={{ color: 'var(--accent)' }}/> Review Selected Items
                </h3>
                <p className="text-[10px] font-semibold mt-0.5" style={{ color: 'var(--muted)' }}>Table {tableNumber} • {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in cart</p>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="p-1.5 rounded-full" style={{ backgroundColor: 'var(--surface2)', color: 'var(--muted)' }}>
                <X size={18}/>
              </button>
            </div>

            {/* Scrollable Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 scrollbar-glass">
              {cartItems.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-sm font-semibold" style={{ color: 'var(--muted)' }}>Your cart is empty</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Add items from the menu</p>
                </div>
              ) : cartItems.map((item) => (
                <div key={item.id} className="p-4 rounded-xl" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--surface2)' }}>
                  <div className="flex justify-between items-center gap-2">
                    <div className="flex-1">
                      <h4 className="font-extrabold text-sm" style={{ color: 'var(--text)' }}>{item.name}</h4>
                      <p className="text-xs font-black mt-0.5" style={{ color: 'var(--accent)' }}>₹{item.price} × {item.quantity} = ₹{(item.price * item.quantity).toFixed(0)}</p>
                    </div>
                    <div className="guest-stepper h-[32px] px-1">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="guest-stepper-btn">-</button>
                      <span className="guest-stepper-val w-5 text-center font-black">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="guest-stepper-btn">+</button>
                    </div>
                  </div>
                  <input type="text" placeholder="Special requests (e.g. no onions, extra spicy)..." value={item.notes} onChange={(e) => updateNotes(item.id, e.target.value)} className="guest-input-search w-full text-xs rounded-lg p-2.5 mt-3 font-semibold"/>
                </div>
              ))}

              {/* General Comment */}
              {cartItems.length > 0 && (
                <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--surface2)', border: '1px solid var(--border)' }}>
                  <label className="block text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>Order Comments</label>
                  <textarea placeholder="e.g. Serve soup first, bring extra plates..." value={generalComment} onChange={(e) => setGeneralComment(e.target.value)} rows={2} className="guest-input-search w-full rounded-lg p-2.5 text-xs font-semibold resize-none"/>
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="p-5 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold text-sm" style={{ color: 'var(--muted)' }}>Total</span>
                  <span className="text-2xl font-black" style={{ color: 'var(--accent)' }}>₹{cartTotal}</span>
                </div>
                <button onClick={handlePlaceOrder} className="w-full btn-primary font-bold py-3.5 text-sm rounded-xl transition-all active:scale-95">
                  Place Order (Send to Kitchen)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================== */}
      {/* 6. CONFIRM BILL MODAL POPUP           */}
      {/* ===================================== */}
      {showConfirm && (<div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="card p-6 w-full max-w-sm relative" style={{ boxShadow: 'var(--shadow-md)' }}>
            <h3 className="font-black text-lg mb-2 flex items-center gap-1.5" style={{ color: 'var(--text)' }}>
              <AlertTriangle className="text-orange-500" size={24}/> Request Bill?
            </h3>
            <p className="mb-6 text-xs leading-relaxed font-semibold" style={{ color: 'var(--muted)' }}>
              Once you submit this request, your session ordering will be locked. Waiters will print your invoice receipts for final checkout payment.
            </p>
            <div className="flex gap-3">
              <button className="flex-1 py-2.5 btn-ghost rounded-xl font-bold text-xs" onClick={() => setShowConfirm(false)}>
                Cancel
              </button>
              <button className="flex-1 py-2.5 btn-primary rounded-xl font-bold transition-all text-xs" onClick={confirmBill}>
                Confirm Request
              </button>
            </div>
          </div>
        </div>)}

    </div>);
}
