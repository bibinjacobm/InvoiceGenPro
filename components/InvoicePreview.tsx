
import React from 'react';
import { InvoiceData, ChargingBasis } from '../types';
import { TDS_SECTIONS, getBasisSuffix } from '../constants';

interface PreviewProps {
  data: InvoiceData;
  subtotal: number;
  tdsRate: number;
  tdsAmount: number;
  isPrintMode?: boolean;
}

const InvoicePreview: React.FC<PreviewProps> = ({ data, subtotal, tdsRate, tdsAmount, isPrintMode }) => {
  const selectedTdsSection = TDS_SECTIONS.find(s => s.id === data.tdsSectionId);
  const isIndivHuf = data.providerPan.trim().toUpperCase()[3] === 'P';
  
  const sectionLabel = selectedTdsSection?.id === '194C' 
    ? (isIndivHuf ? 'Section 194C - Contractor (Indiv/HUF)' : 'Section 194C - Contractor (Other)')
    : `Section ${selectedTdsSection?.code} - ${selectedTdsSection?.label}`;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(val);
  };

  return (
    <div className={`bg-white shadow-lg mx-auto ${isPrintMode ? 'w-full min-h-screen' : 'w-[210mm] aspect-[1/1.41] p-12'} overflow-hidden flex flex-col`} style={{ 
      padding: isPrintMode ? '10mm 15mm' : '3rem',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-gray-800 pb-8 mb-8">
        <div className="flex-1">
          <h1 className="text-3xl font-black text-gray-900 mb-1 uppercase tracking-tighter">Tax Invoice</h1>
          <p className="text-gray-500 font-medium text-sm">Professional Services rendered</p>
          
          <div className="mt-6 space-y-1">
            {data.invoiceNumber && (
              <div className="flex gap-2 text-sm">
                <span className="text-gray-400 w-24">Invoice No:</span>
                <span className="font-bold text-gray-800">{data.invoiceNumber}</span>
              </div>
            )}
            <div className="flex gap-2 text-sm">
              <span className="text-gray-400 w-24">Date:</span>
              <span className="font-bold text-gray-800">{new Date(data.invoiceDate).toLocaleDateString('en-IN')}</span>
            </div>
            {data.placeOfIssue && (
              <div className="flex gap-2 text-sm">
                <span className="text-gray-400 w-24">Place:</span>
                <span className="font-bold text-gray-800 uppercase">{data.placeOfIssue}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end text-right min-w-[200px]">
          {data.logoUrl && (
            <img src={data.logoUrl} alt="Company Logo" className="h-16 w-auto object-contain mb-4" />
          )}
          <h2 className="text-xl font-bold text-indigo-700 leading-tight">{data.clientName || 'CLIENT NAME'}</h2>
          <p className="text-xs text-gray-500 max-w-[250px] whitespace-pre-wrap">{data.clientAddress || 'Client Address'}</p>
          {data.clientPan && (
            <p className="text-xs text-gray-800 font-semibold mt-2 uppercase">PAN: {data.clientPan}</p>
          )}
          {data.clientGstin && (
            <p className="text-xs text-gray-800 font-semibold uppercase">GSTIN: {data.clientGstin}</p>
          )}
        </div>
      </div>

      {/* Raised By Section */}
      <div className="grid grid-cols-2 gap-12 mb-10">
        <div>
          <h3 className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-3 border-b border-indigo-100 pb-1">Invoice Raised By</h3>
          <div className="space-y-1">
            <p className="font-bold text-gray-900 text-lg uppercase">{data.providerName || 'YOUR NAME / FIRM'}</p>
            <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{data.providerAddress || 'Your Address'}</p>
            <div className="mt-4 pt-2 space-y-0.5 border-t border-gray-50">
              <p className="text-xs font-semibold text-gray-800 uppercase">PAN: {data.providerPan || '-'}</p>
              {data.providerAadhaar && <p className="text-xs text-gray-600">Aadhaar: {data.providerAadhaar}</p>}
              {data.natureOfService && <p className="text-xs text-indigo-600 italic">Nature of Service: {data.natureOfService}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="flex-1">
        <table className="w-full text-left table-fixed">
          <thead>
            <tr className="bg-gray-800 text-white text-[11px] font-bold uppercase tracking-wider">
              <th className="px-4 py-3 rounded-l-lg w-12 text-center">Sl.</th>
              <th className="px-4 py-3 w-auto">Description</th>
              <th className="px-4 py-3 w-32">Charging Basis</th>
              <th className="px-4 py-3 w-28 text-right">Rate</th>
              <th className="px-4 py-3 w-28 text-center">Qty</th>
              <th className="px-4 py-3 rounded-r-lg w-32 text-right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.items.map((item, index) => (
              <tr key={item.id} className="text-sm border-b border-gray-50">
                <td className="px-4 py-4 text-gray-400 font-medium text-center">{index + 1}</td>
                <td className="px-4 py-4 text-gray-800">
                  <span className="font-semibold block">{item.description || 'Description of service'}</span>
                </td>
                <td className="px-4 py-4 text-gray-600 text-xs">{item.basis}</td>
                <td className="px-4 py-4 text-gray-800 text-right">{formatCurrency(item.rate)}</td>
                <td className="px-4 py-4 text-gray-800 text-center">
                  {item.basis === ChargingBasis.LUMP_SUM ? '' : `${item.qty} ${getBasisSuffix(item.basis)}`}
                </td>
                <td className="px-4 py-4 text-gray-900 font-bold text-right">{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="mt-8 border-t-2 border-gray-100 pt-6">
        <div className="flex justify-between items-start">
          <div className="flex-1 max-w-md">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Declaration</h4>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <p className="text-[11px] text-gray-600 leading-relaxed italic">
                I/We hereby declare that this invoice shows the actual price of services described and that all particulars are true and correct.
              </p>
              <p className="text-[11px] font-bold text-indigo-700 mt-3 leading-relaxed">
                "The TDS at ({sectionLabel}) amounted {formatCurrency(tdsAmount)} can be deducted as per Income Tax Act, 1961."
              </p>
            </div>
          </div>
          <div className="w-72 space-y-3 pl-8">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <span className="text-gray-500 font-medium">Subtotal</span>
              <span className="font-bold text-gray-900">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-indigo-600">
              <span>TDS Deduction ({tdsRate}%)</span>
              <span className="font-medium">{formatCurrency(tdsAmount)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 bg-indigo-50 p-3 rounded-lg border-2 border-indigo-100">
              <span className="text-indigo-800 font-bold uppercase tracking-wider text-xs">Total Amount</span>
              <span className="text-2xl font-black text-indigo-900">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] text-gray-400 font-semibold uppercase pt-1">
              <span>Net Payable after TDS</span>
              <span>{formatCurrency(subtotal - tdsAmount)}</span>
            </div>
          </div>
        </div>

        {/* Signature Area */}
        <div className="mt-16 grid grid-cols-2 gap-24">
          <div className="text-center">
            <div className="border-t border-gray-300 pt-2 h-20 flex flex-col justify-end">
              <p className="text-[10px] text-gray-400 mb-1">This invoice may be signed after printing</p>
              <p className="text-sm font-bold text-gray-800 uppercase tracking-tighter truncate">
                {data.providerName || 'Service Provider'}
              </p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">(Authorised Signatory)</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-gray-300 pt-2 h-20 flex flex-col justify-end">
              <p className="text-sm font-bold text-gray-800 uppercase tracking-tighter truncate">
                {data.authorizedSignatory || 'For Client'}
              </p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">(Authorised Signatory)</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-gray-50 text-center">
          <p className="text-[9px] text-gray-400 font-medium uppercase tracking-widest">
            Generated via Invoice Gen Pro • Indian Income Tax Act 1961 Compliant • Original Copy
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;
