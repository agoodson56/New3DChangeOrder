
import React, { useState } from 'react';
import { LaborRates } from '../types';
import { GoldButton } from './GoldButton';
import { Icons } from '../constants';

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
            <label className="block text-[10px] font-black text-[#008b8b] uppercase mb-2 tracking-[0.3em] transition-colors group-focus-within:text-white">Base Hourly Rate ($)</label>
            <input
              type="number"
              required
              className="w-full bg-gray-50 border-2 border-gray-800 text-white p-4 focus:border-[#008b8b] outline-none transition-all text-xl font-mono"
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
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">
                After-Hours {customAfterHours ? '(custom)' : '(1.5x)'}
              </label>
              <input
                type="number"
                required
                className="w-full bg-white border border-gray-800 text-gray-400 p-3 focus:border-[#008b8b] outline-none transition-colors font-mono"
                value={rates.afterHours}
                onChange={(e) => {
                  setCustomAfterHours(true);
                  setRates({ ...rates, afterHours: parseFloat(e.target.value) || 0 });
                }}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">
                Emergency {customEmergency ? '(custom)' : '(2.0x)'}
              </label>
              <input
                type="number"
                required
                className="w-full bg-white border border-gray-800 text-gray-400 p-3 focus:border-[#008b8b] outline-none transition-colors font-mono"
                value={rates.emergency}
                onChange={(e) => {
                  setCustomEmergency(true);
                  setRates({ ...rates, emergency: parseFloat(e.target.value) || 0 });
                }}
              />
            </div>
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
