
import React, { useState } from 'react';
import { LaborRates } from '../types';
import { GoldButton } from './GoldButton';
import { Icons } from '../constants';
import { getCaCounties, getCaBlendedRate, getCaZoneLabel, type WageType } from '../data/prevailingWages';

interface LaborRateModalProps {
  onSave: (rates: LaborRates) => void;
  initialRates?: LaborRates;
}

export const LaborRateModal: React.FC<LaborRateModalProps> = ({ onSave, initialRates }) => {
  const [rates, setRates] = useState<LaborRates>(
    initialRates ?? { base: 165, afterHours: 247.50, emergency: 330 }
  );
  // Track whether the user has manually edited a derived rate. Once they do,
  // the base-rate keystroke handler stops auto-recomputing that field so we
  // don't clobber a custom multiplier (e.g., afterHours = 1.4x not 1.5x).
  const [customAfterHours, setCustomAfterHours] = useState<boolean>(
    !!initialRates && Math.abs(initialRates.afterHours - initialRates.base * 1.5) > 0.01
  );
  const [customEmergency, setCustomEmergency] = useState<boolean>(
    !!initialRates && Math.abs(initialRates.emergency - initialRates.base * 2) > 0.01
  );

  // Prevailing-wage mode (public works). When on, the base rate is computed
  // from the county + wage-type blended IBEW/DIR rate instead of a shop rate.
  const [pwOpen, setPwOpen] = useState(false);
  const [pwCounty, setPwCounty] = useState('Sacramento');
  const [pwType, setPwType] = useState<WageType>('dir');
  const counties = React.useMemo(() => getCaCounties(), []);
  const pwPreview = React.useMemo(() => getCaBlendedRate(pwCounty, pwType), [pwCounty, pwType]);

  const applyPrevailingWage = () => {
    const blended = getCaBlendedRate(pwCounty, pwType);
    if (!blended) { alert('Could not resolve a prevailing wage for that county.'); return; }
    const base = +blended.blended.toFixed(2);
    setRates({
      base,
      afterHours: customAfterHours ? rates.afterHours : +(base * 1.5).toFixed(2),
      emergency: customEmergency ? rates.emergency : +(base * 2).toFixed(2),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!Number.isFinite(rates.base) || rates.base <= 0) {
      alert('Base rate must be a positive number.');
      return;
    }
    if (!Number.isFinite(rates.afterHours) || rates.afterHours <= 0) {
      alert('After-hours rate must be a positive number.');
      return;
    }
    if (!Number.isFinite(rates.emergency) || rates.emergency <= 0) {
      alert('Emergency rate must be a positive number.');
      return;
    }
    onSave(rates);
  };

  // Esc key closes any focused input gracefully — but the modal is required-on-load.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') (document.activeElement as HTMLElement | null)?.blur();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-md p-4" role="dialog" aria-modal="true" aria-labelledby="rate-modal-title">
      <div className="w-full max-w-xl bg-white border-4 border-[#008b8b] p-12 shadow-[0_0_100px_rgba(0,139,139,0.25)] relative overflow-hidden">
        {/* Subtle Background Mark */}
        <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none">
          <Icons.Logo className="w-96 h-96" />
        </div>

        <div className="flex flex-col items-center mb-10 relative">
          <div className="w-64">
            <Icons.Logo className="w-full h-auto" />
          </div>
          <h2 id="rate-modal-title" className="mt-6 text-3xl font-black bg-gradient-to-r from-[#008b8b] to-[#20b2aa] bg-clip-text text-transparent text-center uppercase tracking-tighter italic">System Initialization</h2>
          <p className="text-[#008a8a] text-xs mt-3 text-center uppercase font-bold tracking-[0.5em] animate-pulse">Labor Rate Deterministic Intake</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 relative">
          <div className="group">
            <label className="block text-[10px] font-black text-[#008b8b] uppercase mb-2 tracking-[0.3em] transition-colors group-focus-within:text-black">Base Hourly Rate ($)</label>
            <input
              type="number"
              required
              className="w-full bg-gray-50 border-2 border-gray-800 text-black p-4 focus:border-[#008b8b] outline-none transition-all text-xl font-mono"
              value={rates.base}
              onChange={(e) => {
                const base = parseFloat(e.target.value) || 0;
                setRates(prev => ({
                  base,
                  // Preserve manually-edited derived fields. Default 1.5x/2x
                  // multipliers only apply when the user hasn't customized them.
                  afterHours: customAfterHours ? prev.afterHours : base * 1.5,
                  emergency: customEmergency ? prev.emergency : base * 2,
                }));
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-600 uppercase mb-2 tracking-widest">
                After-Hours {customAfterHours ? '(custom)' : '(1.5x)'}
              </label>
              <input
                type="number"
                required
                className="w-full bg-white border border-gray-800 text-gray-700 p-3 focus:border-[#008b8b] outline-none transition-colors font-mono"
                value={rates.afterHours}
                onChange={(e) => {
                  setCustomAfterHours(true);
                  setRates({ ...rates, afterHours: parseFloat(e.target.value) || 0 });
                }}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-600 uppercase mb-2 tracking-widest">
                Emergency {customEmergency ? '(custom)' : '(2.0x)'}
              </label>
              <input
                type="number"
                required
                className="w-full bg-white border border-gray-800 text-gray-700 p-3 focus:border-[#008b8b] outline-none transition-colors font-mono"
                value={rates.emergency}
                onChange={(e) => {
                  setCustomEmergency(true);
                  setRates({ ...rates, emergency: parseFloat(e.target.value) || 0 });
                }}
              />
            </div>
          </div>

          {/* Prevailing wage (public works) — derives the base rate from the
              county's IBEW/DIR blended rate instead of a flat shop rate. */}
          <div className="border border-gray-800 bg-white/5">
            <button
              type="button"
              onClick={() => setPwOpen(o => !o)}
              className="w-full flex items-center justify-between px-4 py-3 text-left"
            >
              <span className="text-[10px] font-black text-[#008b8b] uppercase tracking-[0.3em]">
                ⚖ Prevailing wage (public works)
              </span>
              <span className="text-gray-600 text-xs">{pwOpen ? '▲' : '▼'}</span>
            </button>
            {pwOpen && (
              <div className="px-4 pb-4 space-y-3">
                <p className="text-[10px] text-gray-600 leading-relaxed">
                  For California public-works jobs, labor must be billed at the prevailing wage for the county.
                  Pick the county and determination; the base rate is set from the blended IBEW crew rate
                  (60% installer · 25% tech · 10% foreman · 5% apprentice).
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1 tracking-widest">County</label>
                    <select
                      value={pwCounty}
                      onChange={(e) => setPwCounty(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-800 text-black p-2 text-sm focus:border-[#008b8b] outline-none"
                    >
                      {counties.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1 tracking-widest">Determination</label>
                    <select
                      value={pwType}
                      onChange={(e) => setPwType(e.target.value as WageType)}
                      className="w-full bg-gray-50 border border-gray-800 text-black p-2 text-sm focus:border-[#008b8b] outline-none"
                    >
                      <option value="dir">CA DIR (state)</option>
                      <option value="davis-bacon">Davis-Bacon (federal)</option>
                      <option value="pla">PLA (DIR + 8%)</option>
                    </select>
                  </div>
                </div>
                {pwPreview && (
                  <div className="text-[11px] text-gray-700 bg-white/40 border border-gray-800 p-2 font-mono">
                    <div className="text-[#008b8b] font-bold">{getCaZoneLabel(pwCounty)}</div>
                    Blended ${pwPreview.blended.toFixed(2)}/hr
                    <span className="text-gray-600"> (installer ${pwPreview.installer.toFixed(2)} · tech ${pwPreview.tech.toFixed(2)} · foreman ${pwPreview.foreman.toFixed(2)})</span>
                    {pwPreview.fallback && <div className="text-amber-600">⚠ County not directly mapped — using nearest zone; verify against published DIR rates.</div>}
                  </div>
                )}
                <button
                  type="button"
                  onClick={applyPrevailingWage}
                  className="w-full bg-[#008b8b] hover:bg-[#20b2aa] text-black text-xs font-black uppercase tracking-widest py-2 transition-all"
                >
                  Apply prevailing wage to base rate
                </button>
              </div>
            )}
          </div>

          <GoldButton type="submit" className="w-full h-16 text-xl font-black tracking-widest shadow-2xl">
            INITIALIZE ESTIMATING ENGINE
          </GoldButton>
        </form>

        <div className="mt-10 pt-8 border-t border-gray-900">
          <p className="text-[10px] text-gray-600 text-center leading-relaxed uppercase font-bold tracking-widest">
            3DTSI PROPRIETARY ENGINEERING INTELLIGENCE SYSTEM.<br />
            UNAUTHORIZED ACCESS TO PRICING TABLES IS STRICTLY PROHIBITED.
          </p>
        </div>
      </div>
    </div>
  );
};
