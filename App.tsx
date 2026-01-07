
import React, { useState, useMemo, useCallback } from 'react';
import { Plus, Trash2, Download, Printer, User, Building, FileText, IndianRupee, MapPin, Calculator, Info } from 'lucide-react';
import { InvoiceData, LineItem, ChargingBasis } from './types';
import { TDS_SECTIONS, CHARGING_BASES, getBasisSuffix } from './constants';
import InvoicePreview from './components/InvoicePreview';

const initialData: InvoiceData = {
  providerName: '',
  providerAddress: '',
  providerPan: '',
  providerAadhaar: '',
  providerContact: '',
  providerEmail: '',
  natureOfService: '',
  clientName: '',
  clientAddress: '',
  clientPan: '',
  clientGstin: '',
  authorizedSignatory: '',
  logoUrl: null,
  invoiceNumber: '', // Start empty as it is optional
  invoiceDate: new Date().toISOString().split('T')[0],
  placeOfIssue: '',
  paymentReference: '',
  items: [
    { id: '1', description: '', basis: ChargingBasis.PER_DAY, rate: 0, qty: 1, amount: 0 }
  ],
  tdsSectionId: '194J_PROF'
};

const App: React.FC = () => {
  const [data, setData] = useState<InvoiceData>(initialData);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const updateItem = (id: string, field: keyof LineItem, value: any) => {
    setData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          // If Lump Sum, quantity is effectively 1 for calculation but hidden in UI
          const calcQty = updated.basis === ChargingBasis.LUMP_SUM ? 1 : updated.qty;
          updated.amount = updated.rate * calcQty;
          return updated;
        }
        return item;
      })
    }));
  };

  const addItem = () => {
    const newItem: LineItem = {
      id: Math.random().toString(36).substr(2, 9),
      description: '',
      basis: ChargingBasis.PER_DAY,
      rate: 0,
      qty: 1,
      amount: 0
    };
    setData(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const removeItem = (id: string) => {
    if (data.items.length === 1) return;
    setData(prev => ({ ...prev, items: prev.items.filter(item => item.id !== id) }));
  };

  const isIndivHuf = useMemo(() => {
    const pan = data.providerPan.trim().toUpperCase();
    return pan.length >= 4 && pan[3] === 'P';
  }, [data.providerPan]);

  const derivedTdsRate = useMemo(() => {
    const section = TDS_SECTIONS.find(s => s.id === data.tdsSectionId);
    if (!section) return 0;

    if (section.id === '194C') {
      return isIndivHuf ? 1 : 2;
    }
    return section.rateDefault;
  }, [data.tdsSectionId, isIndivHuf]);

  const subtotal = useMemo(() => {
    return data.items.reduce((sum, item) => sum + item.amount, 0);
  }, [data.items]);

  const tdsAmount = useMemo(() => {
    return (subtotal * derivedTdsRate) / 100;
  }, [subtotal, derivedTdsRate]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-30 flex justify-between items-center no-print">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600 rounded-lg text-white">
            <Calculator size={24} />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Invoice Gen <span className="text-indigo-600">Pro</span></h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm active:scale-95"
          >
            <Download size={18} />
            Download PDF / Print
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-auto bg-gray-50 flex flex-col lg:flex-row no-print">
        {/* FORM SECTION */}
        <section className="flex-1 p-6 space-y-8 overflow-y-auto lg:max-w-2xl border-r border-gray-200 scrollbar-hide">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-indigo-700 font-semibold border-b pb-3 border-indigo-50">
              <User size={20} />
              <h2>Service Provider Details (Sender)</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name / Firm Name *</label>
                <input
                  name="providerName"
                  value={data.providerName}
                  onChange={handleInputChange}
                  placeholder="Enter your name or business name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Complete Address *</label>
                <textarea
                  name="providerAddress"
                  value={data.providerAddress}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Street, City, State, PIN"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number *</label>
                <input
                  name="providerPan"
                  value={data.providerPan}
                  onChange={handleInputChange}
                  placeholder="ABCDE1234F"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 uppercase"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar (Optional)</label>
                <input
                  name="providerAadhaar"
                  value={data.providerAadhaar}
                  onChange={handleInputChange}
                  placeholder="12-digit Aadhaar number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nature of Service</label>
                <input
                  name="natureOfService"
                  value={data.natureOfService}
                  onChange={handleInputChange}
                  placeholder="e.g., IT Consulting, Technical Training"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-indigo-700 font-semibold border-b pb-3 border-indigo-50">
              <Building size={20} />
              <h2>Client Details (Recipient)</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name *</label>
                <input
                  name="clientName"
                  value={data.clientName}
                  onChange={handleInputChange}
                  placeholder="Client company name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Billing Address *</label>
                <textarea
                  name="clientAddress"
                  value={data.clientAddress}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Client complete address"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client PAN (Optional)</label>
                <input
                  name="clientPan"
                  value={data.clientPan}
                  onChange={handleInputChange}
                  placeholder="Client PAN"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 uppercase"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN (Optional)</label>
                <input
                  name="clientGstin"
                  value={data.clientGstin}
                  onChange={handleInputChange}
                  placeholder="Client GSTIN"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 uppercase"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Logo (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-indigo-700 font-semibold border-b pb-3 border-indigo-50">
              <FileText size={20} />
              <h2>Invoice Meta & TDS Selection</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number (Optional)</label>
                <input
                  name="invoiceNumber"
                  value={data.invoiceNumber}
                  onChange={handleInputChange}
                  placeholder="INV-001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
                <input
                  type="date"
                  name="invoiceDate"
                  value={data.invoiceDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Place of Issue</label>
                <input
                  name="placeOfIssue"
                  value={data.placeOfIssue}
                  onChange={handleInputChange}
                  placeholder="e.g., Bangalore"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Authorized Signatory Name</label>
                <input
                  name="authorizedSignatory"
                  value={data.authorizedSignatory}
                  onChange={handleInputChange}
                  placeholder="Name for signing space"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">TDS Section *</label>
                <select
                  name="tdsSectionId"
                  value={data.tdsSectionId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {TDS_SECTIONS.map(sec => {
                    let label = `${sec.code} - ${sec.label}`;
                    if (sec.id === '194C') {
                      label = isIndivHuf 
                        ? 'Sec 194C - Contractor (Indiv/HUF) (1%)' 
                        : 'Sec 194C - Contractor (Other) (2%)';
                    }
                    return (
                      <option key={sec.id} value={sec.id}>{label}</option>
                    );
                  })}
                </select>
                <div className="mt-2 text-xs text-indigo-600 bg-indigo-50 p-2 rounded flex items-start gap-2">
                  <Info size={14} className="mt-0.5 flex-shrink-0" />
                  <p>
                    Effective TDS Rate: <strong>{derivedTdsRate}%</strong>
                    {data.tdsSectionId === '194C' && (
                      <span> (Auto-detected from PAN 4th char "{data.providerPan[3]?.toUpperCase() || '-'}")</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b pb-3 border-indigo-50">
              <div className="flex items-center gap-2 text-indigo-700 font-semibold">
                <IndianRupee size={20} />
                <h2>Work Details</h2>
              </div>
              <button
                onClick={addItem}
                className="text-xs flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-100 border border-green-200 transition-colors"
              >
                <Plus size={14} /> Add Row
              </button>
            </div>
            
            <div className="space-y-4">
              {data.items.map((item, index) => (
                <div key={item.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 space-y-3 relative group">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-gray-400">LINE ITEM #{index + 1}</span>
                    {data.items.length > 1 && (
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-12 md:col-span-4">
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">Description</label>
                      <input
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        placeholder="Service description"
                        className="w-full px-3 py-1.5 border border-gray-200 rounded-md text-sm"
                      />
                    </div>
                    <div className="col-span-6 md:col-span-2">
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">Basis</label>
                      <select
                        value={item.basis}
                        onChange={(e) => updateItem(item.id, 'basis', e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-200 rounded-md text-sm"
                      >
                        {CHARGING_BASES.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    <div className="col-span-6 md:col-span-2">
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">Rate (₹)</label>
                      <input
                        type="number"
                        value={item.rate || ''}
                        onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 border border-gray-200 rounded-md text-sm"
                      />
                    </div>
                    <div className="col-span-6 md:col-span-2">
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">
                        Qty {item.basis === ChargingBasis.LUMP_SUM ? '' : `(${getBasisSuffix(item.basis)})`}
                      </label>
                      <input
                        type="number"
                        disabled={item.basis === ChargingBasis.LUMP_SUM}
                        value={item.basis === ChargingBasis.LUMP_SUM ? '' : (item.qty || '')}
                        placeholder={item.basis === ChargingBasis.LUMP_SUM ? '-' : '1'}
                        onChange={(e) => updateItem(item.id, 'qty', parseFloat(e.target.value) || 0)}
                        className={`w-full px-3 py-1.5 border border-gray-200 rounded-md text-sm ${item.basis === ChargingBasis.LUMP_SUM ? 'bg-gray-100 text-gray-400' : ''}`}
                      />
                    </div>
                    <div className="col-span-6 md:col-span-2">
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">Amount</label>
                      <div className="w-full px-3 py-1.5 border border-gray-100 rounded-md text-sm font-semibold text-indigo-700 bg-white">
                        ₹{item.amount.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-4 border-t border-gray-100 flex flex-col items-end gap-2">
              <div className="flex justify-between w-full max-w-xs text-sm">
                <span className="text-gray-500">Gross Subtotal:</span>
                <span className="font-bold text-gray-800">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between w-full max-w-xs text-sm text-indigo-600">
                <span>TDS ({derivedTdsRate}%):</span>
                <span className="font-semibold">- ₹{tdsAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </section>

        {/* PREVIEW SECTION */}
        <section className="flex-1 bg-gray-200 p-8 flex justify-center items-start overflow-y-auto no-print">
          <div className="shadow-2xl sticky top-0">
             <InvoicePreview 
               data={data} 
               subtotal={subtotal} 
               tdsRate={derivedTdsRate} 
               tdsAmount={tdsAmount} 
             />
          </div>
        </section>
      </main>

      {/* PRINT-ONLY ACTUAL TEMPLATE */}
      <div className="hidden print:block bg-white p-0">
        <InvoicePreview 
          data={data} 
          subtotal={subtotal} 
          tdsRate={derivedTdsRate} 
          tdsAmount={tdsAmount} 
          isPrintMode={true}
        />
      </div>

      <footer className="no-print bg-white border-t border-gray-200 py-3 px-6 text-center text-xs text-gray-400">
        Standalone Invoice Generator • Indian Income Tax TDS Compliant • No Data Storage
      </footer>
    </div>
  );
};

export default App;
