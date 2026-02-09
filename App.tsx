
import React, { useState, useEffect } from 'react';
import { AppStatus, LaborRates, ChangeOrderData, ProposalData } from './types';
import { LaborRateModal } from './components/LaborRateModal';
import { COGenerator } from './components/COGenerator';
import { ChangeOrderView } from './components/ChangeOrderView';
import { ProposalView } from './components/ProposalView';
import { generateProposal } from './services/geminiService';
import { calculateFinancials } from './utils/financials';
import { Icons } from './constants';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [rates, setRates] = useState<LaborRates | null>(null);
  const [coData, setCoData] = useState<ChangeOrderData | null>(null);
  const [proposalData, setProposalData] = useState<ProposalData | null>(null);
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);

  useEffect(() => {
    // Force rate entry on load
    if (!rates) {
      setStatus(AppStatus.SETUP);
    }
  }, [rates]);

  const handleSaveRates = (newRates: LaborRates) => {
    setRates(newRates);
    setStatus(AppStatus.IDLE);
  };

  const handleGeneratedResult = (data: ChangeOrderData) => {
    setCoData(data);
    setStatus(AppStatus.RESULT);
  };

  const handleReset = () => {
    setCoData(null);
    setProposalData(null);
    setStatus(AppStatus.IDLE);
  };

  const handleDataChange = (newData: ChangeOrderData) => {
    setCoData(newData);
  };



  const handleGenerateProposal = async () => {
    if (!coData || !rates) return;

    setIsGeneratingProposal(true);
    try {
      const financials = calculateFinancials(coData, rates);
      const proposal = await generateProposal(coData, rates, financials);
      setProposalData(proposal);
      setStatus(AppStatus.PROPOSAL);
    } catch (error) {
      console.error('Error generating proposal:', error);
      alert('Failed to generate proposal. Please try again.');
    } finally {
      setIsGeneratingProposal(false);
    }
  };

  const handleBackToChangeOrder = () => {
    setStatus(AppStatus.RESULT);
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#D4AF37] selection:text-black">
      {/* Rate Intake Modal (Global Lock) */}
      {status === AppStatus.SETUP && <LaborRateModal onSave={handleSaveRates} />}

      {/* Main Layout */}
      <div className="relative z-10">
        {/* Persistent Sticky Header */}
        <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-xl border-b border-gray-900 px-8 py-4 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-6">
            <div className="w-40">
              <Icons.Logo className="w-full h-auto" />
            </div>
            <div className="h-10 w-px bg-gray-800 mx-2 hidden md:block"></div>
            <div className="hidden md:block">
              <h1 className="text-xl font-black uppercase tracking-tighter leading-none italic">Intelligence <span className="gold-gradient">At Work</span></h1>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-[0.4em] mt-1">3DTSI Service Estimator</p>
            </div>
          </div>
          <div className="flex items-center gap-8">
            {rates && (
              <div className="text-right hidden sm:block border-r border-gray-800 pr-8">
                <div className="text-[10px] text-gray-600 uppercase font-black tracking-[0.2em] mb-1">Session Base Rate</div>
                <div className="text-[#D4AF37] font-black text-xl font-mono">${rates.base.toFixed(2)}/hr</div>
              </div>
            )}
            <button
              onClick={() => setStatus(AppStatus.SETUP)}
              className="group flex items-center gap-3 bg-white/5 hover:bg-white/10 px-4 py-2 border border-gray-800 transition-all rounded-sm"
              title="System Configuration"
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-[#D4AF37]">Rates</span>
              <svg className="w-5 h-5 text-gray-500 group-hover:text-[#D4AF37] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </header>

        <main className="container mx-auto px-6 py-16">
          {status === AppStatus.IDLE && (
            <div className="space-y-16 animate-in fade-in zoom-in-95 duration-1000">
              <div className="text-center max-w-3xl mx-auto space-y-6">
                <h2 className="text-5xl md:text-6xl font-serif-elegant font-medium tracking-wide leading-tight">Change Order <span className="gold-gradient italic">Requests</span></h2>
                <div className="h-1.5 w-32 bg-[#D4AF37] mx-auto"></div>
                <p className="text-gray-400 text-lg font-medium leading-relaxed tracking-wide">
                  Submit coordinator intent with attached project collateral. Our multimodal reasoning engine will synthesize a defensible Change Order with deterministic labor units and infrastructure requirements.
                </p>
              </div>
              <COGenerator onResult={handleGeneratedResult} />
            </div>
          )}

          {status === AppStatus.RESULT && coData && rates && (
            <div className="animate-in slide-in-from-bottom-12 duration-700 ease-out">
              <ChangeOrderView
                data={coData}
                rates={rates}
                onReset={handleReset}
                onDataChange={handleDataChange}
                onGenerateProposal={handleGenerateProposal}
                isGeneratingProposal={isGeneratingProposal}
              />
            </div>
          )}

          {status === AppStatus.PROPOSAL && proposalData && coData && (
            <div className="animate-in fade-in slide-in-from-right-12 duration-700 ease-out">
              <ProposalView
                proposal={proposalData}
                coData={coData}
                onBack={handleBackToChangeOrder}
              />
            </div>
          )}
        </main>
      </div>

      {/* Cinematic Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden print:hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,_rgba(212,175,55,0.08)_0%,_transparent_50%)]"></div>
        <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-[#D4AF37]/5 blur-[160px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[1000px] h-[1000px] bg-[#008a8a]/5 blur-[200px] rounded-full"></div>
      </div>
    </div>
  );
};

export default App;
