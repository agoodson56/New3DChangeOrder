
import React, { useState, useRef, useMemo } from 'react';
import { GoldButton } from './GoldButton';
import { generateValidatedChangeOrder } from '../services/geminiService';
import { describeAiError } from '../services/geminiClient';
import { ChangeOrderData } from '../types';
import { OFFICES, DEFAULT_OFFICE_ID } from '../constants';
import { loadRecentCustomers, rememberCustomer, type SavedCustomer, loadTemplates, deleteTemplate, touchTemplate, type SavedTemplate } from '../utils/persistence';
import { intakeFile, LIMITS, type Attachment } from '../utils/attachments';

interface COGeneratorProps {
  onResult: (data: ChangeOrderData) => void;
}

export const COGenerator: React.FC<COGeneratorProps> = ({ onResult }) => {
  const [intent, setIntent] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [attachmentBusy, setAttachmentBusy] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [pipelineStatus, setPipelineStatus] = useState('');
  const [pipelinePercent, setPipelinePercent] = useState(0);
  const [intentError, setIntentError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Administrative Fields
  const [adminData, setAdminData] = useState({
    customer: '',
    contact: '',
    projectName: '',
    address: '',
    phone: '',
    projectNumber: '53160',
    rfiNumber: '',
    pcoNumber: '',
    officeId: DEFAULT_OFFICE_ID
  });

  // Customer autocomplete: lazy-loaded list, filtered by current input
  const [customerFocused, setCustomerFocused] = useState(false);
  const recentCustomers = useMemo<SavedCustomer[]>(() => loadRecentCustomers(20), [customerFocused]);

  // Templates — re-read on demand so newly-saved templates appear without remount.
  const [templatesVersion, setTemplatesVersion] = useState(0);
  const templates = useMemo<SavedTemplate[]>(() => loadTemplates(), [templatesVersion]);

  const handleApplyTemplate = (tpl: SavedTemplate) => {
    if (!window.confirm(`Apply template "${tpl.name}"?\n\nThis fills the materials, labor, and scope from the template, then takes you straight to the change order view. Customer fields you've entered will be preserved.\n\nThe AI estimator step is skipped — pricing is what was saved with the template. Use the per-line MSRP lookup buttons to refresh prices.`)) {
      return;
    }
    touchTemplate(tpl.id);
    setTemplatesVersion(v => v + 1);
    // Compose: template's scope/materials/labor + the user's customer/admin data.
    const merged: ChangeOrderData = {
      ...tpl.coData,
      customer: adminData.customer,
      contact: adminData.contact,
      projectName: adminData.projectName,
      address: adminData.address,
      phone: adminData.phone,
      projectNumber: adminData.projectNumber,
      rfiNumber: adminData.rfiNumber,
      pcoNumber: adminData.pcoNumber,
      officeId: adminData.officeId,
    };
    rememberCustomer(adminData);
    onResult(merged);
  };

  const handleDeleteTemplate = (tpl: SavedTemplate) => {
    if (!window.confirm(`Delete template "${tpl.name}"? This cannot be undone.`)) return;
    deleteTemplate(tpl.id);
    setTemplatesVersion(v => v + 1);
  };
  const customerSuggestions = useMemo(() => {
    const q = adminData.customer.trim().toLowerCase();
    if (!q) return recentCustomers.slice(0, 8);
    return recentCustomers
      .filter(c => c.customer.toLowerCase().includes(q))
      .slice(0, 8);
  }, [adminData.customer, recentCustomers]);

  const handleAdminChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAdminData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePickCustomer = (customer: SavedCustomer) => {
    setAdminData(prev => ({
      ...prev,
      customer: customer.customer,
      contact: customer.contact || prev.contact,
      address: customer.address || prev.address,
      phone: customer.phone || prev.phone,
      projectName: customer.projectName || prev.projectName,
      officeId: customer.officeId || prev.officeId,
    }));
    setCustomerFocused(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setAttachmentBusy(true);
    try {
      const errors: string[] = [];
      // Process serially. DOCX/XLSX text extraction lazy-loads parser libraries
      // — running them in parallel would race the dynamic import.
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file) continue;
        // Cap on total attachment count (mirrors server-side and AI-context limits).
        // Read the latest count from setState callback to handle batched uploads.
        let stop = false;
        await new Promise<void>(resolve => {
          setAttachments(prev => {
            if (prev.length >= LIMITS.maxFiles) {
              errors.push(`Skipped "${file.name}": already at max ${LIMITS.maxFiles} files.`);
              stop = true;
            }
            resolve();
            return prev;
          });
        });
        if (stop) continue;
        const result = await intakeFile(file);
        if (!result.ok) {
          errors.push(result.reason);
          continue;
        }
        setAttachments(prev => prev.length >= LIMITS.maxFiles ? prev : [...prev, result.attachment]);
      }
      if (errors.length > 0) {
        alert(errors.join('\n\n'));
      }
    } finally {
      setAttachmentBusy(false);
      // Reset input so the same file can be re-selected if removed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (loading) return; // guard against double-submit
    const trimmed = intent.trim();
    if (!trimmed) {
      setIntentError('Please describe the work before generating.');
      return;
    }
    setIntentError(null);
    setLoading(true);
    setPipelineStatus('🧠 Initializing 3-Brain Pipeline...');
    setPipelinePercent(5);
    try {
      const result = await generateValidatedChangeOrder(
        trimmed,
        attachments,
        adminData,
        (stage, percent) => {
          setPipelineStatus(stage);
          setPipelinePercent(percent);
        }
      );
      // Remember this customer for future auto-fill (only if generation succeeded)
      if (adminData.customer.trim()) {
        rememberCustomer(adminData);
      }
      onResult(result);
    } catch (error) {
      console.error(error);
      alert(`Error generating Change Order: ${describeAiError(error)}`);
    } finally {
      setLoading(false);
      setPipelineStatus('');
      setPipelinePercent(0);
    }
  };

  const inputClasses = "w-full bg-gray-50 border border-gray-800 text-white p-2.5 focus:border-[#008b8b] outline-none transition-all text-sm placeholder-gray-700";
  const labelClasses = "block text-[10px] font-bold text-[#008b8b] uppercase tracking-widest mb-1.5";

  return (
    <div className="w-full max-w-4xl mx-auto space-y-10">
      {/* Templates — saved scopes for fast reuse on repetitive jobs */}
      {templates.length > 0 && (
        <div className="p-6 bg-white/5 border border-gray-900 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-black text-[#008b8b] uppercase tracking-[0.3em]">Start from a saved scope</h3>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">{templates.length} template{templates.length === 1 ? '' : 's'}</span>
          </div>
          <p className="text-[10px] text-gray-500 mb-3 leading-relaxed">
            Skip the AI estimator and start from a known-good scope. Customer info you've entered above is preserved. Pricing is what was saved — use the per-line MSRP lookup on the next screen if a template is more than a couple months old.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {templates.slice(0, 8).map(tpl => (
              <div
                key={tpl.id}
                className="group flex items-center justify-between bg-white/40 border border-gray-800 hover:border-[#008b8b]/60 p-3 transition-all"
              >
                <button
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  className="flex-1 text-left"
                >
                  <div className="text-sm font-bold text-white truncate">{tpl.name}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">
                    {tpl.coData.materials?.length || 0} materials · {tpl.coData.labor?.length || 0} labor tasks
                    {tpl.useCount > 0 ? ` · used ${tpl.useCount}×` : ''}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteTemplate(tpl)}
                  className="ml-2 opacity-0 group-hover:opacity-70 hover:opacity-100 text-red-400 text-xs transition-opacity"
                  title="Delete template"
                  aria-label={`Delete template ${tpl.name}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Administrative Intake Section */}
      <div className="p-6 bg-white/5 border border-gray-900 shadow-xl space-y-6">
        <h3 className="text-xs font-black text-[#008b8b] uppercase tracking-[0.3em] border-b border-gray-800 pb-2">Administrative Intake</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div className="space-y-4">
            <div className="relative">
              <label className={labelClasses}>Customer Name</label>
              <input
                name="customer"
                value={adminData.customer}
                onChange={handleAdminChange}
                onFocus={() => setCustomerFocused(true)}
                onBlur={() => setTimeout(() => setCustomerFocused(false), 150)}
                className={inputClasses}
                placeholder="e.g. Warehouse Client"
                autoComplete="off"
              />
              {customerFocused && customerSuggestions.length > 0 && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-gray-50 border border-[#008b8b]/40 shadow-2xl max-h-64 overflow-y-auto">
                  <div className="text-[8px] text-gray-500 uppercase font-bold tracking-widest px-3 py-1.5 border-b border-gray-900">
                    Recent customers — click to autofill
                  </div>
                  {customerSuggestions.map(c => (
                    <button
                      key={c.customer}
                      type="button"
                      onMouseDown={() => handlePickCustomer(c)}
                      className="w-full text-left px-3 py-2 hover:bg-[#008b8b]/10 transition-colors border-b border-gray-900 last:border-b-0"
                    >
                      <div className="text-sm text-white font-bold truncate">{c.customer}</div>
                      <div className="text-[10px] text-gray-500 truncate">
                        {c.contact && <span>{c.contact} · </span>}
                        {c.address || 'no address'}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className={labelClasses}>Contact Person</label>
              <input name="contact" value={adminData.contact} onChange={handleAdminChange} className={inputClasses} placeholder="e.g. John Doe" />
            </div>
            <div>
              <label className={labelClasses}>Project Name</label>
              <input name="projectName" value={adminData.projectName} onChange={handleAdminChange} className={inputClasses} placeholder="Warehouse Infrastructure Expansion" />
            </div>
            <div>
              <label className={labelClasses}>Site Address</label>
              <input name="address" value={adminData.address} onChange={handleAdminChange} className={inputClasses} placeholder="123 Industrial Way, Rancho Cordova, CA" />
            </div>
            <div>
              <label className={labelClasses}>Phone</label>
              <input name="phone" value={adminData.phone} onChange={handleAdminChange} className={inputClasses} placeholder="(916) 555-0199" />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className={labelClasses}>Issuing Office</label>
              <select
                name="officeId"
                value={adminData.officeId}
                onChange={handleAdminChange}
                className={inputClasses}
              >
                {OFFICES.map(office => (
                  <option key={office.id} value={office.id}>
                    {office.name} — {office.address}, {office.cityState}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClasses}>3DTSI Project #</label>
              <input name="projectNumber" value={adminData.projectNumber} onChange={handleAdminChange} className={inputClasses} placeholder="53160" />
            </div>
            <div>
              <label className={labelClasses}>RFI #</label>
              <input name="rfiNumber" value={adminData.rfiNumber} onChange={handleAdminChange} className={inputClasses} placeholder="-" />
            </div>
            <div>
              <label className={labelClasses}>PCO #</label>
              <input name="pcoNumber" value={adminData.pcoNumber} onChange={handleAdminChange} className={inputClasses} placeholder="-" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-bold text-[#008b8b] uppercase tracking-widest">
            Coordinator Intent Description
          </label>
          <button
            type="button"
            onClick={() => {
              // Toggle: if already listening, stop and reset
              if (isListening && recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch { /* ignore */ }
                return;
              }
              const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
              if (!SpeechRecognition) {
                alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
                return;
              }

              const recognition = new SpeechRecognition();
              recognitionRef.current = recognition;
              recognition.continuous = true;
              recognition.interimResults = true;
              recognition.lang = 'en-US';

              setIsListening(true);

              recognition.onresult = (event: any) => {
                // Only append finals from the current event burst — never re-iterate
                // older results, which would duplicate text.
                let newlyFinal = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                  if (event.results[i].isFinal) {
                    newlyFinal += event.results[i][0].transcript + ' ';
                  }
                }
                if (newlyFinal) {
                  setIntent(prev => prev + newlyFinal);
                }
              };

              recognition.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
                if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                  alert('Microphone permission denied. Enable in browser settings and try again.');
                } else if (event.error === 'no-speech') {
                  // Silent — common, no need to alert.
                } else if (event.error === 'network') {
                  alert('Network error during speech recognition. Check your connection.');
                } else if (event.error !== 'aborted') {
                  alert(`Speech recognition error: ${event.error}`);
                }
              };

              recognition.onend = () => {
                setIsListening(false);
                recognitionRef.current = null;
              };

              try {
                recognition.start();
              } catch (e) {
                console.error('Failed to start recognition', e);
                setIsListening(false);
                recognitionRef.current = null;
              }

              // Auto-stop after 2 minutes — long enough for verbose scopes (multi-camera installs,
              // multi-system jobs) without being so long that an abandoned mic burns the whole quota.
              setTimeout(() => {
                try { recognition.stop(); } catch { /* ignore */ }
              }, 120000);
            }}
            className={`flex items-center gap-2 px-4 py-2 font-bold text-xs uppercase tracking-wider transition-all ${isListening ? 'animate-pulse bg-red-600 text-white' : 'bg-[#008b8b] text-black hover:bg-[#20b2aa]'}`}
          >
            {isListening ? (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="6" /></svg>
                Listening...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                Voice Input
              </>
            )}
          </button>
        </div>
        <textarea
          className={`w-full h-40 bg-gray-50 border ${intentError ? 'border-red-500' : 'border-gray-800'} text-white p-6 focus:border-[#008b8b] outline-none transition-all resize-none shadow-inner text-lg placeholder-gray-700`}
          placeholder="Type your description here, or click 'Voice Input' to speak it. e.g., 'Add two cameras in the warehouse at column B4 and C6. Include cabling back to MDF-1.'"
          value={intent}
          onChange={(e) => {
            setIntent(e.target.value);
            if (intentError) setIntentError(null);
          }}
        />
        {intentError && (
          <p className="text-red-400 text-sm font-bold uppercase tracking-wider">{intentError}</p>
        )}
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <label className={`cursor-pointer bg-white/5 hover:bg-white/10 border border-gray-800 px-3 py-1.5 text-xs uppercase font-bold tracking-wider text-gray-400 hover:text-[#008b8b] transition-all ${attachmentBusy ? 'opacity-50 cursor-wait' : ''}`}>
              {attachmentBusy ? '⌛ Processing…' : '+ Attach Files'}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                // accept hint — browsers use this to filter the picker but
                // we still validate every file in handleFileChange (intakeFile).
                accept="image/*,application/pdf,.pdf,.docx,.xlsx,.txt,.csv,.tsv"
                className="hidden"
                onChange={handleFileChange}
                disabled={attachmentBusy}
              />
            </label>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">
              {attachments.length > 0
                ? `${attachments.length} of ${LIMITS.maxFiles} attached`
                : `Images · PDF · DOCX · XLSX · TXT · CSV (max ${LIMITS.maxFiles})`}
            </span>
          </div>
          {attachments.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {attachments.map((att, i) => (
                <div key={`${att.name}-${i}`} className="relative group bg-white/40 border border-gray-800 p-2 flex flex-col items-center justify-center text-center min-h-[80px]">
                  {att.kind === 'image' ? (
                    <img src={att.content} alt={att.name} className="w-full h-20 object-cover" />
                  ) : (
                    <>
                      <div className="text-2xl mb-1" aria-hidden="true">
                        {att.kind === 'pdf' ? '📄'
                          : att.mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ? '📊'
                          : att.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? '📝'
                          : '📃'}
                      </div>
                      <div className="text-[9px] text-gray-300 font-bold truncate w-full">{att.name}</div>
                      <div className="text-[8px] text-gray-500 uppercase tracking-widest mt-0.5">
                        {/* This block only renders when att.kind !== 'image' (handled above), so kind here is 'pdf' | 'text'. */}
                        {att.kind === 'pdf' ? 'PDF' : 'TEXT'}
                      </div>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => removeAttachment(i)}
                    className="absolute top-0 right-0 bg-red-600 text-white w-5 h-5 text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    aria-label={`Remove ${att.name}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Guidance Section */}
      <div className="p-6 bg-white/5 border border-gray-900 shadow-xl space-y-4">
        <h3 className="text-xs font-black text-[#008b8b] uppercase tracking-[0.3em] border-b border-gray-800 pb-2">Tips for Best Results</h3>
        <div className="text-sm text-gray-400 space-y-3">
          <p className="leading-relaxed">
            <span className="text-[#008b8b] font-bold">Be specific about manufacturers:</span> If you have a preferred brand, include it in your description.
            <span className="text-gray-500 italic"> Example: "Add 4 Axis cameras..." or "Run Panduit Cat6 cabling..."</span>
          </p>
          <p className="leading-relaxed">
            <span className="text-[#008b8b] font-bold">Include model numbers when known:</span> Specific models ensure accurate pricing and compatibility.
            <span className="text-gray-500 italic"> Example: "Install Axis P3245-V cameras" or "Use Leviton 6A250 jacks"</span>
          </p>
          <p className="leading-relaxed">
            <span className="text-[#008b8b] font-bold">Mention heights and distances:</span> Include ceiling heights (for lift requirements) and cable run lengths.
            <span className="text-gray-500 italic"> Example: "Cameras at 18ft ceiling height, approximately 150ft cable runs to MDF"</span>
          </p>
          <p className="leading-relaxed">
            <span className="text-[#008b8b] font-bold">If no manufacturer specified:</span> The system will select appropriate professional-grade equipment and maintain brand consistency within each system type.
          </p>
          <p className="leading-relaxed border-t border-gray-800 pt-3 mt-3">
            <span className="text-red-400 font-bold">🔻 DEDUCTIONS / CREDITS:</span> To remove or credit items, say <span className="text-gray-500 italic">"Remove 4 cameras from the existing quote"</span> or <span className="text-gray-500 italic">"Credit back the Cat6 cabling"</span>. The system will price them as negative credits that are subtracted from the total.
          </p>
          <p className="leading-relaxed border-t border-gray-800 pt-3 mt-3">
            <span className="text-[#008b8b] font-bold">⚡ NECA MLU Aligned:</span> Labor formulas are aligned with NECA Manual of Labor Units (MLU) standards, featuring Normal/Difficult/Very Difficult condition multipliers for accurate estimating.
          </p>
        </div>
      </div>

      <div className="space-y-4 pt-8 border-t border-gray-900">
        {loading && pipelineStatus && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#008b8b] font-bold">{pipelineStatus}</span>
              <span className="text-xs text-gray-500 font-mono">{pipelinePercent}%</span>
            </div>
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#008b8b] to-[#20b2aa] transition-all duration-500 ease-out rounded-full"
                style={{ width: `${pipelinePercent}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-600 uppercase tracking-widest">
              3-Brain Validation Pipeline: Estimator → Code Check → Pricing → QA Audit
            </p>
          </div>
        )}
        <div className="flex justify-end">
          <GoldButton
            onClick={handleSubmit}
            loading={loading}
            className="w-full md:w-auto"
          >
            Generate Validated Change Order
          </GoldButton>
        </div>
      </div>
    </div>
  );
};
