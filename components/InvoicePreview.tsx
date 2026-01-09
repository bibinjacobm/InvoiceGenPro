
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
      padding: isPrintMode ? '10mm 12mm' : '2.5rem',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-gray-800 pb-4 mb-4">
        <div className="flex-1">
          <h1 className="text-2xl font-black text-gray-900 mb-1 uppercase tracking-tighter">Consultancy Invoice</h1>
          <p className="text-gray-500 font-medium text-[11px]">Professional Services Rendered</p>
          
          <div className="mt-4 space-y-0.5">
            {data.invoiceNumber && (
              <div className="flex gap-2 text-[12px]">
                <span className="text-gray-400 w-20">Invoice No:</span>
                <span className="font-bold text-gray-800">{data.invoiceNumber}</span>
              </div>
            )}
            <div className="flex gap-2 text-[12px]">
              <span className="text-gray-400 w-20">Date:</span>
              <span className="font-bold text-gray-800">{new Date(data.invoiceDate).toLocaleDateString('en-IN')}</span>
            </div>
            {data.placeOfIssue && (
              <div className="flex gap-2 text-[12px]">
                <span className="text-gray-400 w-20">Place:</span>
                <span className="font-bold text-gray-800 uppercase">{data.placeOfIssue}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end text-right min-w-[180px]">
          {data.logoUrl && (
            <img src={data.logoUrl} alt="Company Logo" className="h-12 w-auto object-contain mb-3" />
          )}
          <h2 className="text-lg font-bold text-indigo-700 leading-tight">{data.clientName || 'CLIENT NAME'}</h2>
          <p className="text-[11px] text-gray-500 max-w-[220px] whitespace-pre-wrap">{data.clientAddress || 'Client Address'}</p>
          {data.clientPan && (
            <p className="text-[11px] text-gray-800 font-semibold mt-1 uppercase">PAN: {data.clientPan}</p>
          )}
          {data.clientGstin && (
            <p className="text-[11px] text-gray-800 font-semibold uppercase">GSTIN: {data.clientGstin}</p>
          )}
        </div>
      </div>

      {/* Raised By Section */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        <div>
          <h3 className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest mb-2 border-b border-indigo-100 pb-0.5">Invoice Raised By</h3>
          <div className="space-y-0.5">
            <p className="font-bold text-gray-900 text-base uppercase">{data.providerName || 'YOUR NAME / FIRM'}</p>
            <p className="text-[12px] text-gray-600 whitespace-pre-wrap leading-tight">{data.providerAddress || 'Your Address'}</p>
            <div className="mt-2 pt-1 space-y-0.5 border-t border-gray-50">
              <p className="text-[11px] font-semibold text-gray-800 uppercase">PAN: {data.providerPan || '-'}</p>
              {data.providerAadhaar && <p className="text-[11px] text-gray-600">Aadhaar: {data.providerAadhaar}</p>}
              {data.natureOfService && <p className="text-[11px] text-indigo-600 italic">Nature of Service: {data.natureOfService}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="flex-1">
        <table className="w-full text-left table-fixed">
          <thead>
            <tr className="bg-gray-800 text-white text-[10px] font-bold uppercase tracking-wider">
              <th className="px-3 py-2 rounded-l-md w-10 text-center">Sl.</th>
              <th className="px-3 py-2 w-auto">Description</th>
              <th className="px-3 py-2 w-28">Basis</th>
              <th className="px-3 py-2 w-24 text-right">Rate</th>
              <th className="px-3 py-2 w-24 text-center">Qty</th>
              <th className="px-3 py-2 rounded-r-md w-28 text-right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.items.map((item, index) => (
              <tr key={item.id} className="text-[12px] border-b border-gray-50">
                <td className="px-3 py-2 text-gray-400 font-medium text-center">{index + 1}</td>
                <td className="px-3 py-2 text-gray-800">
                  <span className="font-semibold block leading-tight">{item.description || 'Description of service'}</span>
                </td>
                <td className="px-3 py-2 text-gray-600 text-[10px]">{item.basis}</td>
                <td className="px-3 py-2 text-gray-800 text-right">{formatCurrency(item.rate)}</td>
                <td className="px-3 py-2 text-gray-800 text-center">
                  {item.basis === ChargingBasis.LUMP_SUM ? '' : `${item.qty} ${getBasisSuffix(item.basis)}`}
                </td>
                <td className="px-3 py-2 text-gray-900 font-bold text-right">{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="mt-4 border-t border-gray-100 pt-4">
        <div className="flex justify-between items-start">
          <div className="flex-1 max-w-lg">
            <h4 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Declaration & TDS Info</h4>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <p className="text-[10px] text-gray-600 leading-tight italic mb-2">
                I/We hereby declare that this invoice shows the actual price of services described and that all particulars are true and correct.
              </p>
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-indigo-700 leading-tight">
                  TDS Details: ({sectionLabel}) @ {tdsRate}% = {formatCurrency(tdsAmount)}
                </p>
                <p className="text-[11px] font-bold text-gray-800 leading-tight">
                  Net Amount Payable after TDS: {formatCurrency(subtotal - tdsAmount)}
                </p>
              </div>
            </div>
          </div>
          <div className="w-64 space-y-2 pl-6">
            <div className="flex justify-between items-center pb-1 border-b border-gray-100 text-[12px]">
              <span className="text-gray-500 font-medium">Gross Subtotal</span>
              <span className="font-bold text-gray-900">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center bg-indigo-50 px-3 py-2 rounded border border-indigo-100">
              <span className="text-indigo-800 font-bold uppercase tracking-wider text-[10px]">Total Invoice Value</span>
              <span className="text-xl font-black text-indigo-900">{formatCurrency(subtotal)}</span>
            </div>
          </div>
        </div>

        {/* Signature Area */}
        <div className="mt-12 grid grid-cols-2 gap-16">
          <div className="text-center">
            <div className="border-t border-gray-300 pt-1 h-14 flex flex-col justify-end">
              <p className="text-[9px] text-gray-400 mb-0.5 italic">Authorised Signature</p>
              <p className="text-[12px] font-bold text-gray-800 uppercase tracking-tighter truncate">
                {data.providerName || 'Service Provider'}
              </p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-gray-300 pt-1 h-14 flex flex-col justify-end">
              <p className="text-[12px] font-bold text-gray-800 uppercase tracking-tighter truncate">
                {data.authorizedSignatory || 'For Client'}
              </p>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-0.5">(Authorised Signatory)</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-2 border-t border-gray-50 flex justify-between items-center">
          <p className="text-[8px] text-gray-400 font-medium uppercase tracking-widest">
            Generated via Invoice Gen Pro • Professional Document • Original Copy
          </p>
          <p className="text-[8px] text-gray-300 italic">
            creator: bibin jacob
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;
