
import React, { useState, useEffect, useRef } from 'react';
import { AppStatus, LaborRates, ChangeOrderData, ProposalData } from './types';
import { LaborRateModal } from './components/LaborRateModal';
import { COGenerator } from './components/COGenerator';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SetupBanner } from './components/SetupBanner';
import { ChangeOrderView } from './components/ChangeOrderView';
import { ProposalView } from './components/ProposalView';
import { HistoryModal } from './components/HistoryModal';
import { generateProposal } from './services/geminiService';
import { describeAiError } from './services/geminiClient';
import { calculateFinancials } from './utils/financials';
import { Icons, getOffice } from './constants';
import {
  saveDraft, loadDraft, clearDraft,
  saveRates as persistRates, loadRates,
  saveToHistory, onWriteFailure, onDraftFromOtherTab,
} from './utils/persistence';
import * as cloudSync from './utils/cloudSync';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [rates, setRates] = useState<LaborRates | null>(null);
  const [coData, setCoData] = useState<ChangeOrderData | null>(null);
  const [proposalData, setProposalData] = useState<ProposalData | null>(null);
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);
  const [draftPrompt, setDraftPrompt] = useState<{ found: true } | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [savedCoId, setSavedCoId] = useState<string | null>(null);
  const [syncState, setSyncState] = useState<cloudSync.SyncStatus>('idle');
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const [otherTabWarning, setOtherTabWarning] = useState<boolean>(false);
  const draftSaveTimer = useRef<number | null>(null);

  // ── On mount: kick off cloud sync (pulls remote state into localStorage) ───
  useEffect(() => {
    void cloudSync.init();
    const unsub = cloudSync.subscribe(s => setSyncState(s.status));
    return unsub;
  }, []);

  // ── Surface localStorage write failures (especially quota-exceeded) ────────
  // Without this, an operator could be saving a draft for an hour into a full
  // localStorage and never know — refresh = lost work.
  useEffect(() => {
    return onWriteFailure(({ key, quotaExceeded }) => {
      if (quotaExceeded) {
        setStorageWarning(`Browser storage is full. Your most recent change to "${key}" was NOT saved. Clear old change orders from History (or close other tabs) to free up space, then re-save.`);
      } else {
        setStorageWarning(`Browser storage write failed for "${key}". Your most recent change may not have been saved. If this persists, try refreshing or check browser permissions.`);
      }
    });
  }, []);

  // ── Multi-tab draft awareness ──────────────────────────────────────────────
  // If another tab saves the draft while this tab has unsaved edits, alert
  // the operator so they don't accidentally overwrite the other tab's work.
  useEffect(() => {
    return onDraftFromOtherTab(() => setOtherTabWarning(true));
  }, []);

  // ── On mount: try to restore labor rates and check for saved draft ────────
  useEffect(() => {
    const persistedRates = loadRates();
    if (persistedRates) {
      setRates(persistedRates);
    } else {
      setStatus(AppStatus.SETUP);
    }
    const draft = loadDraft();
    if (draft) {
      setDraftPrompt({ found: true });
    }

    // Defense-in-depth: if a tab was open during a deploy and any future
    // dynamic import (or other module fetch) fails because the chunk no
    // longer exists, auto-reload once to pick up the fresh index.html.
    // Guarded with sessionStorage so we don't loop if reload doesn't help.
    const onChunkLoadError = (event: PromiseRejectionEvent | ErrorEvent) => {
      const msg = (event instanceof ErrorEvent ? event.message : String((event as PromiseRejectionEvent).reason)) || '';
      const looksLikeStaleChunk = /Failed to fetch dynamically imported module|Loading chunk \d+ failed|Importing a module script failed|Expected a JavaScript-or-Wasm module script/i.test(msg);
      if (!looksLikeStaleChunk) return;
      const reloadKey = 'co_chunk_reload_attempted';
      if (sessionStorage.getItem(reloadKey)) return; // already tried once this session
      sessionStorage.setItem(reloadKey, String(Date.now()));
      console.warn('[App] Detected stale chunk error — reloading to pick up the latest deploy.');
      window.location.reload();
    };
    window.addEventListener('error', onChunkLoadError);
    window.addEventListener('unhandledrejection', onChunkLoadError);
    return () => {
      window.removeEventListener('error', onChunkLoadError);
      window.removeEventListener('unhandledrejection', onChunkLoadError);
    };
    // Run only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Debounced auto-save of in-progress CO ─────────────────────────────────
  useEffect(() => {
    if (!coData) return;
    if (draftSaveTimer.current) {
      window.clearTimeout(draftSaveTimer.current);
    }
    draftSaveTimer.current = window.setTimeout(() => {
      saveDraft({
        coData,
        stage: status === AppStatus.PROPOSAL ? 'proposal' : 'review',
      });
    }, 1500);
    return () => {
      if (draftSaveTimer.current) {
        window.clearTimeout(draftSaveTimer.current);
        draftSaveTimer.current = null;
      }
    };
  }, [coData, status]);

  const handleSaveRates = (newRates: LaborRates) => {
    setRates(newRates);
    persistRates(newRates);
    setStatus(AppStatus.IDLE);
  };

  const handleGeneratedResult = (data: ChangeOrderData) => {
    setCoData(data);
    setStatus(AppStatus.RESULT);
    setSavedCoId(null);
  };

  const handleReset = () => {
    if (coData && !window.confirm('Discard the current change order and start a new intake? This cannot be undone.')) {
      return;
    }
    setCoData(null);
    setProposalData(null);
    setSavedCoId(null);
    setStatus(AppStatus.IDLE);
    clearDraft();
  };

  const handleDataChange = (newData: ChangeOrderData) => {
    setCoData(newData);
  };

  const handleRestoreDraft = () => {
    const draft = loadDraft();
    if (!draft) {
      setDraftPrompt(null);
      return;
    }
    setCoData(draft.coData);
    // Always restore to RESULT (the editing surface) — proposal stage requires
    // a freshly-generated proposalData object, which is not part of the draft.
    // The user can re-trigger "Generate Proposal" from RESULT once restored.
    setStatus(AppStatus.RESULT);
    setDraftPrompt(null);
  };

  const handleDismissDraft = () => {
    clearDraft();
    setDraftPrompt(null);
  };

  // Save snapshot to history (called on print or when explicitly archived)
  const handleSnapshotToHistory = () => {
    if (!coData || !rates || savedCoId) return;
    const office = getOffice(coData.officeId);
    const financials = calculateFinancials(coData, rates, office.salesTaxRate);
    const entry = saveToHistory(coData, financials.grandTotal);
    setSavedCoId(entry.id);
  };

  const handleGenerateProposal = async () => {
    if (!coData || !rates) return;

    setIsGeneratingProposal(true);
    try {
      const office = getOffice(coData.officeId);
      const financials = calculateFinancials(coData, rates, office.salesTaxRate);
      const proposal = await generateProposal(coData, rates, financials);
      setProposalData(proposal);
      setStatus(AppStatus.PROPOSAL);
    } catch (error) {
      console.error('Error generating proposal:', error);
      alert(`Failed to generate proposal: ${describeAiError(error)}`);
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
      {status === AppStatus.SETUP && <LaborRateModal onSave={handleSaveRates} initialRates={rates ?? undefined} />}

      {/* Main Layout */}
      <div className="relative z-10">
        {/* Persistent Sticky Header */}
        <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-xl border-b border-gray-900 px-4 md:px-8 py-3 md:py-4 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-3 md:gap-6 min-w-0">
            <div className="w-24 md:w-40 shrink-0">
              <Icons.Logo className="w-full h-auto" />
            </div>
            <div className="h-10 w-px bg-gray-800 mx-2 hidden md:block"></div>
            <div className="hidden md:block">
              <h1 className="text-xl font-black uppercase tracking-tighter leading-none italic">Intelligence <span className="gold-gradient">At Work</span></h1>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-[0.4em] mt-1">3DTSI Service Estimator</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Cloud sync status — small dot, click for details. Hidden when "idle" to avoid noise. */}
            {syncState !== 'idle' && (
              <div
                className="hidden md:flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-bold"
                title={
                  syncState === 'pulling' ? 'Syncing from cloud…'
                  : syncState === 'pushing' ? 'Saving to cloud…'
                  : syncState === 'offline' ? 'Offline — changes saved locally, will sync when online'
                  : syncState === 'disabled' ? 'Cloud sync not configured (single-device mode)'
                  : syncState === 'error' ? 'Cloud sync error — see console'
                  : ''
                }
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    syncState === 'pulling' || syncState === 'pushing' ? 'bg-amber-400 animate-pulse'
                    : syncState === 'offline' ? 'bg-gray-500'
                    : syncState === 'disabled' ? 'bg-gray-600'
                    : 'bg-red-500'
                  }`}
                />
                <span className="text-gray-500">
                  {syncState === 'pulling' ? 'syncing' : syncState === 'pushing' ? 'saving' : syncState === 'offline' ? 'offline' : syncState === 'disabled' ? 'local' : 'sync err'}
                </span>
              </div>
            )}
            {rates && (
              <div className="text-right hidden sm:block border-r border-gray-800 pr-6">
                <div className="text-[10px] text-gray-600 uppercase font-black tracking-[0.2em] mb-1">Session Base Rate</div>
                <div className="text-[#D4AF37] font-black text-xl font-mono">${rates.base.toFixed(2)}/hr</div>
              </div>
            )}
            <button
              onClick={() => setHistoryOpen(true)}
              className="group flex items-center gap-2 bg-white/5 hover:bg-white/10 px-2 md:px-4 py-2 border border-gray-800 transition-all rounded-sm"
              title="Change Order History & Win Rate"
            >
              <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-[#D4AF37]">History</span>
              <svg className="w-5 h-5 text-gray-500 group-hover:text-[#D4AF37] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </button>
            <button
              onClick={() => setStatus(AppStatus.SETUP)}
              className="group flex items-center gap-2 bg-white/5 hover:bg-white/10 px-2 md:px-4 py-2 border border-gray-800 transition-all rounded-sm"
              title="Labor Rates"
            >
              <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest text-gray-500 group-hover:text-[#D4AF37]">Rates</span>
              <svg className="w-5 h-5 text-gray-500 group-hover:text-[#D4AF37] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </header>

        <main className="container mx-auto px-3 md:px-6 py-6 md:py-16">
          {/* Multi-tab draft conflict warning */}
          {otherTabWarning && (
            <div className="mb-6 max-w-3xl mx-auto bg-amber-950/40 border-2 border-amber-500 text-amber-100 p-4 rounded-sm flex items-start justify-between gap-4 print:hidden" role="alert">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest text-amber-300">Another tab updated this draft</p>
                  <p className="text-xs text-amber-200 mt-1 leading-relaxed">
                    Another tab saved a newer version of the draft. Saving from THIS tab will overwrite that work. Refresh to load the latest, or continue and overwrite.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOtherTabWarning(false)}
                className="text-[10px] uppercase tracking-widest text-amber-300 hover:text-white shrink-0"
                aria-label="Dismiss tab conflict warning"
              >
                Dismiss ×
              </button>
            </div>
          )}
          {/* Storage write-failure banner — quota exceeded or storage disabled */}
          {storageWarning && (
            <div className="mb-6 max-w-3xl mx-auto bg-red-950/40 border-2 border-red-500 text-red-100 p-4 rounded-sm flex items-start justify-between gap-4 print:hidden" role="alert">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest text-red-300">Storage write failed</p>
                  <p className="text-xs text-red-200 mt-1 leading-relaxed">{storageWarning}</p>
                </div>
              </div>
              <button
                onClick={() => setStorageWarning(null)}
                className="text-[10px] uppercase tracking-widest text-red-300 hover:text-white shrink-0"
                aria-label="Dismiss storage warning"
              >
                Dismiss ×
              </button>
            </div>
          )}
          {/* Draft restore banner */}
          {draftPrompt && (
            <div className="mb-8 max-w-3xl mx-auto bg-[#D4AF37]/10 border border-[#D4AF37]/40 rounded-sm p-4 flex items-center justify-between gap-4 print:hidden">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-[#D4AF37] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-bold text-[#D4AF37] uppercase tracking-widest">Unsaved draft found</p>
                  <p className="text-xs text-gray-400">A change order was in progress when you last closed the tab. Restore it?</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleRestoreDraft}
                  className="bg-[#D4AF37] hover:bg-[#FFD700] text-black px-4 py-2 text-xs font-black uppercase tracking-widest transition-all"
                >
                  Restore
                </button>
                <button
                  onClick={handleDismissDraft}
                  className="bg-white/5 hover:bg-white/10 border border-gray-800 text-gray-400 px-4 py-2 text-xs font-black uppercase tracking-widest transition-all"
                >
                  Discard
                </button>
              </div>
            </div>
          )}

          {status === AppStatus.IDLE && (
            <div className="space-y-10 md:space-y-16 animate-in fade-in zoom-in-95 duration-1000">
              <SetupBanner />
              <div className="text-center max-w-3xl mx-auto space-y-6">
                <h2 className="text-3xl md:text-6xl font-serif-elegant font-medium tracking-wide leading-tight">Change Order <span className="gold-gradient italic">Requests</span></h2>
                <div className="h-1.5 w-32 bg-[#D4AF37] mx-auto"></div>
                <p className="hidden md:block text-gray-400 text-lg font-medium leading-relaxed tracking-wide">
                  Submit coordinator intent with attached project collateral. Our multimodal reasoning engine will synthesize a defensible Change Order with deterministic labor units and infrastructure requirements.
                </p>
              </div>
              <ErrorBoundary fallbackTitle="Intake form failed">
                <COGenerator onResult={handleGeneratedResult} />
              </ErrorBoundary>
            </div>
          )}

          {status === AppStatus.RESULT && coData && rates && (
            <div className="animate-in slide-in-from-bottom-12 duration-700 ease-out">
              <ErrorBoundary fallbackTitle="Change order view failed">
                <ChangeOrderView
                  data={coData}
                  rates={rates}
                  onReset={handleReset}
                  onDataChange={handleDataChange}
                  onGenerateProposal={handleGenerateProposal}
                  isGeneratingProposal={isGeneratingProposal}
                  onArchive={handleSnapshotToHistory}
                  archivedId={savedCoId}
                />
              </ErrorBoundary>
            </div>
          )}

          {status === AppStatus.PROPOSAL && proposalData && coData && (
            <div className="animate-in fade-in slide-in-from-right-12 duration-700 ease-out">
              <ErrorBoundary fallbackTitle="Proposal view failed">
                <ProposalView
                  proposal={proposalData}
                  coData={coData}
                  onBack={handleBackToChangeOrder}
                />
              </ErrorBoundary>
            </div>
          )}
        </main>
      </div>

      {/* History modal */}
      {historyOpen && (
        <HistoryModal onClose={() => setHistoryOpen(false)} />
      )}

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
