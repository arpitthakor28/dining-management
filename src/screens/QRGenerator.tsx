import React, { useState, useEffect } from 'react';
import { QrCode, Plus, Trash2, Copy, ExternalLink, Printer, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function QRGenerator() {
  const navigate = useNavigate();
  const [tables, setTables] = useState<any[]>([]);
  const [newTableNum, setNewTableNum] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
  });

  const fetchTables = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/tables', { headers: authHeaders() });
      if (response.ok) {
        const data = await response.json();
        setTables(data);
      }
    } catch (err) {
      console.error("Error fetching tables:", err);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableNum.trim()) return;

    try {
      const response = await fetch('http://localhost:8080/api/tables', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ tableNumber: newTableNum })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to add table');
        setSuccess('');
      } else {
        setSuccess(`Table ${newTableNum} added successfully!`);
        setError('');
        setNewTableNum('');
        fetchTables();
      }
    } catch (err) {
      setError('Connection error');
    }
  };

  const handleDeleteTable = async (tableId: string, tableNum: string) => {
    if (!window.confirm(`Are you sure you want to delete Table ${tableNum}?`)) return;

    try {
      const response = await fetch(`http://localhost:8080/api/tables/${tableId}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      if (response.ok) {
        setSuccess(`Table ${tableNum} deleted!`);
        setError('');
        fetchTables();
      } else {
        setError('Failed to delete table');
      }
    } catch (err) {
      setError('Connection error');
    }
  };

  const getGuestLink = (tableId: string, token: string) => {
    const restaurantId = localStorage.getItem('restaurant_id') || 'r_001';
    return `${window.location.origin}/restaurant/${restaurantId}/table/${tableId}/join?token=${token}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const printSingleQR = (tableNum: string, link: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(link)}`;
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Table ${tableNum} QR</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 50px; }
            h1 { font-size: 32px; color: #16a34a; margin-bottom: 5px; }
            h2 { font-size: 24px; color: #374151; margin-top: 0; }
            .qr-container { border: 3px solid #16a34a; display: inline-block; padding: 20px; border-radius: 15px; margin: 20px 0; }
            p { font-size: 14px; color: #6b7280; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <h1>THE SPICE ROUTE</h1>
          <h2>TABLE ${tableNum}</h2>
          <div class="qr-container">
            <img src="${qrUrl}" width="300" height="300" alt="QR Code" />
          </div>
          <p>Scan to browse menu and order instantly</p>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const printAllQRs = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Print All QR Codes</title>
          <style>
            body { font-family: sans-serif; margin: 0; padding: 0; }
            .page { page-break-after: always; text-align: center; padding-top: 100px; height: 100vh; box-sizing: border-box; }
            h1 { font-size: 36px; color: #16a34a; margin-bottom: 5px; }
            h2 { font-size: 28px; color: #374151; margin-top: 0; }
            .qr-container { border: 4px solid #16a34a; display: inline-block; padding: 30px; border-radius: 20px; margin: 40px 0; }
            p { font-size: 16px; color: #6b7280; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          ${tables.map(t => {
            const link = getGuestLink(t.id, t.qr_code_token);
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(link)}`;
            return `
              <div class="page">
                <h1>THE SPICE ROUTE</h1>
                <h2>TABLE ${t.table_number}</h2>
                <div class="qr-container">
                  <img src="${qrUrl}" width="300" height="300" alt="QR Code" />
                </div>
                <p>Scan to browse menu and order instantly</p>
              </div>
            `;
          }).join('')}
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div className="dark-theme-wrapper p-6">
      <div className="ambient-glow-bubble-1"></div>
      <div className="ambient-glow-bubble-2"></div>
      
      <div className="max-w-[1200px] mx-auto z-10 relative">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <button 
              onClick={() => navigate('/counter')} 
              className="flex items-center gap-1 text-green-400 hover:underline font-bold text-sm mb-2"
            >
              <ArrowLeft size={16} /> Back to Counter
            </button>
            <h1 className="text-3xl font-black text-white flex items-center gap-2">
              <QrCode className="text-green-400" size={32} /> Table QR Code Management
            </h1>
            <p className="text-gray-400 font-medium">Add, remove and print QR codes for guest tables.</p>
          </div>
          
          <button 
            onClick={printAllQRs}
            disabled={tables.length === 0}
            className="flex items-center gap-2 btn-premium-green px-6 py-3 rounded-lg transition-all"
          >
            <Printer size={20} /> Print All QR Codes
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Add Table form */}
          <div className="glass-card rounded-xl border border-white/10 p-6 h-fit" onMouseMove={handleMouseMove}>
            <h2 className="text-xl font-bold text-white mb-4 z-10">Add New Table</h2>
            
            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-semibold rounded-lg z-10">{error}</div>}
            {success && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 text-green-300 text-xs font-semibold rounded-lg z-10">{success}</div>}

            <form onSubmit={handleAddTable} className="space-y-4 z-10 relative">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-550 tracking-wider mb-2">Table Number</label>
                <input
                  type="text"
                  placeholder="e.g. 6 or 14"
                  value={newTableNum}
                  onChange={(e) => setNewTableNum(e.target.value)}
                  className="input-dark w-full rounded-lg py-2.5 px-4 font-bold text-sm"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full btn-premium-green py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5"
              >
                <Plus size={18} /> Add Table
              </button>
            </form>
          </div>

          {/* Tables List */}
          <div className="lg:col-span-2 glass-card rounded-xl border border-white/10 overflow-hidden" onMouseMove={handleMouseMove}>
            <div className="p-4 bg-white/5 border-b border-white/10 font-bold text-white flex justify-between items-center z-10">
              <span>Seeded Tables ({tables.length})</span>
            </div>
            
            <div className="divide-y divide-white/5 max-h-[70vh] overflow-y-auto scrollbar-glass z-10 relative">
              {tables.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  <QrCode size={48} className="mx-auto mb-4 opacity-20 text-green-400" />
                  <p className="font-bold text-lg text-white">No tables defined</p>
                  <p className="text-sm">Use the form to add your first restaurant table.</p>
                </div>
              ) : (
                tables.map((table) => {
                  const guestLink = getGuestLink(table.id, table.qr_code_token);
                  const qrPreview = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(guestLink)}`;

                  return (
                    <div key={table.id} className="p-4 flex flex-col md:flex-row items-center gap-4 hover:bg-white/5 transition-colors">
                      <div className="border border-white/10 rounded-lg p-2 bg-white flex-shrink-0 flex items-center justify-center">
                        <img src={qrPreview} width="80" height="80" alt="QR Code Preview" className="w-20 h-20" />
                      </div>
                      
                      <div className="flex-1 text-center md:text-left min-w-0">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1.5">
                          <h3 className="font-bold text-lg text-white">Table {table.table_number}</h3>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                            table.status === 'bill_requested' ? 'bg-orange-500/20 text-orange-350 border border-orange-500/30' :
                            table.status === 'active' ? 'bg-blue-500/20 text-blue-350 border border-blue-500/30' : 'bg-white/10 text-gray-400 border border-white/10'
                          }`}>
                            {table.status}
                          </span>
                        </div>
                        
                        <p className="text-xs text-gray-550 font-mono truncate mb-3 select-all">
                          {guestLink}
                        </p>
                        
                        <div className="flex flex-wrap justify-center md:justify-start gap-2">
                           <button
                             onClick={() => copyToClipboard(guestLink)}
                             className="btn-premium-outline text-xs font-bold py-1.5 px-3 rounded transition"
                           >
                             <Copy size={12} /> Copy
                           </button>
                           <a
                             href={guestLink}
                             target="_blank"
                             rel="noreferrer"
                             className="btn-premium-outline text-green-400 text-xs font-bold py-1.5 px-3 rounded transition flex items-center gap-1"
                           >
                             <ExternalLink size={12} /> Simulate Scan
                           </a>
                           <button
                             onClick={() => printSingleQR(table.table_number, guestLink)}
                             className="btn-premium-outline hover:border-green-500 hover:text-green-400 text-xs font-bold py-1.5 px-3 rounded flex items-center gap-1 transition"
                           >
                             <Printer size={12} /> Print
                           </button>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleDeleteTable(table.id, table.table_number)}
                        className="p-2.5 btn-premium-danger rounded-lg transition"
                        title="Delete table"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
