
import React, { useState, useMemo } from 'react';
import { ChangeOrderData, LaborRates, MaterialItem, LaborTask, ValidationResult } from '../types';
import { GoldButton } from './GoldButton';
import { Icons, getOffice, COMPANY_PHONE, COMPANY_FAX, COMPANY_LICENSE } from '../constants';
import { ProductSearchModal } from './ProductSearchModal';
import { lookupMSRP } from '../services/productSearchService';
import { calculateFinancials, fmtUSD } from '../utils/financials';

const clampNonNeg = (n: number) => Math.max(0, Number.isFinite(n) ? n : 0);
const round2OnCommit = (n: number) => Math.round(clampNonNeg(n) * 100) / 100;

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
  const [showValidationDetails, setShowValidationDetails] = useState(false);

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

  // Resolve issuing office (drives header address + sales tax)
  const office = getOffice(data.officeId);

  // Financial Calculations - memoized to avoid recalculating on unrelated re-renders
  const financials = useMemo(
    () => calculateFinancials(data, rates, office.salesTaxRate),
    [data, rates, office.salesTaxRate]
  );
  const {
    laborSubtotal, laborMarkup, laborTotal: totalLabor,
    materialSubtotal, materialMarkup,
    equipmentSubtotal, equipmentMarkup,
    salesTax, taxBase, grandTotal
  } = financials;

  const materialItems = data.materials.filter(m => m.category === 'Material');
  const equipmentItems = data.materials.filter(m => m.category === 'Equipment');
  const allItems = [...materialItems, ...equipmentItems];

  const totalMaterials = materialSubtotal + materialMarkup;
  const totalEquipment = equipmentSubtotal + equipmentMarkup;

  const currentDate = new Date().toLocaleDateString();

  // Editable input styles
  const editableTextClass = "bg-transparent hover:bg-yellow-50 focus:bg-yellow-50 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] px-1 rounded transition-colors print:hover:bg-transparent print:focus:bg-transparent print:focus:ring-0";
  const editableNumberClass = "bg-transparent hover:bg-yellow-50 focus:bg-yellow-50 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] text-right w-full rounded transition-colors print:hover:bg-transparent print:focus:bg-transparent print:focus:ring-0";

  const renderMaterialRow = (item: MaterialItem, displayIndex: number) => {
    // Use the item's original index in data.materials (stable, not reference-dependent)
    const actualIndex = data.materials.indexOf(item);
    // Fallback: find by matching properties if reference was broken by spread
    const safeIndex = actualIndex >= 0 ? actualIndex : data.materials.findIndex(
      m => m.manufacturer === item.manufacturer && m.model === item.model && m.quantity === item.quantity
    );
    const isCable = item.unitOfMeasure === 'ft';
    const isLoading = lookupLoadingIndex === safeIndex;
    const isDeduct = item.isDeduct === true;
    const sign = isDeduct ? -1 : 1;
    const extension = sign * item.quantity * item.msrp;

    return (
      <div key={displayIndex} className={`grid grid-cols-12 text-[9px] border-b border-gray-300 group ${isDeduct ? 'bg-red-50' : ''}`}>
        <div className="col-span-1 border-r border-black px-1 py-px text-center font-bold flex items-center justify-center">
          <input
            type="number"
            value={item.quantity}
            onChange={(e) => updateMaterial(safeIndex, { quantity: clampNonNeg(parseFloat(e.target.value)) })}
            className={`${editableNumberClass} w-12 text-center font-bold ${isDeduct ? 'text-red-600' : ''}`}
            min="0"
            step="1"
          />
          {isCable && <span className="ml-0.5">ft</span>}
        </div>
        <div className={`col-span-5 border-r border-black px-2 py-px uppercase flex items-center ${isDeduct ? 'text-red-600 font-bold' : ''}`}>
          {isDeduct && <span className="text-[8px] bg-red-600 text-white px-1 mr-1 rounded-sm font-black tracking-wider print:bg-red-600">DEDUCT</span>}
          <span className="flex-1">{item.manufacturer} {item.model} {isCable ? '(PER FT)' : ''}</span>
          {/* Lookup MSRP button - hidden on print */}
          <button
            onClick={() => handleLookupMSRP(safeIndex, item.manufacturer, item.model)}
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
        {/* Deduct toggle - hidden on print */}
        <div className="col-span-1 border-r border-black px-1 py-px text-center flex items-center justify-center print:hidden">
          <button
            onClick={() => updateMaterial(safeIndex, { isDeduct: !isDeduct })}
            className={`text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-sm transition-all ${
              isDeduct
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-200 text-gray-500 hover:bg-green-100 hover:text-green-700'
            }`}
            title={isDeduct ? 'Click to change to ADD' : 'Click to change to DEDUCT'}
          >
            {isDeduct ? '−' : '+'}
          </button>
        </div>
        <div className="col-span-1 border-r border-black px-1 py-px text-center text-[8px] text-gray-500 uppercase print:hidden">
          {item.category === 'Equipment' ? 'EQP' : 'MAT'}
        </div>
        <div className={`col-span-2 border-r border-black px-1 py-px text-right font-mono font-bold flex items-center ${isDeduct ? 'text-red-600' : ''}`}>
          <span className="mr-0.5">$</span>
          <input
            type="number"
            value={item.msrp}
            onChange={(e) => updateMaterial(safeIndex, { msrp: round2OnCommit(parseFloat(e.target.value)) })}
            className={`${editableNumberClass} font-mono font-bold ${isDeduct ? 'text-red-600' : ''}`}
            min="0"
            step="0.01"
          />
        </div>
        <div className={`col-span-2 px-2 py-px text-right font-mono font-bold ${isDeduct ? 'text-red-600' : ''}`}>
          {fmtUSD(isDeduct ? -Math.abs(extension) : Math.abs(extension))}
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

      {/* Validation Status Bar */}
      {data.validationResult && (
        <div className="print:hidden">
          <div
            role="button"
            tabIndex={0}
            aria-expanded={showValidationDetails}
            className={`px-4 py-2 flex items-center justify-between cursor-pointer ${data.validationResult.status === 'customer_ready'
              ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white'
              : data.validationResult.status === 'review_recommended'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black'
                : 'bg-gradient-to-r from-red-600 to-red-500 text-white'
              }`}
            onClick={() => setShowValidationDetails(!showValidationDetails)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setShowValidationDetails(!showValidationDetails);
              }
            }}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">
                {data.validationResult.status === 'customer_ready' ? '✅' : data.validationResult.status === 'review_recommended' ? '⚠️' : '🔴'}
              </span>
              <div>
                <span className="font-bold text-sm uppercase tracking-wider">
                  {data.validationResult.status === 'customer_ready'
                    ? 'Customer Ready'
                    : data.validationResult.status === 'review_recommended'
                      ? 'Review Recommended'
                      : 'Manual Review Required'}
                </span>
                <span className="ml-3 font-mono text-xs opacity-90">
                  Confidence: {data.validationResult.overallConfidence}%
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider opacity-75">
                {data.validationResult.warnings?.length ?? 0} warnings · {data.validationResult.qaIssues?.length ?? 0} QA notes
              </span>
              <svg className={`w-4 h-4 transition-transform ${showValidationDetails ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          {showValidationDetails && (
            <div className="bg-gray-900 text-gray-200 p-4 text-[10px] space-y-3 max-h-64 overflow-y-auto">
              {(data.validationResult.autoCorrections?.length ?? 0) > 0 && (
                <div>
                  <h4 className="text-emerald-400 font-bold uppercase tracking-wider mb-1">🔧 Auto-Corrections Applied</h4>
                  {(data.validationResult.autoCorrections ?? []).map((c, i) => <p key={i} className="text-gray-400">• {c}</p>)}
                </div>
              )}
              {(data.validationResult.warnings?.length ?? 0) > 0 && (
                <div>
                  <h4 className="text-amber-400 font-bold uppercase tracking-wider mb-1">⚠️ Code Validation Warnings</h4>
                  {(data.validationResult.warnings ?? []).map((w, i) => (
                    <p key={i} className={`${w.severity === 'error' ? 'text-red-400' : w.severity === 'warning' ? 'text-amber-300' : 'text-gray-500'
                      }`}>• [{w.type}] {w.message}</p>
                  ))}
                </div>
              )}
              {(data.validationResult.pricingValidations ?? []).filter(p => p.source !== 'Verified Product Database').length > 0 && (
                <div>
                  <h4 className="text-blue-400 font-bold uppercase tracking-wider mb-1">💰 Pricing Verifications (Non-DB)</h4>
                  {(data.validationResult.pricingValidations ?? [])
                    .filter(p => p.source !== 'Verified Product Database')
                    .map((p, i) => (
                      <p key={i} className={p.delta > 15 ? 'text-red-400' : 'text-gray-400'}>
                        • {p.manufacturer} {p.model}: ${p.originalMsrp.toFixed(2)} → ${p.validatedMsrp.toFixed(2)} ({p.source}, {p.confidence}% conf, Δ{p.delta}%)
                      </p>
                    ))}
                </div>
              )}
              {(data.validationResult.qaIssues?.length ?? 0) > 0 && (
                <div>
                  <h4 className="text-purple-400 font-bold uppercase tracking-wider mb-1">🔍 QA Audit Notes</h4>
                  {(data.validationResult.qaIssues ?? []).map((issue, i) => <p key={i} className="text-gray-400">• {issue}</p>)}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Header Area */}
      <div className="p-4 pb-2">
        <div className="flex justify-between items-start mb-4">
          {/* Master-Level "3D" Logo - Deeply Embedded */}
          <div className="w-[280px] h-16">
            <Icons.Logo className="w-full h-full" />
          </div>

          <div className="text-[10px] text-right font-bold leading-tight uppercase mt-6 tracking-tighter">
            {office.address.toUpperCase()} - {office.cityState.toUpperCase()}<br />
            Phone: {COMPANY_PHONE} - Fax: {COMPANY_FAX} - Lic.: {COMPANY_LICENSE}
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
          <div className="col-span-6 border-r border-black px-2 py-1">System Components & Implementation Tasks</div>
          <div className="col-span-1 border-r border-black px-2 py-1 text-center print:hidden"></div>
          <div className="col-span-2 border-r border-black px-2 py-1 text-right">Unit Value</div>
          <div className="col-span-2 px-2 py-1 text-right">Extension</div>
        </div>

        {/* Labor Rows */}
        {data.labor.map((task, i) => {
          const isDeduct = task.isDeduct === true;
          const rate = rates[task.rateType as keyof LaborRates] || rates.base;
          const sign = isDeduct ? -1 : 1;
          const extension = sign * task.hours * rate;
          return (
          <div key={i} className={`grid grid-cols-12 text-[9px] border-b border-gray-300 group ${isDeduct ? 'bg-red-50' : ''}`}>
            <div className="col-span-1 border-r border-black px-1 py-px text-center font-black flex items-center justify-center">
              <input
                type="number"
                value={task.hours}
                onChange={(e) => updateLaborTask(i, { hours: clampNonNeg(parseFloat(e.target.value)) })}
                className={`${editableNumberClass} w-10 text-center font-black ${isDeduct ? 'text-red-600' : ''}`}
                min="0"
                step="0.5"
              />
            </div>
            <div className={`col-span-6 border-r border-black px-1 py-px uppercase font-bold flex items-center ${isDeduct ? 'text-red-600' : 'text-gray-800'}`}>
              {isDeduct && <span className="text-[8px] bg-red-600 text-white px-1 mr-1 rounded-sm font-black tracking-wider">DEDUCT</span>}
              <input
                type="text"
                value={task.task}
                onChange={(e) => updateLaborTask(i, { task: e.target.value })}
                className={`${editableTextClass} flex-1 uppercase font-bold ${isDeduct ? 'text-red-600' : 'text-gray-800'}`}
              />
            </div>
            {/* Deduct toggle - hidden on print */}
            <div className="col-span-1 border-r border-black px-1 py-px text-center flex items-center justify-center print:hidden">
              <button
                onClick={() => updateLaborTask(i, { isDeduct: !isDeduct })}
                className={`text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-sm transition-all ${
                  isDeduct
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-200 text-gray-500 hover:bg-green-100 hover:text-green-700'
                }`}
                title={isDeduct ? 'Click to change to ADD' : 'Click to change to DEDUCT'}
              >
                {isDeduct ? '−' : '+'}
              </button>
            </div>
            <div className={`col-span-2 border-r border-black px-2 py-px text-right font-mono font-bold ${isDeduct ? 'text-red-600' : ''}`}>{fmtUSD(rate)}</div>
            <div className={`col-span-2 px-2 py-px text-right font-mono font-black ${isDeduct ? 'text-red-600' : ''}`}>
              {fmtUSD(isDeduct ? -Math.abs(extension) : Math.abs(extension))}
            </div>
          </div>
          );
        })}

        {/* Total Hours Row — uses laborSubtotal from calculateFinancials so it never drifts from the final totals */}
        <div className="grid grid-cols-12 text-[10px] font-black bg-gray-100 border-b-2 border-black">
          <div className="col-span-1 border-r border-black px-2 py-1 text-center font-black text-[11px]">
            {data.labor.reduce((sum, t) => {
              const s = t.isDeduct === true ? -1 : 1;
              const h = Number.isFinite(t.hours) ? t.hours : 0;
              return sum + s * h;
            }, 0).toFixed(2)}
          </div>
          <div className="col-span-7 border-r border-black px-2 py-1 uppercase tracking-wider text-right">Total Labor Hours:</div>
          <div className="col-span-2 border-r border-black px-2 py-1 text-right"></div>
          <div className="col-span-2 px-2 py-1 text-right font-mono font-black">{fmtUSD(laborSubtotal)}</div>
        </div>

        <div className="bg-white">
          <div className="grid grid-cols-12 text-[10px] font-bold border-b border-black">
            <div className="col-span-8 border-r border-black px-2 py-1 uppercase text-right tracking-wider">Labor Markup & Management:</div>
            <div className="col-span-2 border-r border-black px-2 py-1 text-right">15.00%</div>
            <div className="col-span-2 px-2 py-1 text-right font-mono font-bold text-[#008a8a]">{fmtUSD(laborMarkup)}</div>
          </div>
          <div className="grid grid-cols-12 text-[11px] font-black bg-gray-50 border-b-4 border-black">
            <div className="col-span-10 border-r border-black px-2 py-1.5 text-right uppercase italic tracking-[0.2em]">Subtotal Labor Component:</div>
            <div className="col-span-2 px-2 py-1.5 text-right font-mono text-base">{fmtUSD(totalLabor)}</div>
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
          <div className="col-span-5 border-r border-black px-2 py-1">Infrastructure, Hardware & Material Assets</div>
          <div className="col-span-1 border-r border-black px-2 py-1 text-center print:hidden">+/−</div>
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
            <div className="col-span-2 px-2 py-0.5 text-right font-mono font-bold text-[#008a8a]">{fmtUSD(materialMarkup + equipmentMarkup)}</div>
          </div>
          <div className="grid grid-cols-12 text-[9px] border-b border-black font-bold">
            <div className="col-span-8 border-r border-black px-2 py-0.5 text-right uppercase tracking-wider">State & Local Sales Tax ({office.taxJurisdictionLabel}):</div>
            <div className="col-span-2 border-r border-black px-2 py-0.5 text-right">{(office.salesTaxRate * 100).toFixed(3).replace(/\.?0+$/, '')}%</div>
            <div className="col-span-2 px-2 py-0.5 text-right font-mono font-bold text-[#d4af37]">{fmtUSD(salesTax)}</div>
          </div>
          <div className="grid grid-cols-12 text-sm font-black bg-gray-100 py-1 border-b-4 border-black shadow-[inset_0_4px_6px_rgba(0,0,0,0.05)]">
            <div className="col-span-8 text-right px-2 uppercase italic tracking-[0.15em] self-center drop-shadow-sm">Grand Total Service Amount:</div>
            <div className="col-span-4 text-right px-2 self-center font-mono text-base font-black text-black">{fmtUSD(grandTotal)}</div>
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
        <GoldButton
          onClick={() => {
            // Defer print so any pending React state from a final keystroke flushes to the DOM first.
            setTimeout(() => window.print(), 50);
          }}
          className="flex-1 h-16 text-lg shadow-xl tracking-[0.15em] font-black"
        >
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
