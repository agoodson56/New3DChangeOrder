
import React, { useState } from 'react';
import { LaborRates } from '../types';
import { GoldButton } from './GoldButton';
import { Icons } from '../constants';

interface LaborRateModalProps {
  onSave: (rates: LaborRates) => void;
}

export const LaborRateModal: React.FC<LaborRateModalProps> = ({ onSave }) => {
  const [rates, setRates] = useState<LaborRates>({
    base: 165,
    afterHours: 247.50,
    emergency: 330
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(rates);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
      <div className="w-full max-w-xl bg-black border-4 border-[#D4AF37] p-12 shadow-[0_0_100px_rgba(212,175,55,0.25)] relative overflow-hidden">
        {/* Subtle Background Mark */}
        <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none">
          <Icons.Logo className="w-96 h-96" />
        </div>

        <div className="flex flex-col items-center mb-10 relative">
          <div className="w-64">
            <Icons.Logo className="w-full h-auto" />
          </div>
          <h2 className="mt-6 text-3xl font-black gold-gradient text-center uppercase tracking-tighter italic">System Initialization</h2>
          <p className="text-[#008a8a] text-xs mt-3 text-center uppercase font-bold tracking-[0.5em] animate-pulse">Labor Rate Deterministic Intake</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 relative">
          <div className="group">
            <label className="block text-[10px] font-black text-[#D4AF37] uppercase mb-2 tracking-[0.3em] transition-colors group-focus-within:text-white">Base Hourly Rate ($)</label>
            <input
              type="number"
              required
              className="w-full bg-[#0a0a0a] border-2 border-gray-800 text-white p-4 focus:border-[#D4AF37] outline-none transition-all text-xl font-mono"
              value={rates.base}
              onChange={(e) => {
                const base = parseFloat(e.target.value);
                setRates({ 
                  base, 
                  afterHours: base * 1.5, 
                  emergency: base * 2 
                });
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">After-Hours (1.5x)</label>
              <input
                type="number"
                required
                className="w-full bg-black border border-gray-800 text-gray-400 p-3 focus:border-[#D4AF37] outline-none transition-colors font-mono"
                value={rates.afterHours}
                onChange={(e) => setRates({ ...rates, afterHours: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">Emergency (2.0x)</label>
              <input
                type="number"
                required
                className="w-full bg-black border border-gray-800 text-gray-400 p-3 focus:border-[#D4AF37] outline-none transition-colors font-mono"
                value={rates.emergency}
                onChange={(e) => setRates({ ...rates, emergency: parseFloat(e.target.value) })}
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
