
import React, { useState } from 'react';
import { ChangeOrderData, LaborRates, MaterialItem, LaborTask } from '../types';
import { GoldButton } from './GoldButton';
import { Icons } from '../constants';
import { ProductSearchModal } from './ProductSearchModal';
import { lookupMSRP } from '../services/productSearchService';

interface ChangeOrderViewProps {
  data: ChangeOrderData;
  rates: LaborRates;
  onReset: () => void;
  onDataChange: (data: ChangeOrderData) => void;
  onGenerateProposal: () => void;
  isGeneratingProposal: boolean;
}

export const ChangeOrderView: React.FC<ChangeOrderViewProps> = ({ data, rates, onReset, onDataChange, onGenerateProposal, isGeneratingProposal }) => {
  // Product search modal state
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchInitialQuery, setSearchInitialQuery] = useState('');
  const [lookupLoadingIndex, setLookupLoadingIndex] = useState<number | null>(null);

  // Helper to update a field and trigger recalculation
  const updateField = <K extends keyof ChangeOrderData>(field: K, value: ChangeOrderData[K]) => {
    onDataChange({ ...data, [field]: value });
  };

  // Helper to normalize admin field values - show "NA" for empty/inferred values
  const normalizeAdminValue = (value: string | undefined): string => {
    if (!value || value.trim() === '' || value.toLowerCase().includes('infer')) {
      return 'NA';
    }
    return value;
  };

  // Add product from search
  const handleAddProduct = (item: MaterialItem) => {
    const newMaterials = [...data.materials, item];
    onDataChange({ ...data, materials: newMaterials });
  };

  // Look up MSRP for an existing item
  const handleLookupMSRP = async (index: number, manufacturer: string, model: string) => {
    setLookupLoadingIndex(index);
    try {
      const result = await lookupMSRP(manufacturer, model);
      if (result) {
        const newMaterials = [...data.materials];
        newMaterials[index] = {
          ...newMaterials[index],
          msrp: result.msrp,
          model: `${result.model} (${result.partNumber})`
        };
        onDataChange({ ...data, materials: newMaterials });
      }
    } catch (error) {
      console.error('MSRP lookup error:', error);
    } finally {
      setLookupLoadingIndex(null);
    }
  };

  // Open search modal with optional initial query
  const openSearchModal = (query: string = '') => {
    setSearchInitialQuery(query);
    setIsSearchModalOpen(true);
  };

  const updateLaborTask = (index: number, updates: Partial<LaborTask>) => {
    const newLabor = [...data.labor];
    newLabor[index] = { ...newLabor[index], ...updates };
    onDataChange({ ...data, labor: newLabor });
  };

  const updateMaterial = (index: number, updates: Partial<MaterialItem>) => {
    const newMaterials = [...data.materials];
    newMaterials[index] = { ...newMaterials[index], ...updates };
    onDataChange({ ...data, materials: newMaterials });
  };

  // Financial Calculations - these automatically update when data changes
  const laborSubtotal = data.labor.reduce((acc, task) => {
    const rate = rates[task.rateType as keyof LaborRates] || rates.base;
    return acc + (task.hours * rate);
  }, 0);
  const laborMarkup = laborSubtotal * 0.15;
  const totalLabor = laborSubtotal + laborMarkup;

  const materialItems = data.materials.filter(m => m.category === 'Material');
  const equipmentItems = data.materials.filter(m => m.category === 'Equipment');
  const allItems = [...materialItems, ...equipmentItems];

  const materialSubtotal = materialItems.reduce((acc, item) => acc + (item.msrp * item.quantity), 0);
  const materialMarkup = materialSubtotal * 0.15;
  const totalMaterials = materialSubtotal + materialMarkup;

  const equipmentSubtotal = equipmentItems.reduce((acc, item) => acc + (item.msrp * item.quantity), 0);
  const equipmentMarkup = equipmentSubtotal * 0.15;
  const totalEquipment = equipmentSubtotal + equipmentMarkup;

  const salesTaxRate = 0.0825; // 8.25% as per Rancho Cordova
  const taxBase = materialSubtotal + equipmentSubtotal;
  const salesTax = taxBase * salesTaxRate;

  const grandTotal = totalLabor + totalMaterials + totalEquipment + salesTax;

  const currentDate = new Date().toLocaleDateString();

  // Editable input styles
  const editableTextClass = "bg-transparent hover:bg-yellow-50 focus:bg-yellow-50 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] px-1 rounded transition-colors print:hover:bg-transparent print:focus:bg-transparent print:focus:ring-0";
  const editableNumberClass = "bg-transparent hover:bg-yellow-50 focus:bg-yellow-50 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] text-right w-full rounded transition-colors print:hover:bg-transparent print:focus:bg-transparent print:focus:ring-0";

  const renderMaterialRow = (item: MaterialItem, displayIndex: number) => {
    // Find the actual index in data.materials
    const actualIndex = data.materials.findIndex(m => m === item);
    const isCable = item.unitOfMeasure === 'ft';
    const isLoading = lookupLoadingIndex === actualIndex;

    return (
      <div key={displayIndex} className="grid grid-cols-12 text-[9px] border-b border-gray-300 group">
        <div className="col-span-1 border-r border-black px-1 py-px text-center font-bold flex items-center justify-center">
          <input
            type="number"
            value={item.quantity}
            onChange={(e) => updateMaterial(actualIndex, { quantity: parseFloat(e.target.value) || 0 })}
            className={`${editableNumberClass} w-12 text-center font-bold`}
            min="0"
            step="1"
          />
          {isCable && <span className="ml-0.5">ft</span>}
        </div>
        <div className="col-span-6 border-r border-black px-2 py-px uppercase flex items-center">
          <span className="flex-1">{item.manufacturer} {item.model} {isCable ? '(PER FT)' : ''}</span>
          {/* Lookup MSRP button - hidden on print */}
          <button
            onClick={() => handleLookupMSRP(actualIndex, item.manufacturer, item.model)}
            className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-[#D4AF37] hover:text-[#FFD700] print:hidden"
            title="Look up current MSRP"
            disabled={isLoading}
          >
            {isLoading ? (
              <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </button>
        </div>
        <div className="col-span-1 border-r border-black px-1 py-px text-center text-[8px] text-gray-500 uppercase print:hidden">
          {item.category === 'Equipment' ? 'EQP' : 'MAT'}
        </div>
        <div className="col-span-2 border-r border-black px-1 py-px text-right font-mono font-bold flex items-center">
          <span className="mr-0.5">$</span>
          <input
            type="number"
            value={item.msrp}
            onChange={(e) => updateMaterial(actualIndex, { msrp: parseFloat(e.target.value) || 0 })}
            className={`${editableNumberClass} font-mono font-bold`}
            min="0"
            step="0.01"
          />
        </div>
        <div className="col-span-2 px-2 py-px text-right font-mono font-bold">
          $ {(item.quantity * item.msrp).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white text-black shadow-2xl p-0 font-sans print:shadow-none mb-20 overflow-hidden border border-gray-300">
      {/* Edit Mode Banner - Hidden on Print */}
      <div className="bg-gradient-to-r from-[#D4AF37] to-[#B8962F] text-black px-4 py-2 flex items-center gap-3 print:hidden">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <span className="font-bold text-sm uppercase tracking-wider">Edit Mode Active</span>
        <span className="text-xs opacity-75">• Click any highlighted field to edit • Totals recalculate automatically</span>
      </div>

      {/* Header Area */}
      <div className="p-4 pb-2">
        <div className="flex justify-between items-start mb-4">
          {/* Master-Level "3D" Logo - Deeply Embedded */}
          <div className="w-[280px] h-16">
            <Icons.Logo className="w-full h-full" />
          </div>

          <div className="text-[10px] text-right font-bold leading-tight uppercase mt-6 tracking-tighter">
            11365 SUNRISE GOLD CIRCLE - RANCHO CORDOVA, CA 95742<br />
            Phone: (916) 853-9111 - Fax: (916) 853-9118 - Lic.: 8757457
          </div>
        </div>

        {/* Change Order Green Bar */}
        <div className="bg-[#bbf7d0] border border-black py-2 mb-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
          <div className="flex justify-between items-center px-10">
            <h1 className="text-xl font-black italic uppercase tracking-[0.15em] drop-shadow-sm">Change Order Request:</h1>
            <span className="text-xl font-black tracking-widest font-mono flex items-center">
              #
              <input
                type="text"
                value={data.pcoNumber || ''}
                onChange={(e) => updateField('pcoNumber', e.target.value)}
                className={`${editableTextClass} w-16 text-center font-black font-mono`}
                placeholder="0"
              />
            </span>
          </div>
        </div>

        {/* Administrative Details - High Fidelity Layout */}
        <div className="grid grid-cols-2 gap-x-8 text-[11px] mb-3">
          <div className="space-y-0">
            <div className="flex items-end border-b border-black h-6">
              <span className="font-black w-20 uppercase tracking-tighter">Customer:</span>
              <input
                type="text"
                value={data.customer}
                onChange={(e) => updateField('customer', e.target.value)}
                className={`${editableTextClass} flex-1 font-bold text-gray-800`}
              />
            </div>
            <div className="flex items-end border-b border-black h-6">
              <span className="font-black w-20 uppercase tracking-tighter">Contact:</span>
              <input
                type="text"
                value={data.contact}
                onChange={(e) => updateField('contact', e.target.value)}
                className={`${editableTextClass} flex-1 font-bold text-gray-800`}
              />
            </div>
            <div className="flex items-end border-b border-black h-6">
              <span className="font-black w-20 uppercase tracking-tighter">Project:</span>
              <input
                type="text"
                value={data.projectName}
                onChange={(e) => updateField('projectName', e.target.value)}
                className={`${editableTextClass} flex-1 font-bold text-gray-800`}
              />
            </div>
            <div className="flex items-end border-b border-black h-6">
              <span className="font-black w-20 uppercase tracking-tighter">Address:</span>
              <input
                type="text"
                value={data.address}
                onChange={(e) => updateField('address', e.target.value)}
                className={`${editableTextClass} flex-1 font-bold text-gray-800 truncate`}
              />
            </div>
            <div className="flex items-end border-b border-black h-6">
              <span className="font-black w-20 uppercase tracking-tighter">Phone:</span>
              <input
                type="text"
                value={data.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className={`${editableTextClass} flex-1 font-bold text-gray-800`}
              />
            </div>
          </div>
          <div className="space-y-0">
            <div className="flex items-end border-b border-black h-6">
              <span className="font-black w-40 text-right pr-4 uppercase tracking-tighter">Date:</span>
              <span className="flex-1 px-2 font-bold text-gray-800">{currentDate}</span>
            </div>
            <div className="flex items-end border-b border-black h-6">
              <span className="font-black w-40 text-right pr-4 uppercase tracking-tighter">3DTSI Project #:</span>
              <input
                type="text"
                value={normalizeAdminValue(data.projectNumber)}
                onChange={(e) => updateField('projectNumber', e.target.value === 'NA' ? '' : e.target.value)}
                className={`${editableTextClass} flex-1 font-bold text-gray-800`}
              />
            </div>
            <div className="flex items-end border-b border-black h-6">
              <span className="font-black w-40 text-right pr-4 uppercase tracking-tighter">RFI#:</span>
              <input
                type="text"
                value={normalizeAdminValue(data.rfiNumber)}
                onChange={(e) => updateField('rfiNumber', e.target.value === 'NA' ? '' : e.target.value)}
                className={`${editableTextClass} flex-1 font-bold text-gray-800`}
              />
            </div>
            <div className="flex items-end border-b border-black h-6">
              <span className="font-black w-40 text-right pr-4 uppercase tracking-tighter">PCO#:</span>
              <input
                type="text"
                value={normalizeAdminValue(data.pcoNumber)}
                onChange={(e) => updateField('pcoNumber', e.target.value === 'NA' ? '' : e.target.value)}
                className={`${editableTextClass} flex-1 font-bold text-gray-800`}
              />
            </div>
            <div className="flex items-end border-b border-black h-6">
              <span className="font-black text-right pr-4 uppercase text-[9px] tracking-widest opacity-50">Supplemental Instruction:</span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-[11px] font-black border-b-2 border-black mb-1 uppercase italic tracking-widest bg-gray-100 py-1 px-2">Prepared Work Summary:</h3>
          <textarea
            value={data.technicalScope}
            onChange={(e) => {
              updateField('technicalScope', e.target.value);
              // Auto-resize the textarea
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            ref={(el) => {
              // Auto-resize on initial render
              if (el) {
                el.style.height = 'auto';
                el.style.height = el.scrollHeight + 'px';
              }
            }}
            className={`${editableTextClass} text-[9px] leading-snug w-full whitespace-pre-wrap px-2 text-gray-900 font-semibold resize-none overflow-hidden print:overflow-visible`}
            style={{ minHeight: '60px' }}
          />
        </div>
      </div>

      {/* Tables & Financials */}
      <div className="border-t-4 border-black">
        <div className="grid grid-cols-12 bg-gray-200 text-[10px] font-black border-b-2 border-black uppercase tracking-[0.15em]">
          <div className="col-span-1 border-r border-black px-2 py-1 text-center">HR. UNITS</div>
          <div className="col-span-7 border-r border-black px-2 py-1">System Components & Implementation Tasks</div>
          <div className="col-span-2 border-r border-black px-2 py-1 text-right">Unit Value</div>
          <div className="col-span-2 px-2 py-1 text-right">Extension</div>
        </div>

        {/* Labor Rows */}
        {data.labor.map((task, i) => (
          <div key={i} className="grid grid-cols-12 text-[9px] border-b border-gray-300">
            <div className="col-span-1 border-r border-black px-1 py-px text-center font-black flex items-center justify-center">
              <input
                type="number"
                value={task.hours}
                onChange={(e) => updateLaborTask(i, { hours: parseFloat(e.target.value) || 0 })}
                className={`${editableNumberClass} w-10 text-center font-black`}
                min="0"
                step="0.5"
              />
            </div>
            <div className="col-span-7 border-r border-black px-1 py-px uppercase font-bold text-gray-800 flex items-center">
              <input
                type="text"
                value={task.task}
                onChange={(e) => updateLaborTask(i, { task: e.target.value })}
                className={`${editableTextClass} flex-1 uppercase font-bold text-gray-800`}
              />
            </div>
            <div className="col-span-2 border-r border-black px-2 py-px text-right font-mono font-bold">$ {(rates[task.rateType as keyof LaborRates] || rates.base).toFixed(2)}</div>
            <div className="col-span-2 px-2 py-px text-right font-mono font-black">$ {(task.hours * (rates[task.rateType as keyof LaborRates] || rates.base)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
        ))}

        <div className="bg-white">
          <div className="grid grid-cols-12 text-[10px] font-bold border-b border-black">
            <div className="col-span-8 border-r border-black px-2 py-1 uppercase text-right tracking-wider">Labor Markup & Management:</div>
            <div className="col-span-2 border-r border-black px-2 py-1 text-right">15.00%</div>
            <div className="col-span-2 px-2 py-1 text-right font-mono font-bold text-[#008a8a]">$ {laborMarkup.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
          <div className="grid grid-cols-12 text-[11px] font-black bg-gray-50 border-b-4 border-black">
            <div className="col-span-10 border-r border-black px-2 py-1.5 text-right uppercase italic tracking-[0.2em]">Subtotal Labor Component:</div>
            <div className="col-span-2 px-2 py-1.5 text-right font-mono text-base">$ {totalLabor.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        {/* Materials Table with Search Button */}
        <div className="flex items-center justify-between bg-gray-200 px-2 py-1 border-b border-black print:hidden">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-700">Materials & Equipment</span>
          <button
            onClick={() => openSearchModal()}
            className="flex items-center gap-1 bg-[#D4AF37] hover:bg-[#FFD700] text-black text-[9px] font-bold uppercase tracking-wider px-3 py-1 transition-all"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search Products
          </button>
        </div>
        <div className="grid grid-cols-12 bg-gray-200 text-[10px] font-black border-b-2 border-black uppercase tracking-[0.15em]">
          <div className="col-span-1 border-r border-black px-2 py-1 text-center">Qty</div>
          <div className="col-span-6 border-r border-black px-2 py-1">Infrastructure, Hardware & Material Assets</div>
          <div className="col-span-1 border-r border-black px-2 py-1 text-center print:hidden">Type</div>
          <div className="col-span-2 border-r border-black px-2 py-1 text-right">Unit Price</div>
          <div className="col-span-2 px-2 py-1 text-right">Total</div>
        </div>
        {allItems.map((item, i) => renderMaterialRow(item, i))}

        {/* Totals Recapitulation */}
        <div className="bg-white">
          <div className="grid grid-cols-12 text-[9px] border-b border-black font-bold">
            <div className="col-span-8 border-r border-black px-2 py-0.5 text-right uppercase tracking-wider">Asset Inventory Markup:</div>
            <div className="col-span-2 border-r border-black px-2 py-0.5 text-right">15.00%</div>
            <div className="col-span-2 px-2 py-0.5 text-right font-mono font-bold text-[#008a8a]">$ {(materialMarkup + equipmentMarkup).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
          <div className="grid grid-cols-12 text-[9px] border-b border-black font-bold">
            <div className="col-span-8 border-r border-black px-2 py-0.5 text-right uppercase tracking-wider">State & Local Sales Tax (Rancho Cordova):</div>
            <div className="col-span-2 border-r border-black px-2 py-0.5 text-right">8.25%</div>
            <div className="col-span-2 px-2 py-0.5 text-right font-mono font-bold text-[#d4af37]">$ {salesTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
          <div className="grid grid-cols-12 text-sm font-black bg-gray-100 py-1 border-b-4 border-black shadow-[inset_0_4px_6px_rgba(0,0,0,0.05)]">
            <div className="col-span-8 text-right px-2 uppercase italic tracking-[0.15em] self-center drop-shadow-sm">Grand Total Service Amount:</div>
            <div className="col-span-4 text-right px-2 self-center font-mono text-base font-black text-black">$ {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
        </div>
      </div>

      {/* Authorization Section - Compact */}
      <div className="p-4 space-y-3">
        <div className="bg-[#bbf7d0]/30 border-l-4 border-[#008a8a] p-2">
          <p className="text-[9px] font-bold leading-tight uppercase italic text-gray-900">
            Authorization: Execution of the signature below confirms receipt and acceptance of the specified 3D Technology Services system modifications. Work is authorized to proceed under the existing MSA.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-[10px] font-bold uppercase">
          <div className="flex border-b border-black pb-1 items-end">
            <span className="opacity-70 mr-2">Authorized Rep (Print):</span>
            <div className="flex-1"></div>
          </div>
          <div className="flex border-b border-black pb-1 items-end">
            <span className="opacity-70 mr-2">Signature:</span>
            <div className="flex-1"></div>
          </div>
          <div className="flex border-b border-black pb-1 items-end">
            <span className="opacity-70 mr-2">Company:</span>
            <span className="font-black text-black">{data.customer}</span>
          </div>
          <div className="flex border-b border-black pb-1 items-end">
            <span className="opacity-70 mr-2">Date:</span>
            <div className="flex-1"></div>
          </div>
        </div>
      </div>

      {/* Non-Printable Actions */}
      <div className="p-10 flex gap-6 print:hidden bg-gray-100 border-t-4 border-gray-300">
        <GoldButton onClick={() => window.print()} className="flex-1 h-16 text-lg shadow-xl tracking-[0.15em] font-black">
          🖨️ PRINT CHANGE ORDER
        </GoldButton>
        <GoldButton
          onClick={onGenerateProposal}
          loading={isGeneratingProposal}
          className="flex-1 h-16 text-lg shadow-xl tracking-[0.15em] font-black bg-gradient-to-r from-[#008a8a] to-[#006666] hover:from-[#009a9a] hover:to-[#007777]"
        >
          ✨ GENERATE PROPOSAL
        </GoldButton>
        <GoldButton onClick={onReset} variant="outline" className="flex-1 h-16 text-lg font-black">
          New Intake Session
        </GoldButton>
      </div>
      {/* Product Search Modal */}
      <ProductSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onAddProduct={handleAddProduct}
        initialQuery={searchInitialQuery}
      />
    </div>
  );
};
